import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, RefreshCw, CheckCircle, Sparkles } from 'lucide-react';
import { useBatchAnalysis } from '../../hooks/useBatchAnalysis';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';

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
    status,
    progress,
    totalFiles,
    processedCount,
    successCount,
    errorCount,
    addFiles,
    removeFile,
    startUpload,
    cancelUpload,
    clear,
    updateQueueFileCategory,
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
  const handleStartUpload = useCallback(() => {
    if (queue.length === 0) {
      alert('Please add files first');
      return;
    }

    // Check that all files have categories selected
    const uncategorized = queue.filter(f => !f.category);
    if (uncategorized.length > 0) {
      alert('Please select a category for all items before uploading');
      return;
    }

    startUpload();
  }, [queue, startUpload]);

  /**
   * Handle complete and close
   */
  const handleComplete = useCallback(() => {
    clear();
    onComplete?.();
  }, [clear, onComplete]);

  /**
   * Handle cancel - unified cancel logic
   * - During processing (preprocessing/uploading): Stop and clear
   * - When idle with queue: Clear queue and close
   * - When idle without queue: Just close
   */
  const handleCancel = useCallback(() => {
    if (status === 'preprocessing' || status === 'uploading') {
      // Stop processing first
      cancelUpload();
    }
    // Always clear and close (whether we stopped processing or not)
    clear();
    onCancel?.();
  }, [status, cancelUpload, clear, onCancel]);

  // If upload is completed, show completion message
  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-4">Upload Complete!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Successfully added {successCount} items to your wardrobe.
              {errorCount > 0 && ` (${errorCount} failed)`}
            </p>
            <Button onClick={handleComplete}>
              Return to Wardrobe
            </Button>
          </div>
        </div>
      </div>
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

                {/* AI Confidence Badge (top-left) */}
                {queuedFile.aiStatus === 'success' && queuedFile.aiConfidence !== undefined && (
                  <div className={`absolute top-2 left-2 z-30 px-2 py-1 rounded-full shadow-sm flex items-center gap-1 ${
                    queuedFile.aiConfidence >= 0.8
                      ? 'bg-green-500 text-white'
                      : queuedFile.aiConfidence >= 0.5
                      ? 'bg-yellow-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    <span className="text-xs font-semibold">{(queuedFile.aiConfidence * 100).toFixed(0)}%</span>
                  </div>
                )}

                {/* Category selector for each queued file (pre-analysis) */}
                {(status === 'idle' || status === 'cancelled') && (
                  <div className="absolute bottom-2 left-2 right-2 z-20 bg-white/95 dark:bg-gray-800/95 rounded-md p-1.5 shadow-lg">
                    <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-1 px-1">
                      {queuedFile.aiStatus === 'success' && queuedFile.category
                        ? '✨ AI suggested'
                        : queuedFile.aiStatus === 'failed'
                        ? '⚠️ AI failed - select manually'
                        : 'Select category'}
                    </div>
                    <select
                      value={queuedFile.category ?? ''}
                      onChange={(e) => updateQueueFileCategory(queuedFile.id, e.target.value ? (e.target.value as any) : null)}
                      className="w-full text-xs font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-800 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-uw-purple dark:hover:border-uw-purple transition-colors [&>option]:text-gray-900 dark:[&>option]:text-white [&>option]:bg-white dark:[&>option]:bg-gray-800"
                      aria-label="Select category"
                    >
                      <option value="">Category</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="shoes">Shoes</option>
                      <option value="outerwear">Outerwear</option>
                      <option value="accessory">Accessory</option>
                    </select>
                  </div>
                )}

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
                {(status === 'preprocessing' || status === 'uploading') && (
                  <div className="absolute inset-0 bg-black/40 dark:bg-black/40 flex items-center justify-center z-40">
                    <div className="text-center px-4">
                      <LoadingSpinner size="sm" />
                      <div className="mt-3 text-white font-semibold">
                        {status === 'uploading' ? 'Adding to wardrobe...' : 'Preprocessing...'}
                      </div>
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
        {(status === 'preprocessing' || status === 'uploading') && (
          <div className="mt-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-uw-purple" />
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {status === 'uploading'
                      ? 'Saving to wardrobe...'
                      : 'Analyzing with AI...'} {processedCount} / {totalFiles} ({progress}%)
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                  <div
                    className="bg-uw-purple h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <Button variant="outline" onClick={handleCancel} className="min-w-[96px]">
                Cancel
              </Button>
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
            <>
              <button
                onClick={handleStartUpload}
                className="
                  flex-1 bg-uw-purple text-white px-6 py-3 rounded-lg
                  font-medium hover:bg-uw-purple/90 transition-colors
                "
              >
                Upload to Wardrobe
              </button>
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
                Clear Queue
              </button>
            </>
          )}

          {status === 'idle' && queue.length === 0 && (
            <button
              onClick={handleCancel}
              className="
                flex-1 px-6 py-3 rounded-lg font-medium
                border border-gray-300 dark:border-gray-700
                text-gray-700 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                transition-colors
              "
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
