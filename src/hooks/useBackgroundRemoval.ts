import { useState, useCallback } from 'react';
import { processImageForAI, blobToFile, hasTransparentBackground } from '../utils/backgroundRemoval';

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface BackgroundRemovalState {
  status: ProcessingStatus;
  progress: number;
  stage: string;
  processedImage: File | null;
  originalImage: File | null;
  hasTransparency: boolean;
  error: string | null;
}

export interface UseBackgroundRemovalReturn extends BackgroundRemovalState {
  processImage: (file: File) => Promise<File>;
  reset: () => void;
}

/**
 * React hook for automatic background removal
 * Manages loading states, progress tracking, and error handling
 */
export function useBackgroundRemoval(): UseBackgroundRemovalReturn {
  const [state, setState] = useState<BackgroundRemovalState>({
    status: 'idle',
    progress: 0,
    stage: '',
    processedImage: null,
    originalImage: null,
    hasTransparency: false,
    error: null,
  });

  const processImage = useCallback(async (file: File): Promise<File> => {
    // Reset state
    setState({
      status: 'processing',
      progress: 0,
      stage: 'Starting...',
      processedImage: null,
      originalImage: file,
      hasTransparency: false,
      error: null,
    });

    try {
      // Process image with background removal
      const processedBlob = await processImageForAI(
        file,
        (progress, stage) => {
          setState((prev) => ({
            ...prev,
            progress,
            stage,
          }));
        }
      );

      // Convert blob back to file
      const processedFile = blobToFile(processedBlob, file.name);

      // Check if background was actually removed (has transparency)
      const hasTransparency = await hasTransparentBackground(processedBlob);

      setState({
        status: 'success',
        progress: 100,
        stage: 'Complete!',
        processedImage: processedFile,
        originalImage: file,
        hasTransparency,
        error: null,
      });

      return processedFile;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      setState({
        status: 'error',
        progress: 0,
        stage: 'Failed',
        processedImage: null,
        originalImage: file,
        hasTransparency: false,
        error: errorMessage,
      });

      // Return original file on error
      return file;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      stage: '',
      processedImage: null,
      originalImage: null,
      hasTransparency: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    processImage,
    reset,
  };
}

/**
 * Batch background removal hook
 * Process multiple images sequentially with combined progress
 */
export function useBatchBackgroundRemoval() {
  const [state, setState] = useState<{
    status: ProcessingStatus;
    totalProgress: number;
    currentIndex: number;
    totalImages: number;
    processedImages: File[];
    errors: Array<{ index: number; error: string }>;
  }>({
    status: 'idle',
    totalProgress: 0,
    currentIndex: 0,
    totalImages: 0,
    processedImages: [],
    errors: [],
  });

  const processBatch = useCallback(async (files: File[]): Promise<File[]> => {
    setState({
      status: 'processing',
      totalProgress: 0,
      currentIndex: 0,
      totalImages: files.length,
      processedImages: [],
      errors: [],
    });

    const results: File[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    for (let i = 0; i < files.length; i++) {
      setState((prev) => ({
        ...prev,
        currentIndex: i,
        totalProgress: Math.round((i / files.length) * 100),
      }));

      try {
        const processedBlob = await processImageForAI(files[i]);
        const processedFile = blobToFile(processedBlob, files[i].name);
        results.push(processedFile);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ index: i, error: errorMessage });
        // Use original file on error
        results.push(files[i]);
      }
    }

    setState({
      status: errors.length === files.length ? 'error' : 'success',
      totalProgress: 100,
      currentIndex: files.length,
      totalImages: files.length,
      processedImages: results,
      errors,
    });

    return results;
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      totalProgress: 0,
      currentIndex: 0,
      totalImages: 0,
      processedImages: [],
      errors: [],
    });
  }, []);

  return {
    ...state,
    processBatch,
    reset,
  };
}
