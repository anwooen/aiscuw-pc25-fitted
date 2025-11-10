import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { generateOutfits } from '../utils/outfitGenerator';
import { recommendOutfits } from '../services/api';
import { useWeather } from './useWeather';
import type { Outfit, WeatherData, RecommendOutfitsRequest } from '../types';

interface CachedAIOutfits {
  outfits: Outfit[];
  generatedAt: string; // ISO date string
  weather?: WeatherData;
}

const AI_CACHE_KEY = 'fitted-ai-daily-outfits';

/**
 * Check if we should regenerate outfits for today
 * Returns true if no cached outfits or if it's a new day
 */
const shouldRegenerateOutfits = (lastGenerated: string | null): boolean => {
  if (!lastGenerated) return true;

  const now = new Date();
  const last = new Date(lastGenerated);

  // Check if it's a different day
  return (
    now.getFullYear() !== last.getFullYear() ||
    now.getMonth() !== last.getMonth() ||
    now.getDate() !== last.getDate()
  );
};

/**
 * Load cached AI outfits from localStorage
 */
const loadCachedAIOutfits = (): CachedAIOutfits | null => {
  try {
    const cached = localStorage.getItem(AI_CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as CachedAIOutfits;

    // Convert date strings back to Date objects
    data.outfits = data.outfits.map(outfit => ({
      ...outfit,
      createdAt: new Date(outfit.createdAt),
    }));

    return data;
  } catch (error) {
    console.error('Failed to load cached AI outfits:', error);
    return null;
  }
};

/**
 * Save AI outfits to localStorage cache
 */
const saveCachedAIOutfits = (outfits: Outfit[], weather?: WeatherData): void => {
  try {
    const cache: CachedAIOutfits = {
      outfits,
      generatedAt: new Date().toISOString(),
      weather,
    };
    localStorage.setItem(AI_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save cached AI outfits:', error);
  }
};

export interface UseAIOutfitRecommendationsOptions {
  useAI?: boolean; // Toggle between AI and classic algorithm
  count?: number; // Number of outfits to generate (default 10)
}

/**
 * Hook for AI-powered outfit recommendations with hybrid mode
 * Falls back to classic algorithm if AI fails or is disabled
 */
export const useAIOutfitRecommendations = (options: UseAIOutfitRecommendationsOptions = {}) => {
  const { useAI = false, count = 10 } = options;

  const wardrobe = useStore((state) => state.wardrobe);
  const profile = useStore((state) => state.profile);

  // Use shared weather hook
  const { weather, fetchWeather } = useWeather();

  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedDate, setLastGeneratedDate] = useState<string | null>(null);
  const [isUsingAI, setIsUsingAI] = useState(useAI);

  /**
   * Generate outfits using AI
   */
  const generateAIOutfits = async (): Promise<Outfit[] | null> => {
    try {
      // Ensure fresh weather data is available
      await fetchWeather();

      // Prepare wardrobe data for AI (text descriptions only, no images!)
      const wardrobeData = wardrobe.map(item => ({
        id: item.id,
        category: item.category,
        colors: item.colors,
        aiAnalysis: item.aiAnalysis,
      }));

      // Build AI request (Phase 13: include full profile for enhanced personalization)
      const request: RecommendOutfitsRequest = {
        wardrobe: wardrobeData,
        weather: weather || undefined,
        preferences: profile.stylePreferences,
        favoriteColors: profile.favoriteColors,
        count,
        profile, // Phase 13: Send full profile with all enhanced personalization data
      };

      // Call AI API
      const response = await recommendOutfits(request);

      if (!response.success || !response.outfits) {
        throw new Error(response.error || 'Failed to get AI recommendations');
      }

      // Convert AI response (itemIds) to full Outfit objects
      const aiOutfits: Outfit[] = response.outfits.map(recommendation => {
        const items = recommendation.itemIds
          .map(id => wardrobe.find(item => item.id === id))
          .filter((item): item is NonNullable<typeof item> => item !== undefined);

        return {
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          items,
          createdAt: new Date(),
        };
      });

      // Cache the AI outfits
      saveCachedAIOutfits(aiOutfits, weather || undefined);

      return aiOutfits;
    } catch (err) {
      console.error('AI outfit generation failed:', err);
      setError(err instanceof Error ? err.message : 'AI generation failed');
      return null;
    }
  };

  /**
   * Generate outfits using classic algorithm
   */
  const generateClassicOutfits = (): Outfit[] => {
    return generateOutfits(wardrobe, profile, count, weather ?? undefined);
  };

  /**
   * Main generation function
   */
  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Slight delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    let generated: Outfit[] | null = null;

    if (isUsingAI) {
      // Try AI first
      generated = await generateAIOutfits();

      // Fallback to classic if AI fails
      if (!generated || generated.length === 0) {
        console.warn('AI generation failed, falling back to classic algorithm');
        setError('AI unavailable, using classic algorithm');
        generated = generateClassicOutfits();
        setIsUsingAI(false); // Switch to classic mode for this session
      }
    } else {
      // Use classic algorithm
      generated = generateClassicOutfits();
    }

    setOutfits(generated);
    const now = new Date().toISOString();
    setLastGeneratedDate(now);

    setLoading(false);
  }, [wardrobe, profile, count, isUsingAI]);

  /**
   * Toggle between AI and classic mode
   */
  const toggleMode = useCallback(() => {
    setIsUsingAI(prev => !prev);
  }, []);

  /**
   * Set AI mode explicitly
   */
  const setAIMode = useCallback((enabled: boolean) => {
    setIsUsingAI(enabled);
  }, []);

  // Load cached outfits on mount
  useEffect(() => {
    if (isUsingAI) {
      const cached = loadCachedAIOutfits();

      if (cached && !shouldRegenerateOutfits(cached.generatedAt)) {
        // Use cached AI outfits from today
        setOutfits(cached.outfits);
        // Weather is managed by useWeather hook (no need to set it here)
        setLastGeneratedDate(cached.generatedAt);
      } else if (wardrobe.length > 0 && profile.hasCompletedOnboarding) {
        // Generate new AI outfits if cache is stale or doesn't exist
        generate();
      }
    } else {
      // Use classic algorithm (it has its own caching)
      if (wardrobe.length > 0 && profile.hasCompletedOnboarding) {
        generate();
      }
    }
  }, []); // Only run on mount

  // Regenerate when mode changes or wardrobe changes significantly
  useEffect(() => {
    // Only regenerate if we have minimum wardrobe and user is onboarded
    if (wardrobe.length >= 10 && profile.hasCompletedOnboarding) {
      if (isUsingAI) {
        const cached = loadCachedAIOutfits();

        // If no cache or cache is from a different day, regenerate
        if (!cached || shouldRegenerateOutfits(cached.generatedAt)) {
          generate();
        }
      } else {
        // Classic mode regenerates on significant wardrobe changes
        const hasSignificantChange = outfits.length === 0;
        if (hasSignificantChange) {
          generate();
        }
      }
    }
  }, [wardrobe.length, profile.hasCompletedOnboarding, isUsingAI, generate]);

  return {
    outfits,
    loading,
    error,
    weather,
    regenerate: generate,
    lastGeneratedDate,
    hasOutfits: outfits.length > 0,
    isUsingAI,
    toggleMode,
    setAIMode,
  };
};
