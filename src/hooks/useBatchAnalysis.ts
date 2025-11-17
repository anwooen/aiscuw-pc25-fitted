import { ClothingCategory } from '../types';
import { useStore } from '../store/useStore';

// Re-export types from types/index.ts for backward compatibility
export type { QueuedFile, BatchStatus } from '../types';

// Legacy type for BatchAnalysisResults.tsx (not currently used)
export interface AnalysisResult {
  id: string;
  status: 'success' | 'error';
  analysis?: any;
  confidence?: number;
  error?: string;
}

interface UseBatchAnalysisReturn {
  // State
  queue: any[];
  status: any;
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

/**
 * Phase 18: Refactored to use global Zustand store
 *
 * Hook for managing batch AI clothing analysis
 *
 * Features:
 * - Queue management for multiple files
 * - Parallel processing (5 images at a time)
 * - Pause/resume/cancel support
 * - Progress tracking
 * - Upload continues in background when switching tabs (global store)
 *
 * All logic moved to Zustand store for global persistence
 */
export const useBatchAnalysis = (): UseBatchAnalysisReturn => {
  // Phase 18: Use global store instead of local state
  const queue = useStore((state) => state.batchUploadQueue);
  const status = useStore((state) => state.batchUploadStatus);
  const progressData = useStore((state) => state.batchUploadProgress);
  const addFiles = useStore((state) => state.addBatchFiles);
  const removeFile = useStore((state) => state.removeBatchFile);
  const updateQueueFileCategory = useStore((state) => state.updateBatchFileCategory);
  const startUpload = useStore((state) => state.startBatchUpload);
  const cancelUpload = useStore((state) => state.cancelBatchUpload);
  const clear = useStore((state) => state.clearBatchQueue);

  // Calculate progress percentage
  const progress = progressData.totalFiles > 0
    ? Math.round((progressData.processedCount / progressData.totalFiles) * 100)
    : 0;

  return {
    // State
    queue,
    status,
    progress,
    totalFiles: progressData.totalFiles,
    processedCount: progressData.processedCount,
    successCount: progressData.successCount,
    errorCount: progressData.errorCount,

    // Actions
    addFiles,
    removeFile,
    startUpload,
    cancelUpload,
    clear,
    updateQueueFileCategory,
  };
};
