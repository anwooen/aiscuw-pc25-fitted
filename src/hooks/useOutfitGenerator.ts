import { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { generateOutfits } from '../utils/outfitGenerator';
import { useWeather } from './useWeather';
import type { Outfit } from '../types';

interface CachedOutfits {
  outfits: Outfit[];
  generatedAt: string; // ISO date string
}

const CACHE_KEY = 'fitted-daily-outfits';

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
 * Load cached outfits from localStorage
 */
const loadCachedOutfits = (): CachedOutfits | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached) as CachedOutfits;

    // Convert date strings back to Date objects
    data.outfits = data.outfits.map(outfit => ({
      ...outfit,
      createdAt: new Date(outfit.createdAt),
    }));

    return data;
  } catch (error) {
    console.error('Failed to load cached outfits:', error);
    return null;
  }
};

/**
 * Save outfits to localStorage cache
 */
const saveCachedOutfits = (outfits: Outfit[]): void => {
  try {
    const cache: CachedOutfits = {
      outfits,
      generatedAt: new Date().toISOString(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save cached outfits:', error);
  }
};

/**
 * Hook for generating daily outfit suggestions with caching
 * Automatically regenerates outfits each day
 */
export const useOutfitGenerator = (count: number = 10) => {
  const wardrobe = useStore((state) => state.wardrobe);
  const profile = useStore((state) => state.profile);
  const { weather } = useWeather(); // Get weather for outfit generation
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGeneratedDate, setLastGeneratedDate] = useState<string | null>(null);

  const generate = useCallback(() => {
    setLoading(true);
    // Add slight delay for UX (feels more intentional)
    setTimeout(() => {
      const generated = generateOutfits(wardrobe, profile, count, weather ?? undefined);
      setOutfits(generated);
      const now = new Date().toISOString();
      setLastGeneratedDate(now);

      // Cache the generated outfits
      saveCachedOutfits(generated);

      setLoading(false);
    }, 500);
  }, [wardrobe, profile, count, weather]);

  // Load cached outfits on mount
  useEffect(() => {
    const cached = loadCachedOutfits();

    if (cached && !shouldRegenerateOutfits(cached.generatedAt)) {
      // Use cached outfits from today
      setOutfits(cached.outfits);
      setLastGeneratedDate(cached.generatedAt);
    } else if (wardrobe.length > 0 && profile.hasCompletedOnboarding) {
      // Generate new outfits if cache is stale or doesn't exist
      generate();
    }
  }, []); // Only run on mount

  // Regenerate when wardrobe changes significantly
  useEffect(() => {
    // Only regenerate if we have a minimum wardrobe and user is onboarded
    if (wardrobe.length >= 10 && profile.hasCompletedOnboarding) {
      const cached = loadCachedOutfits();

      // If no cache or cache is from a different day, regenerate
      if (!cached || shouldRegenerateOutfits(cached.generatedAt)) {
        generate();
      }
    }
  }, [wardrobe.length, profile.hasCompletedOnboarding, generate]);

  return {
    outfits,
    loading,
    regenerate: generate,
    lastGeneratedDate,
    hasOutfits: outfits.length > 0,
  };
};
