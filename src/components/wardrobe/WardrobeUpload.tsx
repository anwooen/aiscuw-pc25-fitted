import { useState, useRef } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import type { ClothingCategory } from '../../types';
import { compressImage, extractColors, isValidImage } from '../../utils/imageCompression';
import { saveImage } from '../../utils/storage';
import { useStore } from '../../store/useStore';
import { Button } from '../shared/Button';

export const WardrobeUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { addClothingItem } = useStore();

  const categories: { value: ClothingCategory; label: string; emoji: string }[] = [
    { value: 'top', label: 'Top', emoji: '👕' },
    { value: 'bottom', label: 'Bottom', emoji: '👖' },
    { value: 'shoes', label: 'Shoes', emoji: '👟' },
    { value: 'outerwear', label: 'Outerwear', emoji: '🧥' },
    { value: 'accessory', label: 'Accessory', emoji: '👜' },
  ];

  const handleFileSelect = (file: File) => {
    setError(null);

    if (!isValidImage(file)) {
      setError('Please select a valid image file');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
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

      // Extract colors
      const colors = await extractColors(selectedFile);

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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Add Clothing Item
      </h2>

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

          {/* Category selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Category
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
