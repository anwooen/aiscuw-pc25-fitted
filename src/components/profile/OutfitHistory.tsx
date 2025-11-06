import { useState, memo, useEffect } from 'react'; // Added useEffect
import { useStore } from '../../store/useStore';
import { History, Trash2, X } from 'lucide-react'; // Added X for modal close
import type { OutfitHistoryItem } from '../../types';
import { getImageURL } from '../../utils/storage'; // Add this import

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

export function OutfitHistory() {
  const { outfitHistory, removeFromHistory } = useStore();
  const [selectedOutfit, setSelectedOutfit] = useState<OutfitHistoryItem | null>(null);

  const filteredHistory = outfitHistory;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Outfit History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredHistory.length} total
            </p>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-16">
            <History className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No liked outfits yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start swiping to build your outfit collection!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHistory.map((historyItem) => (
              <div
                key={historyItem.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedOutfit(historyItem)}
              >
                <div className="grid grid-cols-2 gap-2 p-4">
                  {historyItem.outfit.items.slice(0, 4).map((item) => (
                    <HistoryItemImage key={item.id} itemId={item.id} category={item.category} />
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(historyItem.timestamp).toLocaleDateString()}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(historyItem.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for outfit details */}
      {selectedOutfit && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOutfit(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Outfit Details
              </h2>
              <button
                onClick={() => setSelectedOutfit(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                {selectedOutfit.outfit.items.map((item) => (
                  <HistoryItemImage key={item.id} itemId={item.id} category={item.category} />
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Saved on: {new Date(selectedOutfit.timestamp).toLocaleString()}</p>
                <p className="mt-2">Items: {selectedOutfit.outfit.items.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
