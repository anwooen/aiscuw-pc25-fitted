import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useBatchAnalysis } from '../../hooks/useBatchAnalysis';
import { BatchAnalysisResults } from './BatchAnalysisResults';

interface BatchUploadProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const MAX_FILES = 20;

/**
 * BatchUpload Component
 *
 * Allows users to upload multiple clothing images at once
 * Features:
 * - Drag & drop support
 * - Thumbnail grid preview
 * - Queue management
 * - Progress tracking
 */
export const BatchUpload: React.FC<BatchUploadProps> = ({ onComplete, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    queue,
    results,
    status,
    progress,
    totalFiles,
    processedCount,
    successCount,
    errorCount,
    addFiles,
    removeFile,
    startAnalysis,
    pauseAnalysis,
    cancelAnalysis,
    retryFailed,
    clear,
    updateResult,
  } = useBatchAnalysis();

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Filter only image files
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      alert('Please select valid image files');
      return;
    }

    // Check if adding files would exceed max
    if (queue.length + imageFiles.length > MAX_FILES) {
      alert(`Maximum ${MAX_FILES} files allowed. Only adding first ${MAX_FILES - queue.length} files.`);
    }

    await addFiles(imageFiles);
  }, [addFiles, queue.length]);

  /**
   * Handle drag events
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    await handleFileSelect(files);
  }, [handleFileSelect]);

  /**
   * Handle click on upload zone
   */
  const handleUploadZoneClick = useCallback(() => {
    if (status === 'idle' || status === 'cancelled') {
      fileInputRef.current?.click();
    }
  }, [status]);

  /**
   * Handle start analysis
   */
  const handleStartAnalysis = useCallback(() => {
    if (queue.length === 0) {
      alert('Please add files first');
      return;
    }

    startAnalysis();
  }, [queue.length, startAnalysis]);

  /**
   * Handle complete and close
   */
  const handleComplete = useCallback(() => {
    clear();
    onComplete?.();
  }, [clear, onComplete]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    if (status === 'processing') {
      cancelAnalysis();
    } else {
      clear();
      onCancel?.();
    }
  }, [status, cancelAnalysis, clear, onCancel]);

  // If analysis is completed, show results
  if (status === 'completed' || (status === 'paused' && processedCount > 0)) {
    return (
      <BatchAnalysisResults
        results={results}
        queue={queue}
        onComplete={handleComplete}
        onRetry={retryFailed}
        onUpdateResult={updateResult}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Batch Upload
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload up to {MAX_FILES} clothing items at once
          </p>
        </div>

        {/* Upload Zone */}
        {(status === 'idle' || status === 'cancelled') && (
          <div
            onClick={handleUploadZoneClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-all duration-200
              ${isDragging
                ? 'border-uw-purple bg-uw-purple/10 dark:bg-uw-purple/20'
                : 'border-gray-300 dark:border-gray-700 hover:border-uw-purple dark:hover:border-uw-purple'
              }
              ${queue.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isDragging ? 'Drop images here' : 'Drag & drop images'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Supports: JPEG, PNG, HEIC, WebP, BMP, GIF
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={queue.length >= MAX_FILES}
            />
          </div>
        )}

        {/* File Count */}
        {queue.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon size={20} className="text-uw-purple" />
              <span className="text-gray-900 dark:text-white font-medium">
                {queue.length} / {MAX_FILES} files
              </span>
            </div>

            {queue.length >= MAX_FILES && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                <AlertCircle size={16} />
                <span className="text-sm">Maximum files reached</span>
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Grid */}
        {queue.length > 0 && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {queue.map((queuedFile) => (
              <div
                key={queuedFile.id}
                className="relative group aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden"
              >
                {/* Preview Image */}
                <img
                  src={queuedFile.preview}
                  alt={queuedFile.originalName}
                  className="w-full h-full object-cover"
                />

                {/* Remove Button */}
                {(status === 'idle' || status === 'cancelled') && (
                  <button
                    onClick={() => removeFile(queuedFile.id)}
                    className="
                      absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full
                      opacity-0 group-hover:opacity-100 transition-opacity
                      hover:bg-red-600
                    "
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Processing Status */}
                {status === 'processing' && results.has(queuedFile.id) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-sm font-medium">
                      {results.get(queuedFile.id)?.status === 'success' ? '✓' : '✗'}
                    </div>
                  </div>
                )}

                {/* File Name Tooltip */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                  {queuedFile.originalName}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        {status === 'processing' && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Analyzing images...
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {processedCount} / {totalFiles} ({progress}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-uw-purple h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-green-600 dark:text-green-500">
                ✓ {successCount} success
              </span>
              {errorCount > 0 && (
                <span className="text-red-600 dark:text-red-500">
                  ✗ {errorCount} failed
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {status === 'idle' && queue.length > 0 && (
            <button
              onClick={handleStartAnalysis}
              className="
                flex-1 bg-uw-purple text-white px-6 py-3 rounded-lg
                font-medium hover:bg-uw-purple/90 transition-colors
              "
            >
              Start Analysis
            </button>
          )}

          {status === 'processing' && (
            <button
              onClick={pauseAnalysis}
              className="
                flex-1 bg-amber-500 text-white px-6 py-3 rounded-lg
                font-medium hover:bg-amber-600 transition-colors
              "
            >
              Pause
            </button>
          )}

          {status === 'paused' && (
            <button
              onClick={startAnalysis}
              className="
                flex-1 bg-uw-purple text-white px-6 py-3 rounded-lg
                font-medium hover:bg-uw-purple/90 transition-colors
              "
            >
              Resume
            </button>
          )}

          <button
            onClick={handleCancel}
            className="
              px-6 py-3 rounded-lg font-medium
              border border-gray-300 dark:border-gray-700
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-colors
            "
          >
            {status === 'processing' ? 'Cancel' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
