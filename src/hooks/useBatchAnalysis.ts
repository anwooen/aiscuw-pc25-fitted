import { useState, useCallback, useRef } from 'react';
import { ClothingCategory, AIClothingAnalysis } from '../types';
import { convertImageIfNeeded } from '../utils/imageFormatConverter';
import { processImageForAI } from '../utils/backgroundRemoval';
import { compressImage, extractColors } from '../utils/imageCompression';
import { saveImage } from '../utils/storage';
import { useStore } from '../store/useStore';
import { analyzeClothing } from '../services/api';

export interface QueuedFile {
  id: string;
  file: File;
  preview: string; // Base64 preview for UI
  originalName: string;
  category?: ClothingCategory;
  // If we've preprocessed the image (converted + background removed), keep it to avoid redoing work
  processedBlob?: Blob;
  processedBase64?: string;
  // AI analysis fields (Phase 14)
  aiAnalysis?: AIClothingAnalysis;
  aiConfidence?: number;
  aiStatus?: 'pending' | 'analyzing' | 'success' | 'failed';
}

// Legacy type for BatchAnalysisResults.tsx (not currently used)
export interface AnalysisResult {
  id: string;
  status: 'success' | 'error';
  analysis?: AIClothingAnalysis;
  confidence?: number;
  error?: string;
}

export type BatchStatus = 'idle' | 'preprocessing' | 'uploading' | 'completed' | 'cancelled';

interface BatchAnalysisState {
  queue: QueuedFile[];
  status: BatchStatus;
  totalFiles: number;
  processedCount: number;
  successCount: number;
  errorCount: number;
}

interface UseBatchAnalysisReturn {
  // State
  queue: QueuedFile[];
  status: BatchStatus;
  progress: number; // 0-100
  totalFiles: number;
  processedCount: number;
  successCount: number;
  errorCount: number;

  // Actions
  addFiles: (files: File[]) => Promise<void>;
  removeFile: (fileId: string) => void;
  startUpload: () => void;
  cancelUpload: () => void;
  clear: () => void;
  updateQueueFileCategory: (fileId: string, category: ClothingCategory | null) => void;
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
  const { addClothingItem } = useStore();
  
  const [state, setState] = useState<BatchAnalysisState>({
    queue: [],
    status: 'idle',
    totalFiles: 0,
    processedCount: 0,
    successCount: 0,
    errorCount: 0,
  });

  // Use ref to track if processing should continue
  const shouldContinueRef = useRef(true);
  // Keep a ref copy of the queue to avoid stale closures
  const queueRef = useRef<QueuedFile[]>([]);

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
    // Use current queue length to compute remaining space
    const currentQueueLength = queueRef.current.length;
    const remaining = Math.max(MAX_BATCH_SIZE - currentQueueLength, 0);

    if (remaining <= 0) {
      console.warn('Batch queue full - no files added');
      return;
    }

    const filesToProcess = files.slice(0, remaining);
    const queuedFiles: QueuedFile[] = [];

    // Set state to preprocessing and update total files
    setState(prev => ({
      ...prev,
      status: 'preprocessing',
      totalFiles: filesToProcess.length,
      processedCount: 0,
      successCount: 0,
      errorCount: 0
    }));

    // Get user profile for AI analysis
    const profile = useStore.getState().profile;

    // Process each file sequentially and update progress
    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      const id = generateFileId(file, i + currentQueueLength);

      try {
        // Convert format if needed (HEIC, WebP, etc.)
        const converted = await convertImageIfNeeded(file);

        // Run background removal now so the preview matches what's analyzed
        const processedBlob = await processImageForAI(converted);

        // Create base64 preview from processed blob
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(processedBlob);
        });

        // Phase 14: Run AI analysis in parallel with preprocessing
        let aiAnalysis: AIClothingAnalysis | undefined;
        let aiConfidence: number | undefined;
        let aiStatus: 'pending' | 'analyzing' | 'success' | 'failed' = 'pending';
        let suggestedCategory: ClothingCategory | undefined;

        try {
          aiStatus = 'analyzing';
          const aiResult = await analyzeClothing({
            image: base64,
            userPreferences: profile.stylePreferences,
          });

          if (aiResult.success && aiResult.analysis) {
            aiAnalysis = aiResult.analysis;
            aiConfidence = aiResult.analysis.confidence;
            suggestedCategory = aiResult.analysis.suggestedCategory;
            aiStatus = 'success';
            console.log(`AI analysis success for ${file.name}: ${suggestedCategory} (${(aiConfidence! * 100).toFixed(0)}% confident)`);
          } else {
            aiStatus = 'failed';
            console.warn(`AI analysis failed for ${file.name}:`, aiResult.error);
          }
        } catch (aiErr) {
          aiStatus = 'failed';
          console.error(`AI analysis error for ${file.name}:`, aiErr);
        }

          // Add the successfully processed file to queue
          queuedFiles.push({
            id,
            file,
            preview: base64,
            originalName: file.name,
            processedBlob,
            processedBase64: base64,
            // AI fields
            aiAnalysis,
            aiConfidence,
            aiStatus,
            category: suggestedCategory, // Auto-fill category from AI!
          });

          // Update progress after successful processing
          setState(prev => ({
            ...prev,
            processedCount: prev.processedCount + 1,
            successCount: prev.successCount + 1
          }));
        } catch (err) {
          console.error(`Failed to process ${file.name}:`, err);
          // If preprocessing fails, try to create a basic preview
          try {
            const fallbackPreview = await createPreview(file);
            queuedFiles.push({
              id,
              file,
              preview: fallbackPreview,
              originalName: file.name,
              aiStatus: 'failed',
            });
          } catch (previewErr) {
            console.error(`Failed to create preview for ${file.name}:`, previewErr);
          }
          setState(prev => ({
            ...prev,
            processedCount: prev.processedCount + 1,
            errorCount: prev.errorCount + 1
          }));
        }
    }

    // Update queue with processed files
    setState(prev => {
      const newQueue = [...prev.queue, ...queuedFiles];
      queueRef.current = newQueue;
      return {
        ...prev,
        queue: newQueue,
        status: 'idle'
      };
    });
  }, []);

  /**
   * Remove a file from the queue
   */
  const removeFile = useCallback((fileId: string) => {
    setState((prev) => {
      const newQueue = prev.queue.filter((f) => f.id !== fileId);
      queueRef.current = newQueue;

      return {
        ...prev,
        queue: newQueue,
      };
    });
  }, []);

  /**
   * Update category selection on a queued file (pre-analysis)
   */
  const updateQueueFileCategory = useCallback((fileId: string, category: ClothingCategory | null) => {
    setState((prev) => {
      const newQueue = prev.queue.map((q) => (q.id === fileId ? { ...q, category: category ?? undefined } : q));
      queueRef.current = newQueue;
      return { ...prev, queue: newQueue };
    });
  }, []);

  /**
   * Process and upload a single file to the wardrobe
   */
  const processFile = async (queuedFile: QueuedFile): Promise<{ id: string; status: 'success' | 'error' }> => {
    try {
      if (!queuedFile.category) {
        throw new Error('Category not selected');
      }

      // If preprocessing already produced a processed blob/base64, reuse it
      let processedBlob: Blob;
      if (queuedFile.processedBlob) {
        processedBlob = queuedFile.processedBlob;
      } else {
      // Step 1: Convert format if needed
      const convertedFile = await convertImageIfNeeded(queuedFile.file);
      // Step 2: Background removal
      processedBlob = await processImageForAI(convertedFile);
      }

      // Step 3: Convert blob to file for compression and color extraction
      const processedFile = new File([processedBlob], queuedFile.originalName, {
        type: processedBlob.type
      });
      
      // Step 4: Extract colors
      const colors = await extractColors(processedFile);
      
      // Step 5: Compress for storage
      const compressedBlob = await compressImage(processedFile);
      
      // Step 6: Save to storage
      const imageId = `${Date.now()}-${queuedFile.id}`;
      await saveImage(imageId, compressedBlob);

      // Step 7: Add to store with colors
      addClothingItem({
        id: imageId,
        image: imageId,
        category: queuedFile.category,
        uploadedAt: new Date(),
        colors: colors,
      });      return {
        id: queuedFile.id,
        status: 'success'
      };
    } catch (error) {
      console.error(`Failed to process ${queuedFile.originalName}:`, error);
      return {
        id: queuedFile.id,
        status: 'error'
      };
    }
  };

  /**
   * Process files in parallel batches
   */
  const processBatch = async (files: QueuedFile[]): Promise<void> => {
    // Process in chunks
    for (let i = 0; i < files.length; i += BATCH_CHUNK_SIZE) {
      if (!shouldContinueRef.current) {
        break;
      }

      const chunk = files.slice(i, i + BATCH_CHUNK_SIZE);
      const chunkResults = await Promise.all(chunk.map(processFile));

      // Update state
      setState((prev) => {
        // Count successes and errors from this chunk
        const chunkSuccesses = chunkResults.filter(r => r.status === 'success').length;
        const chunkErrors = chunkResults.filter(r => r.status === 'error').length;

        return {
          ...prev,
          processedCount: prev.processedCount + chunk.length,
          successCount: prev.successCount + chunkSuccesses,
          errorCount: prev.errorCount + chunkErrors,
        };
      });

      // Rate limiting delay
      if (i + BATCH_CHUNK_SIZE < files.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }
  };

  /**
   * Start upload process
   */
  const startUpload = useCallback(async () => {
    const queueToProcess = queueRef.current.length > 0 ? queueRef.current : state.queue;

    if (queueToProcess.length === 0) {
      console.warn('No files in queue to process');
      return;
    }

    shouldContinueRef.current = true;
    setState((prev) => ({ 
      ...prev, 
      status: 'preprocessing',
      totalFiles: queueToProcess.length,  // Set correct total files count
      processedCount: 0,                  // Reset counters
      successCount: 0,
      errorCount: 0
    }));

    await processBatch(queueToProcess);
    
    setState((prev) => ({ ...prev, status: 'uploading' }));

    // Additional delay to show upload progress
    await new Promise(resolve => setTimeout(resolve, 1000));

    setState((prev) => ({
      ...prev,
      status: shouldContinueRef.current ? 'completed' : prev.status,
    }));
  }, [state.queue]);

  /**
   * Cancel upload
   */
  const cancelUpload = useCallback(() => {
    shouldContinueRef.current = false;
    setState((prev) => ({
      ...prev,
      status: 'cancelled',
    }));
  }, []);

  /**
   * Clear all queue
   */
  const clear = useCallback(() => {
    queueRef.current = [];
    setState({
      queue: [],
      status: 'idle',
      totalFiles: 0,
      processedCount: 0,
      successCount: 0,
      errorCount: 0,
    });
  }, []);

  // Calculate progress percentage
  const progress = state.totalFiles > 0
    ? Math.round((state.processedCount / state.totalFiles) * 100)
    : 0;

  return {
    // State
    queue: state.queue,
    status: state.status,
    progress,
    totalFiles: state.totalFiles,
    processedCount: state.processedCount,
    successCount: state.successCount,
    errorCount: state.errorCount,

    // Actions
    addFiles,
    removeFile,
    startUpload,
    cancelUpload,
    clear,
    updateQueueFileCategory,
  };
};
