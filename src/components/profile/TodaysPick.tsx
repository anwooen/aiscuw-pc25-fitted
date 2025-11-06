import { useState, useEffect, memo } from 'react';
import { useStore } from '../../store/useStore';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getImageURL } from '../../utils/storage';

// Image component that loads from IndexedDB
const TodayPickItemImage = memo(({ itemId, category }: { itemId: string; category: string }) => {
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
    <>
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
    </>
  );
});

TodayPickItemImage.displayName = 'TodayPickItemImage';

export const TodaysPick = ({ onNavigate }: { onNavigate?: (view: 'wardrobe' | 'swipe' | 'todaysPick' | 'history' | 'settings') => void }) => {
  const { todaysPick, setTodaysPick, wardrobe } = useStore();

  const handleReSwipe = () => {
    setTodaysPick(null);
    // Redirect to swipe interface will be handled by parent component
    onNavigate?.('swipe');
  };

  if (!todaysPick) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div
            className="p-12 rounded-3xl shadow-2xl"
            style={{
              background: 'linear-gradient(to bottom right, #4b2e83, #7c3aed)'
            }}
          >
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-white opacity-80" />
            <h2 className="text-2xl font-bold mb-2 text-white">No Outfit Selected</h2>
            <p className="text-purple-200 mb-6">
              Swipe through outfits to pick today's look!
            </p>
            <button
              onClick={() => {
                if (!wardrobe || wardrobe.length === 0) {
                  onNavigate?.('wardrobe');
                } else {
                  handleReSwipe();
                }
              }}
              className="px-6 py-3 bg-white text-uw-purple font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {(!wardrobe || wardrobe.length === 0) ? 'Add Clothing Item' : 'Start Swiping'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="p-6 text-white" style={{ background: 'linear-gradient(to right, #4b2e83, #7c3aed)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-white" />
            <h1 className="text-2xl font-bold text-white">Today's Pick</h1>
          </div>
          <p className="text-white opacity-80">Your selected outfit for today</p>
        </div>
      </div>

      {/* Outfit Display */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-gray-800">
          {/* Outfit Items Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 mb-6">
              {todaysPick.items.map((item) => (
                <div
                  key={item.id}
                  className="relative rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-700"
                >
                  <TodayPickItemImage itemId={item.id} category={item.category} />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <span className="text-white font-semibold capitalize">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleReSwipe}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-uw-purple text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Pick a Different Outfit
              </button>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                Selected on {new Date(todaysPick.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-6 p-4 rounded-xl bg-purple-50 dark:bg-gray-800">
          <h3 className="font-semibold mb-2 text-uw-purple dark:text-white">
            Style Tips
          </h3>
          <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
            <li>• Take a photo to remember this outfit combination</li>
            <li>• Check the weather before heading out</li>
            <li>• Add accessories to personalize your look</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
