import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, RefreshCw, CheckCircle, BarChart3, Download, Trash2 } from 'lucide-react';
import { useBatchAnalysis } from '../../hooks/useBatchAnalysis';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useStore } from '../../store/useStore';
import { logComparisonTable, exportMetrics, clearMetrics } from '../../utils/processingMetrics';

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

  // Store state for processing mode
  const processingMode = useStore((state) => state.processingMode);
  const setProcessingMode = useStore((state) => state.setProcessingMode);

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
   * Metrics handlers for A/B testing
   */
  const handleViewMetrics = useCallback(() => {
    logComparisonTable();
  }, []);

  const handleExportMetrics = useCallback(() => {
    const json = exportMetrics();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitted-metrics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleClearMetrics = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all metrics? This cannot be undone.')) {
      clearMetrics();
    }
  }, []);

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

        {/* Processing Mode Selector */}
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
            Processing Mode:
          </label>
          <div className="space-y-3">
            <label className="flex items-start cursor-pointer group">
              <input
                type="radio"
                name="processingMode"
                value="fast"
                checked={processingMode === 'fast'}
                onChange={(e) => setProcessingMode(e.target.value as 'fast' | 'quality')}
                className="mt-1 w-4 h-4 text-uw-purple focus:ring-uw-purple focus:ring-2"
              />
              <span className="ml-3 flex-1">
                <span className="block text-gray-900 dark:text-white font-medium">
                  ⚡ Fast Crop <span className="text-xs text-gray-500 dark:text-gray-400">(200-500ms/image)</span>
                </span>
                <span className="block text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Smart cropping without background removal - Recommended for speed
                </span>
              </span>
            </label>

            <label className="flex items-start cursor-pointer group">
              <input
                type="radio"
                name="processingMode"
                value="quality"
                checked={processingMode === 'quality'}
                onChange={(e) => setProcessingMode(e.target.value as 'fast' | 'quality')}
                className="mt-1 w-4 h-4 text-uw-purple focus:ring-uw-purple focus:ring-2"
              />
              <span className="ml-3 flex-1">
                <span className="block text-gray-900 dark:text-white font-medium">
                  🎨 ML Removal <span className="text-xs text-gray-500 dark:text-gray-400">(2-5s/image)</span>
                </span>
                <span className="block text-sm text-gray-600 dark:text-gray-400 mt-1">
                  AI-powered transparent backgrounds - Slower but higher quality
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* Metrics Panel (for A/B testing) */}
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              📊 Performance Metrics
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">Compare Fast vs Quality modes</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleViewMetrics}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
            >
              <BarChart3 size={14} />
              View in Console
            </button>
            <button
              onClick={handleExportMetrics}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
            >
              <Download size={14} />
              Export JSON
            </button>
            <button
              onClick={handleClearMetrics}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <Trash2 size={14} />
              Clear
            </button>
          </div>
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

                {/* Category selector for each queued file (pre-analysis) */}
                {(status === 'idle' || status === 'cancelled') && (
                  <div className="absolute bottom-2 left-2 right-2 z-20 bg-white/95 dark:bg-gray-800/95 rounded-md p-1.5 shadow-lg">
                    <div className="text-[10px] text-gray-600 dark:text-gray-400 mb-1 px-1">
                      Select category
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
                      : 'Processing clothing...'} {processedCount} / {totalFiles} ({progress}%)
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
