import { useState, useEffect, memo } from 'react';
import { Trash2, Tag } from 'lucide-react';
import type { ClothingItem as ClothingItemType } from '../../types';
import { getImageURL } from '../../utils/storage';

interface ClothingItemProps {
  item: ClothingItemType;
  onDelete: (id: string) => void;
}

export const ClothingItem = memo(({ item, onDelete }: ClothingItemProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const url = await getImageURL(item.id);
        setImageUrl(url);
      } catch (error) {
        console.error('Failed to load image:', error);
      }
    };
    loadImage();

    // Cleanup: revoke object URL when component unmounts
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [item.id]);

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete(item.id);
  };

  const categoryLabels: Record<ClothingItemType['category'], string> = {
    top: 'Top',
    bottom: 'Bottom',
    shoes: 'Shoes',
    accessory: 'Accessory',
    outerwear: 'Outerwear',
  };

  return (
    <div
      className={`
        relative group bg-white dark:bg-gray-800 rounded-lg overflow-hidden
        shadow-sm hover:shadow-md transition-all duration-200
        ${isDeleting ? 'opacity-50 scale-95' : ''}
      `}
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 dark:bg-gray-700">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={categoryLabels[item.category]}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-600 w-full h-full" />
          </div>
        )}
      </div>

      {/* Overlay with actions */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleDelete}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
            title="Delete item"
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info bar */}
      <div className="p-3 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {categoryLabels[item.category]}
          </span>
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-gray-400" />
            <div className="flex gap-1">
              {item.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {item.colors.length > 3 && (
                <span className="text-xs text-gray-500 ml-1">
                  +{item.colors.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>
        {item.style && item.style.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.style.slice(0, 2).map((style, index) => (
              <span
                key={index}
                className="text-xs px-2 py-0.5 bg-uw-purple/10 text-uw-purple rounded-full"
              >
                {style}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ClothingItem.displayName = 'ClothingItem';
