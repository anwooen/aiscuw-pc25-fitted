import { memo, useState, useEffect } from 'react';
import { ClothingItem } from '../../types';
import { getImageURL } from '../../utils/storage';

interface OutfitItemsDisplayProps {
  items: ClothingItem[];
  showLabels?: boolean;
  className?: string;
}

// Image component that loads from IndexedDB
const OutfitItemImage = memo(({ itemId, category }: { itemId: string; category: string }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const url = await getImageURL(itemId);
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
  }, [itemId]);

  return (
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={category}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-600 w-full h-full" />
        </div>
      )}
    </div>
  );
});

OutfitItemImage.displayName = 'OutfitItemImage';

/**
 * Reusable component for displaying outfit items with consistent sizing
 * Used by OutfitCard (swipe) and TodaysPick (profile)
 */
export const OutfitItemsDisplay = memo(({ items, showLabels = true, className = '' }: OutfitItemsDisplayProps) => {
  return (
    <div className={`flex flex-col justify-center gap-4 ${className}`}>
      {items.map((item) => (
        <div key={item.id} className="relative group flex-shrink-0">
          <div className="w-full max-w-xs mx-auto">
            <OutfitItemImage itemId={item.id} category={item.category} />
            {showLabels && (
              <div className="mt-2 text-center">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 capitalize">
                  {item.category}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

OutfitItemsDisplay.displayName = 'OutfitItemsDisplay';
