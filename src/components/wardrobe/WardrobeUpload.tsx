import { useState, useRef } from 'react';
import { Upload, Camera, X, Sparkles } from 'lucide-react';
import type { ClothingCategory, AIClothingAnalysis } from '../../types';
import { compressImage, extractColors, isValidImage } from '../../utils/imageCompression';
import { saveImage } from '../../utils/storage';
import { useStore } from '../../store/useStore';
import { Button } from '../shared/Button';
import { analyzeClothing } from '../../services/api';

export const WardrobeUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIClothingAnalysis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { addClothingItem, profile } = useStore();

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

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setPreviewUrl(base64Image);

      // If AI is enabled, analyze the image
      if (useAI) {
        await handleAIAnalysis(base64Image);
      }
    };
    reader.readAsDataURL(file);
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
        setSelectedCategory(response.analysis.suggestedCategory);
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Clothing Item
        </h2>

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

      {!selectedFile ? (
        <div className="space-y-4">
          {/* Upload buttons */}
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
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold">AI Analysis Complete</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{aiAnalysis.description}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full">
                  {aiAnalysis.season}
                </span>
                <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full">
                  {aiAnalysis.formality}
                </span>
                {aiAnalysis.suggestedStyles.map((style) => (
                  <span key={style} className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full">
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
