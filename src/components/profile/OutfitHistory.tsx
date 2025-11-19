import { useState, useMemo, useEffect, memo } from 'react';
import { useStore } from '../../store/useStore';
import { Calendar } from 'lucide-react';
import type { Outfit } from '../../types';
import { getImageURL } from '../../utils/storage';

// Image component that loads from IndexedDB
const HistoryItemImage = memo(({ itemId, category }: { itemId: string; category: string }) => {
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
    <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={category}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse bg-gray-300 dark:bg-gray-600 w-full h-full" />
        </div>
      )}
    </div>
  );
});

HistoryItemImage.displayName = 'HistoryItemImage';

export const OutfitHistory = () => {
  const { outfitHistory } = useStore();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Sort outfits by most recent first (all saved outfits are liked)
  const filteredOutfits = useMemo(() => {
    const sorted = [...outfitHistory];
    sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted;
  }, [outfitHistory]);

  // Group outfits by date for calendar view
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Outfit[]> = {};

    filteredOutfits.forEach(outfit => {
      const date = new Date(outfit.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(outfit);
    });

    return groups;
  }, [filteredOutfits]);

  const OutfitCard = ({ outfit }: { outfit: Outfit }) => (
    <div className="rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-800">
      {/* Items Preview */}
      <div className="grid grid-cols-3 gap-1 p-1">
        {outfit.items.slice(0, 3).map((item) => (
          <div key={item.id}>
            <HistoryItemImage itemId={item.id} category={item.category} />
          </div>
        ))}
      </div>

      {/* Outfit Info */}
      <div className="p-3">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(outfit.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
        <div className="text-xs mt-1 text-gray-500">
          {outfit.items.length} items
        </div>
      </div>
    </div>
  );

  if (outfitHistory.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        {/* Empty State */}
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              No Outfit History Yet
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Start swiping right on outfits you love to see them here!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gray-50 dark:bg-gray-900">
      {/* Controls */}
      <div className="max-w-4xl mx-auto px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm bg-uw-purple/10 dark:bg-purple-900/20 px-3 py-1.5 rounded-full text-uw-purple dark:text-purple-400 font-medium">
            {filteredOutfits.length} {filteredOutfits.length === 1 ? 'outfit' : 'outfits'}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-uw-purple dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-uw-purple dark:hover:text-white'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white dark:bg-gray-600 text-uw-purple dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-uw-purple dark:hover:text-white'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6">
        {viewMode === 'list' ? (
          /* List View */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredOutfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        ) : (
          /* Calendar View */
          <div className="space-y-6">
            {Object.entries(groupedByDate).map(([date, outfits]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {date}
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({outfits.length})
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {outfits.map((outfit) => (
                    <OutfitCard key={outfit.id} outfit={outfit} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
