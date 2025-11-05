import { useState, useCallback, useRef } from 'react';
import { AIClothingAnalysis, ClothingCategory } from '../types';
import { analyzeClothing } from '../services/api';
import { convertImageIfNeeded } from '../utils/imageFormatConverter';
import { processImageForAI } from '../utils/backgroundRemoval';

export interface QueuedFile {
  id: string;
  file: File;
  preview: string; // Base64 preview for UI
  originalName: string;
}

export interface AnalysisResult {
  id: string;
  analysis: AIClothingAnalysis;
  status: 'success' | 'error';
  error?: string;
  confidence?: number;
}

export type BatchStatus = 'idle' | 'processing' | 'paused' | 'completed' | 'cancelled';

interface BatchAnalysisState {
  queue: QueuedFile[];
  results: Map<string, AnalysisResult>;
  currentIndex: number;
  status: BatchStatus;
  totalFiles: number;
  processedCount: number;
  successCount: number;
  errorCount: number;
}

interface UseBatchAnalysisReturn {
  // State
  queue: QueuedFile[];
  results: Map<string, AnalysisResult>;
  status: BatchStatus;
  progress: number; // 0-100
  currentIndex: number;
  totalFiles: number;
  processedCount: number;
  successCount: number;
  errorCount: number;

  // Actions
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (fileId: string) => void;
  startAnalysis: () => void;
  pauseAnalysis: () => void;
  cancelAnalysis: () => void;
  retryFailed: () => void;
  clear: () => void;
  updateResult: (fileId: string, updates: Partial<AIClothingAnalysis>) => void;
}

const MAX_BATCH_SIZE = 20; // Limit to prevent API abuse
const BATCH_CHUNK_SIZE = 5; // Process 5 at a time in parallel
const DELAY_BETWEEN_BATCHES = 500; // 500ms delay between batch chunks

/**
 * Hook for managing batch AI clothing analysis
 *
 * Features:
 * - Queue management for multiple files
 * - Parallel processing (5 images at a time)
 * - Pause/resume/cancel support
 * - Retry failed analyses
 * - Progress tracking
 * - Result editing
 */
export const useBatchAnalysis = (): UseBatchAnalysisReturn => {
  const [state, setState] = useState<BatchAnalysisState>({
    queue: [],
    results: new Map(),
    currentIndex: 0,
    status: 'idle',
    totalFiles: 0,
    processedCount: 0,
    successCount: 0,
    errorCount: 0,
  });

  // Use ref to track if processing should continue (for pause/cancel)
  const shouldContinueRef = useRef(true);

  /**
   * Generate unique ID for file
   */
  const generateFileId = (file: File, index: number): string => {
    return `${Date.now()}-${index}-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  /**
   * Create preview URL for file
   */
  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Add files to the queue
   */
  const addFiles = useCallback(async (files: File[]) => {
    // Enforce max batch size
    const filesToAdd = files.slice(0, MAX_BATCH_SIZE);

    if (files.length > MAX_BATCH_SIZE) {
      console.warn(`Batch size limited to ${MAX_BATCH_SIZE} files. ${files.length - MAX_BATCH_SIZE} files ignored.`);
    }

    // Create queued files with previews
    const queuedFiles: QueuedFile[] = await Promise.all(
      filesToAdd.map(async (file, index) => ({
        id: generateFileId(file, index),
        file,
        preview: await createPreview(file),
        originalName: file.name,
      }))
    );

    setState((prev) => ({
      ...prev,
      queue: [...prev.queue, ...queuedFiles],
      totalFiles: prev.totalFiles + queuedFiles.length,
    }));
  }, []);

  /**
   * Remove a file from the queue
   */
  const removeFile = useCallback((fileId: string) => {
    setState((prev) => {
      const newQueue = prev.queue.filter((f) => f.id !== fileId);
      const newResults = new Map(prev.results);
      newResults.delete(fileId);

      return {
        ...prev,
        queue: newQueue,
        results: newResults,
        totalFiles: newQueue.length,
      };
    });
  }, []);

  /**
   * Process a single file
   * Phase 11B: Now includes automatic background removal
   */
  const processFile = async (queuedFile: QueuedFile): Promise<AnalysisResult> => {
    try {
      // Step 1: Convert image format if needed (HEIC, WebP, etc.)
      const convertedFile = await convertImageIfNeeded(queuedFile.file);

      // Step 2: Background removal (Phase 11B - ALWAYS RUNS)
      console.log(`Phase 11B: Processing ${queuedFile.originalName} with background removal...`);
      const backgroundRemovedBlob = await processImageForAI(convertedFile);

      // Step 3: Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(backgroundRemovedBlob);
      });

      const base64Image = await base64Promise;

      // Step 4: Call AI analysis API (with background-removed image)
      const response = await analyzeClothing({ image: base64Image });

      if (!response.success || !response.analysis) {
        throw new Error(response.error || 'Analysis failed');
      }

      // Phase 11B: Use confidence from API response
      const confidence = response.analysis.confidence ?? 1.0;

      return {
        id: queuedFile.id,
        analysis: response.analysis,
        status: 'success',
        confidence,
      };
    } catch (error) {
      console.error(`Failed to analyze ${queuedFile.originalName}:`, error);

      return {
        id: queuedFile.id,
        analysis: {
          suggestedCategory: 'top' as ClothingCategory,
          description: '',
          detectedColors: [],
          suggestedStyles: [],
          season: 'all-season',
          formality: 'casual',
        },
        status: 'error',
        error: error instanceof Error ? error.message : 'Analysis failed',
        confidence: 0,
      };
    }
  };

  /**
   * Process files in parallel batches
   */
  const processBatch = async (files: QueuedFile[]): Promise<void> => {
    // Process in chunks of BATCH_CHUNK_SIZE
    for (let i = 0; i < files.length; i += BATCH_CHUNK_SIZE) {
      // Check if we should continue processing
      if (!shouldContinueRef.current) {
        break;
      }

      const chunk = files.slice(i, i + BATCH_CHUNK_SIZE);

      // Process chunk in parallel
      const chunkResults = await Promise.all(chunk.map(processFile));

      // Update state with results
      setState((prev) => {
        const newResults = new Map(prev.results);
        let newSuccessCount = prev.successCount;
        let newErrorCount = prev.errorCount;

        chunkResults.forEach((result) => {
          newResults.set(result.id, result);
          if (result.status === 'success') {
            newSuccessCount++;
          } else {
            newErrorCount++;
          }
        });

        return {
          ...prev,
          results: newResults,
          currentIndex: i + chunk.length,
          processedCount: prev.processedCount + chunk.length,
          successCount: newSuccessCount,
          errorCount: newErrorCount,
        };
      });

      // Delay between batches (rate limiting)
      if (i + BATCH_CHUNK_SIZE < files.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
  };

  /**
   * Start analysis
   */
  const startAnalysis = useCallback(async () => {
    if (state.queue.length === 0) {
      console.warn('No files in queue to analyze');
      return;
    }

    shouldContinueRef.current = true;
    setState((prev) => ({ ...prev, status: 'processing' }));

    await processBatch(state.queue);

    setState((prev) => ({
      ...prev,
      status: shouldContinueRef.current ? 'completed' : prev.status,
    }));
  }, [state.queue]);

  /**
   * Pause analysis
   */
  const pauseAnalysis = useCallback(() => {
    shouldContinueRef.current = false;
    setState((prev) => ({ ...prev, status: 'paused' }));
  }, []);

  /**
   * Cancel analysis
   */
  const cancelAnalysis = useCallback(() => {
    shouldContinueRef.current = false;
    setState((prev) => ({
      ...prev,
      status: 'cancelled',
    }));
  }, []);

  /**
   * Retry failed analyses
   */
  const retryFailed = useCallback(async () => {
    const failedFiles = state.queue.filter((file) => {
      const result = state.results.get(file.id);
      return result?.status === 'error';
    });

    if (failedFiles.length === 0) {
      console.warn('No failed files to retry');
      return;
    }

    shouldContinueRef.current = true;
    setState((prev) => ({ ...prev, status: 'processing' }));

    await processBatch(failedFiles);

    setState((prev) => ({
      ...prev,
      status: 'completed',
    }));
  }, [state.queue, state.results]);

  /**
   * Clear all queue and results
   */
  const clear = useCallback(() => {
    setState({
      queue: [],
      results: new Map(),
      currentIndex: 0,
      status: 'idle',
      totalFiles: 0,
      processedCount: 0,
      successCount: 0,
      errorCount: 0,
    });
  }, []);

  /**
   * Update a result (for manual editing)
   */
  const updateResult = useCallback((fileId: string, updates: Partial<AIClothingAnalysis>) => {
    setState((prev) => {
      const newResults = new Map(prev.results);
      const existingResult = newResults.get(fileId);

      if (existingResult) {
        newResults.set(fileId, {
          ...existingResult,
          analysis: {
            ...existingResult.analysis,
            ...updates,
          },
        });
      }

      return { ...prev, results: newResults };
    });
  }, []);

  // Calculate progress percentage
  const progress = state.totalFiles > 0
    ? Math.round((state.processedCount / state.totalFiles) * 100)
    : 0;

  return {
    // State
    queue: state.queue,
    results: state.results,
    status: state.status,
    progress,
    currentIndex: state.currentIndex,
    totalFiles: state.totalFiles,
    processedCount: state.processedCount,
    successCount: state.successCount,
    errorCount: state.errorCount,

    // Actions
    addFiles,
    removeFile,
    startAnalysis,
    pauseAnalysis,
    cancelAnalysis,
    retryFailed,
    clear,
    updateResult,
  };
};
