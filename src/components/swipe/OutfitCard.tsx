import { memo, useState, useEffect } from 'react';
import { Outfit } from '../../types';
import { getImageURL, cleanupImageURL } from '../../utils/storage';

interface OutfitCardProps {
  outfit: Outfit;
}

// Image component that loads from IndexedDB
const OutfitItemImage = memo(({ itemId, category }: { itemId: string; category: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadImage = async () => {
      try {
        setLoadError(false);
        // Try both itemId and image property for backward compatibility
        const url = await getImageURL(itemId);
        if (mounted && url) {
          setImageUrl(url);
          console.log('Loaded image:', itemId); // Debug log
        } else {
          console.warn('No image URL for:', itemId); // Debug log
        }
      } catch (error) {
        console.error('Failed to load image:', error);
        if (mounted) {
          setLoadError(true);
        }
      }
    };
    loadImage();

    // Cleanup when component unmounts or itemId changes
    return () => {
      mounted = false;
      if (imageUrl) {
        cleanupImageURL(itemId);
      }
    };
  }, [itemId]);

  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
      {imageUrl && !loadError ? (
        <img
          src={imageUrl}
          alt={category}
          className="w-full h-full object-cover"
          onError={() => setLoadError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          {loadError ? (
            <div className="text-center p-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Failed to load image
              </span>
            </div>
          ) : (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-600 w-full h-full" />
          )}
        </div>
      )}
    </div>
  );
});

OutfitItemImage.displayName = 'OutfitItemImage';

export const OutfitCard = memo(({ outfit }: OutfitCardProps) => {
  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Outfit Items Grid */}
        <div className="flex-1 p-6 grid grid-cols-2 gap-4 overflow-y-auto">
          {outfit.items.map((item) => (
            <div key={item.id} className="relative group">
              <OutfitItemImage itemId={item.id} category={item.category} />
              <div className="mt-2 text-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                  {item.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Outfit Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {outfit.items.length} items
              </p>
            </div>
            <div className="flex gap-2">
              {outfit.items.slice(0, 3).map((item) =>
                item.colors.slice(0, 2).map((color, idx) => (
                  <div
                    key={`${item.id}-${idx}`}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

OutfitCard.displayName = 'OutfitCard';
