import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Outfit } from '../../types';
import { OutfitCard } from './OutfitCard';
import { SwipeControls } from './SwipeControls';
import { generateOutfits } from '../../utils/outfitGenerator';
import { useWeather } from '../../hooks/useWeather';
import { WeatherWidget } from '../shared/WeatherWidget';

const SWIPE_THRESHOLD = 100;

interface SwipeInterfaceProps {
  onNavigate?: (view: 'wardrobe' | 'swipe' | 'todaysPick' | 'history' | 'settings') => void;
}

export function SwipeInterface({ onNavigate }: SwipeInterfaceProps) {
  const { dailySuggestions, setTodaysPick, addOutfit, setDailySuggestions } = useStore();
  const wardrobe = useStore((s) => s.wardrobe);
  const profile = useStore((s) => s.profile);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  // Weather data for context
  const { weather, loading: weatherLoading, error: weatherError, fetchWeather } = useWeather();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const currentOutfit = dailySuggestions[currentIndex];

  // Generate fallback outfits if needed (MUST be at top level - Rules of Hooks!)
  useEffect(() => {
    if (!dailySuggestions.length && wardrobe.length > 0) {
      try {
        const generated = generateOutfits(wardrobe, profile, 10, weather ?? undefined);
        if (generated && generated.length > 0) {
          setDailySuggestions(generated as Outfit[]);
        }
      } catch (err) {
        console.error('Fallback outfit generation failed:', err);
      }
    }
  }, [dailySuggestions.length, wardrobe, profile, weather, setDailySuggestions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent action if disabled or no current outfit
      if (!currentOutfit || direction) return;

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
  }, [currentOutfit, direction]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeDistance = info.offset.x;

    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
      if (swipeDistance > 0) {
        // Swiped right - like
        handleLike();
      } else {
        // Swiped left - dislike
        handleDislike();
      }
    } else {
      // Reset position
      x.set(0);
    }
  };

  const handleLike = async () => {
    if (!currentOutfit) return;

    setDirection('right');

    // Add to history with liked status
    const likedOutfit: Outfit = {
      ...currentOutfit,
      liked: true,
    };
    addOutfit(likedOutfit);

    // Set as today's pick if it's the first like
    setTodaysPick(likedOutfit);

    // Show success animation
    setShowSuccess(true);

    // Check if we're at the last outfit
    if (currentIndex === dailySuggestions.length - 1) {
      // Navigate to history page after animation
      setTimeout(() => {
        onNavigate?.('history');
      }, 600);
    } else {
      // Normal progression
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        x.set(0);
        setDirection(null);
        setShowSuccess(false);
      }, 600);
    }
  };

  const handleDislike = async () => {
    if (!currentOutfit) return;

    setDirection('left');

    // Add to history with disliked status
    const dislikedOutfit: Outfit = {
      ...currentOutfit,
      liked: false,
    };
    addOutfit(dislikedOutfit);

    // Check if we're at the last outfit
    if (currentIndex === dailySuggestions.length - 1) {
      // Navigate to history page after animation
      setTimeout(() => {
        onNavigate?.('history');
      }, 300);
    } else {
      // Normal progression
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        x.set(0);
        setDirection(null);
      }, 300);
    }
  };

  if (!dailySuggestions.length) {
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
    <div className="flex flex-col h-full w-full max-w-md mx-auto px-4 py-6 overflow-x-hidden">
      {/* Weather Widget - Visible and centered above card */}
      <div className="mb-4">
        <WeatherWidget weather={weather} loading={weatherLoading} error={weatherError} onRequestWeather={fetchWeather} />
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="bg-uw-purple text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            <span className="text-lg font-bold">Today's Pick!</span>
          </div>
        </motion.div>
      )}

      {/* Card Stack */}
      <div className="relative h-[360px] mb-6">
        {/* Next card preview */}
        {dailySuggestions[currentIndex + 1] && (
          <div className="absolute inset-0 opacity-50 scale-95">
            <OutfitCard outfit={dailySuggestions[currentIndex + 1]} />
          </div>
        )}

        {/* Current swipeable card */}
        <motion.div
          className="absolute inset-0 cursor-default hover:cursor-grab active:cursor-grabbing"
          style={{
            x,
            rotate,
            opacity,
          }}
          drag="x"
          dragConstraints={{ left: -300, right: 300 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          animate={
            direction === 'right'
              ? { x: 500, opacity: 0 }
              : direction === 'left'
              ? { x: -500, opacity: 0 }
              : {}
          }
          transition={{ duration: 0.3 }}
        >
          {/* Swipe indicators */}
          <motion.div
            className="absolute top-8 left-8 z-10 bg-red-500 text-white px-6 py-2 rounded-lg font-bold text-xl rotate-[-20deg] border-4 border-red-500"
            style={{
              opacity: useTransform(x, [-100, 0], [1, 0]),
            }}
          >
            NOPE
          </motion.div>
          <motion.div
            className="absolute top-8 right-8 z-10 bg-green-500 text-white px-6 py-2 rounded-lg font-bold text-xl rotate-[20deg] border-4 border-green-500"
            style={{
              opacity: useTransform(x, [0, 100], [0, 1]),
            }}
          >
            LIKE
          </motion.div>

          <OutfitCard outfit={currentOutfit} />
        </motion.div>
      </div>

      {/* Swipe Controls */}
      <div className="mb-6">
        <SwipeControls
          onDislike={handleDislike}
          onLike={handleLike}
          disabled={!currentOutfit}
        />
      </div>

      {/* Progress indicator */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 pb-2">
        {currentIndex + 1} / {dailySuggestions.length}
      </div>
    </div>
  );
}
