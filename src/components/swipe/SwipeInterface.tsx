import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Outfit } from '../../types';
import { OutfitCard } from './OutfitCard';
import { SwipeControls } from './SwipeControls';
import { generateOutfits } from '../../utils/outfitGenerator';

interface SwipeInterfaceProps {
  onNavigate?: (view: 'wardrobe' | 'swipe' | 'todaysPick' | 'history' | 'settings') => void;
}

export function SwipeInterface({ onNavigate }: SwipeInterfaceProps) {
  // Defensive guards: ensure dailySuggestions is never undefined
  const { dailySuggestions = [], setTodaysPick, addOutfit, setDailySuggestions } = useStore();
  const wardrobe = useStore((s) => s.wardrobe ?? []);
  const profile = useStore((s) => s.profile);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get global weather data from store (Phase 18)
  const weatherData = useStore((s) => s.weatherData);

  const currentOutfit = dailySuggestions[currentIndex];

  // Generate fallback outfits if needed
  useEffect(() => {
    if (dailySuggestions.length === 0 && wardrobe.length > 0) {
      try {
        const generated = generateOutfits(wardrobe, profile, 10, weatherData ?? undefined);
        if (generated && generated.length > 0) {
          setDailySuggestions(generated as Outfit[]);
        }
      } catch (err) {
        console.error('Fallback outfit generation failed:', err);
      }
    }
  }, [dailySuggestions.length, wardrobe, profile, weatherData, setDailySuggestions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent action if disabled or transitioning
      if (!currentOutfit || isTransitioning) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handleDislike();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleLike();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentOutfit, isTransitioning]);

  const handleLike = async () => {
    if (!currentOutfit || isTransitioning) return;

    setIsTransitioning(true);

    // Add to history with liked status
    const likedOutfit: Outfit = {
      ...currentOutfit,
      liked: true,
    };
    addOutfit(likedOutfit);

    // Set as today's pick if it's the first like
    setTodaysPick(likedOutfit);

    // Check if we're at the last outfit
    if (currentIndex === dailySuggestions.length - 1) {
      // Navigate to history page after delay
      setTimeout(() => {
        onNavigate?.('history');
      }, 250);
    } else {
      // Normal progression - simple delay before showing next outfit
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsTransitioning(false);
      }, 250);
    }
  };

  const handleDislike = async () => {
    if (!currentOutfit || isTransitioning) return;

    setIsTransitioning(true);

    // Don't save disliked outfits - only liked outfits are saved to history

    // Check if we're at the last outfit
    if (currentIndex === dailySuggestions.length - 1) {
      // Navigate to history page after delay
      setTimeout(() => {
        onNavigate?.('history');
      }, 250);
    } else {
      // Normal progression - simple delay before showing next outfit
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsTransitioning(false);
      }, 250);
    }
  };

  if (!dailySuggestions || dailySuggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No outfit suggestions available. Please add more items to your wardrobe.
        </p>
      </div>
    );
  }

  if (currentIndex >= dailySuggestions.length) {
    // Fallback: Navigate to history if somehow we're past the end
    onNavigate?.('history');
    return null;
  }

  return (
    <div className="flex flex-col w-full max-w-md mx-auto px-4 py-4 overflow-x-hidden min-h-[calc(100vh-4rem)]">
      {/* Card Stack */}
      <div className="relative mb-4">
        {/* Next card preview */}
        {dailySuggestions[currentIndex + 1] && (
          <div className="absolute inset-0 opacity-50 scale-95">
            <OutfitCard outfit={dailySuggestions[currentIndex + 1]} />
          </div>
        )}

        {/* Current card - no animation, just show it */}
        <div className="relative">
          <OutfitCard outfit={currentOutfit} />
        </div>
      </div>

      {/* Swipe Controls */}
      <div className="flex-shrink-0 pb-2">
        <SwipeControls
          onDislike={handleDislike}
          onLike={handleLike}
          disabled={!currentOutfit || isTransitioning}
        />
      </div>

      {/* Progress indicator */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 pb-4">
        {currentIndex + 1} / {dailySuggestions.length}
      </div>
    </div>
  );
}
