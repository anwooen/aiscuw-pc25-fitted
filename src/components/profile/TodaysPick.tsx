import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { WardrobeUpload } from '../wardrobe/WardrobeUpload';
import { meetsMinimumRequirements } from '../../utils/outfitGenerator';
import { Sparkles, RefreshCw } from 'lucide-react';
import { OutfitDisplayCard } from '../shared/OutfitDisplayCard';
import { AppView } from '../../types';

interface TodaysPickProps {
  onNavigate?: (view: AppView) => void;
}

export const TodaysPick = ({ onNavigate }: TodaysPickProps) => {
  const { todaysPick, setTodaysPick, wardrobe, outfitHistory } = useStore();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const canSwipe = meetsMinimumRequirements(wardrobe);
  const hasHistory = outfitHistory.some(o => o.liked);

  const handleReSwipe = () => {
    // DEBUG: Log current state
    console.log('=== HANDLE RE-SWIPE DEBUG ===');
    console.log('Total outfits in history:', outfitHistory.length);
    console.log('Current todaysPick ID:', todaysPick?.id);

    // Get all liked outfits from history
    const likedOutfits = outfitHistory.filter(outfit => outfit.liked === true);
    console.log('Liked outfits count:', likedOutfits.length);
    console.log('Liked outfit IDs:', likedOutfits.map(o => o.id));

    // Filter out the current outfit
    const otherLikedOutfits = likedOutfits.filter(
      outfit => outfit.id !== todaysPick?.id
    );
    console.log('Other liked outfits (excluding current):', otherLikedOutfits.length);
    console.log('Other liked outfit IDs:', otherLikedOutfits.map(o => o.id));

    // If there are other liked outfits, pick a random one
    if (otherLikedOutfits.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherLikedOutfits.length);
      const newPick = otherLikedOutfits[randomIndex];
      console.log('Selected new pick with ID:', newPick.id);
      setTodaysPick(newPick);
    } else {
      console.log('No other liked outfits, clearing pick');
      // Fall back to clearing (redirect to swipe)
      setTodaysPick(null);
    }
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
            {canSwipe ? (
              hasHistory ? (
                <button
                  onClick={handleReSwipe}
                  className="px-6 py-3 bg-white text-uw-purple font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Generate Pick
                </button>
              ) : (
                <button
                  onClick={() => onNavigate?.('swipe')}
                  className="px-6 py-3 bg-white text-uw-purple font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Do your first pick
                </button>
              )
            ) : (
              <>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 bg-white text-uw-purple font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Upload Items
                </button>

                {showUploadModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 relative max-h-[90vh] overflow-auto">
                      <button
                        onClick={() => setShowUploadModal(false)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-700"
                        aria-label="Close upload"
                      >
                        ✕
                      </button>
                      <WardrobeUpload />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gray-50 dark:bg-gray-900">
      {/* Phase 18: Weather widget moved to Header (global) */}

      {/* Outfit Display */}
      <div className="max-w-2xl mx-auto p-6 pt-3">
        <OutfitDisplayCard items={todaysPick.items} />

        {/* Action Buttons - Below Card */}
        <div className="mt-6 space-y-3">
          <button
            onClick={handleReSwipe}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-uw-purple text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors shadow-lg"
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
  );
};
