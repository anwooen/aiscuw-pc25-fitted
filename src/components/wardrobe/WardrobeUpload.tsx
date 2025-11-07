import { useState, useRef, useEffect } from 'react';
import { Upload, Camera, X, Sparkles, RefreshCw, Layers, CheckCircle, AlertTriangle } from 'lucide-react';
import type { ClothingCategory, AIClothingAnalysis } from '../../types';
import { compressImage, extractColors, isValidImage } from '../../utils/imageCompression';
import { saveImage } from '../../utils/storage';
import { useStore } from '../../store/useStore';
import { Button } from '../shared/Button';
import { analyzeClothing } from '../../services/api';
import { useImageConverter } from '../../hooks/useImageConverter';
import { useBackgroundRemoval } from '../../hooks/useBackgroundRemoval';
import { BatchUpload } from './BatchUpload';

export const WardrobeUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIClothingAnalysis | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { addClothingItem, profile } = useStore();
  const { convertImage, isConverting, progress, error: conversionError, checkIfNeedsConversion, getFormat } = useImageConverter();
  const backgroundRemoval = useBackgroundRemoval();

  const categories: { value: ClothingCategory; label: string; emoji: string }[] = [
    { value: 'top', label: 'Top', emoji: '👕' },
    { value: 'bottom', label: 'Bottom', emoji: '👖' },
    { value: 'shoes', label: 'Shoes', emoji: '👟' },
    { value: 'outerwear', label: 'Outerwear', emoji: '🧥' },
    { value: 'accessory', label: 'Accessory', emoji: '👜' },
  ];

  const handleFileSelect = async (file: File) => {
    setError(null);
    setAiAnalysis(null);

    if (!isValidImage(file)) {
      setError('Please select a valid image file');
      return;
    }

    // Step 1: Format conversion (if needed)
    const needsConversion = checkIfNeedsConversion(file);
    let processedFile = file;

    if (needsConversion) {
      const format = getFormat(file);
      console.log(`Converting ${format} image to JPEG...`);

      // Convert the image
      const converted = await convertImage(file);

      if (!converted) {
        setError(conversionError || 'Failed to convert image format. Please try a different image.');
        return;
      }

      processedFile = converted;
      console.log(`Successfully converted ${format} to JPEG`);
    }

    // Step 2: Background removal (ALWAYS RUNS - Phase 11B)
    console.log('Phase 11B: Starting automatic background removal...');
    const backgroundRemovedFile = await backgroundRemoval.processImage(processedFile);

    setSelectedFile(backgroundRemovedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setPreviewUrl(base64Image);

      // Step 3: If AI is enabled, analyze the image
      if (useAI) {
        await handleAIAnalysis(base64Image);
      }
    };
    reader.readAsDataURL(backgroundRemovedFile);
  };

  const handleAIAnalysis = async (base64Image: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await analyzeClothing({
        image: base64Image,
        userPreferences: profile.stylePreferences,
      });

      if (response.success && response.analysis) {
        setAiAnalysis(response.analysis);
        // Auto-select the suggested category (user can still override)
    setSelectedCategory(response.analysis.suggestedCategory || null);
      } else {
        setError(response.error || 'Failed to analyze image with AI');
      }
    } catch (err) {
      console.error('AI analysis error:', err);
      setError('AI analysis failed. You can still add the item manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  // Aggregate processing state for the initial upload area
  const isProcessing = isConverting || backgroundRemoval.status === 'processing' || isAnalyzing || isUploading;

  const statusMessage = isConverting
    ? progress?.message || 'Converting image...'
    : backgroundRemoval.status === 'processing'
    ? backgroundRemoval.stage || 'Processing image...'
    : isAnalyzing
    ? 'Analyzing with AI...'
    : isUploading
    ? 'Uploading...'
    : '';

  const combinedProgress = (() => {
    if (isUploading) return 95; // during final upload/save, show near-complete state
    return Math.max(progress?.progress ?? 0, backgroundRemoval.progress ?? 0);
  })();

  // Smooth, non-decreasing displayed progress to avoid quick fill/reset behavior
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const targetProgressRef = useRef<number>(combinedProgress);

  useEffect(() => {
    // Decide visible target: prefer combinedProgress, but when uploading ensure it moves toward 95
    let target = combinedProgress;
    if (isUploading && target < 95) target = 95;
    targetProgressRef.current = target;

    let rafId: number | null = null;

    const step = () => {
      setDisplayedProgress((prev) => {
        // never decrease
        const t = targetProgressRef.current;
        if (prev >= t) return prev;
        const diff = t - prev;
        const inc = Math.max(1, Math.ceil(diff * 0.18)); // proportional smoothing
        const next = Math.min(100, prev + inc);
        return next;
      });

      // Continue animating until we reach target
      if (displayedProgress < targetProgressRef.current) {
        rafId = requestAnimationFrame(step);
      }
    };

    // Kick off animation if displayed is behind target
    if (displayedProgress < target) {
      rafId = requestAnimationFrame(step);
    }

    // When processing stops, finalize to 100 briefly then reset to 0
    if (!isProcessing && displayedProgress > 0) {
      const finishTimeout = window.setTimeout(() => {
        setDisplayedProgress(0);
      }, 700);

      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        clearTimeout(finishTimeout);
      };
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedProgress, isUploading, isProcessing]);

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedCategory(null);
    setError(null);
    setAiAnalysis(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!selectedFile || !selectedCategory) {
      setError('Please select an image and category');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Compress image
      const compressedBlob = await compressImage(selectedFile);

      // Extract colors (use AI colors if available, otherwise extract)
      const colors = aiAnalysis?.detectedColors || await extractColors(selectedFile);

      // Generate unique ID
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Save to IndexedDB
      await saveImage(id, compressedBlob);

      // Add to store
      addClothingItem({
        id,
        image: id, // Store ID reference instead of base64
        category: selectedCategory,
        colors,
        uploadedAt: new Date(),
        aiAnalysis: aiAnalysis || undefined, // Include AI analysis if available
      });

      // Reset form
      handleCancel();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // If in batch mode, render BatchUpload component
  if (batchMode) {
    return (
      <BatchUpload
        onComplete={() => setBatchMode(false)}
        onCancel={() => setBatchMode(false)}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Clothing Item
        </h2>

        <div className="flex items-center gap-4">
          {/* Batch Mode Button */}
          <button
            onClick={() => setBatchMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-uw-purple/10 text-uw-purple dark:bg-uw-purple/20 dark:text-uw-gold rounded-lg hover:bg-uw-purple/20 dark:hover:bg-uw-purple/30 transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span className="text-sm font-medium">Batch Upload</span>
          </button>

          {/* AI Toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-uw-purple/20 dark:peer-focus:ring-uw-purple/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-uw-purple"></div>
            <span className="flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Sparkles className="w-4 h-4" />
              AI Analysis
            </span>
          </label>
        </div>
      </div>

      {!selectedFile ? (
        <div className="space-y-4">
          {/* Upload buttons (replaced by progress bar while processing) */}
          {!isProcessing ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleUploadClick}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-uw-purple hover:bg-uw-purple/5 transition-colors"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Upload Photo
                </span>
              </button>

              <button
                onClick={handleCameraClick}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-uw-purple hover:bg-uw-purple/5 transition-colors"
              >
                <Camera className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Take Photo
                </span>
              </button>
            </div>
          ) : (
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-uw-purple" />
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{statusMessage}</div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3">
                  <div
                    className="bg-uw-purple h-3 rounded-full transition-all duration-300"
                    style={{ width: `${displayedProgress}%` }}
                  />
                </div>
              </div>
              <Button variant="outline" onClick={handleCancel} className="min-w-[96px]">
                Cancel
              </Button>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image preview */}
          <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            <button
              onClick={handleCancel}
              className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Image Conversion Progress */}
          {isConverting && progress && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <div className="flex-1">
                  <div className="text-sm font-medium">{progress.message}</div>
                  <div className="mt-1 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Background Removal Progress - Phase 11B */}
          {backgroundRemoval.status === 'processing' && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {backgroundRemoval.stage || 'Processing image...'}
                  </div>
                  <div className="mt-1 w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                    <div
                      className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${backgroundRemoval.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Background Removal Success */}
          {backgroundRemoval.status === 'success' && backgroundRemoval.hasTransparency && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Background removed successfully!</span>
              </div>
            </div>
          )}

          {/* Background Removal Fallback */}
          {backgroundRemoval.status === 'success' && !backgroundRemoval.hasTransparency && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">Using smart crop (background removal unavailable)</span>
              </div>
            </div>
          )}

          {/* AI Analysis Results */}
          {isAnalyzing && (
            <div className="p-4 bg-uw-purple/10 border border-uw-purple/20 rounded-lg">
              <div className="flex items-center gap-2 text-uw-purple">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span className="text-sm font-medium">Analyzing with AI...</span>
              </div>
            </div>
          )}

          {aiAnalysis && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-green-700 dark:text-green-400 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-semibold">AI Analysis Complete</span>
                </div>
                {/* Phase 11B: Confidence Score */}
                {aiAnalysis.confidence !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium">
                      {(aiAnalysis.confidence * 100).toFixed(0)}% confident
                    </span>
                    {aiAnalysis.confidence >= 0.8 ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : aiAnalysis.confidence >= 0.5 ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 dark:text-gray-300">{aiAnalysis.description}</p>

              {/* Phase 11B: Reasoning */}
              {aiAnalysis.reasoning && (
                <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                  "{aiAnalysis.reasoning}"
                </div>
              )}

              {/* Phase 11B: Alternate Category Warning */}
              {aiAnalysis.alternateCategory && aiAnalysis.alternateConfidence && aiAnalysis.alternateConfidence > 0.3 && (
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded text-xs">
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  Could also be <strong>{aiAnalysis.alternateCategory}</strong> ({(aiAnalysis.alternateConfidence * 100).toFixed(0)}% confidence). Please review.
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                  {aiAnalysis.season}
                </span>
                <span className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                  {aiAnalysis.formality}
                </span>
                {Array.from(new Set(aiAnalysis.suggestedStyles)).map((style, index) => (
                  <span key={`${style}-${index}`} className="px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Category {aiAnalysis && <span className="text-xs text-gray-500">(AI suggested: {aiAnalysis.suggestedCategory})</span>}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all
                    ${
                      selectedCategory === cat.value
                        ? 'border-uw-purple bg-uw-purple/10 text-uw-purple'
                        : 'border-gray-200 dark:border-gray-600 hover:border-uw-purple/50'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  <div className="text-sm font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={!selectedCategory || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Add Item'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
