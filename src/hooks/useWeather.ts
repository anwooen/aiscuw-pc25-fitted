import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getWeather, getUserLocation } from '../services/api';
import type { WeatherData } from '../types';

// Cache constants
const WEATHER_CACHE_KEY = 'fitted_weather_cache';
const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Cached weather data structure
 */
interface CachedWeather {
  weather: WeatherData;
  cachedAt: string;
}

/**
 * Hook return type
 */
export interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  fetchWeather: () => Promise<void>;
  hasLocation: boolean;
  clearCache: () => void;
}

/**
 * Load cached weather from localStorage
 */
const loadCachedWeather = (): CachedWeather | null => {
  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return null;

    const data: CachedWeather = JSON.parse(cached);

    // Check if cache is still valid (within 30 minutes)
    const cachedTime = new Date(data.cachedAt).getTime();
    const now = Date.now();

    if (now - cachedTime > WEATHER_CACHE_DURATION) {
      // Cache expired, remove it
      localStorage.removeItem(WEATHER_CACHE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load cached weather:', error);
    return null;
  }
};

/**
 * Save weather to localStorage cache
 */
const saveCachedWeather = (weather: WeatherData): void => {
  try {
    const cache: CachedWeather = {
      weather,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save cached weather:', error);
  }
};

/**
 * Custom hook for weather data with caching and location management
 *
 * Features:
 * - Automatic 30-minute caching in localStorage
 * - Falls back to geolocation API if profile location not set
 * - Graceful error handling (returns null, doesn't crash)
 * - Auto-fetches on mount if location is available
 *
 * Usage:
 * ```tsx
 * const { weather, loading, error, fetchWeather, hasLocation } = useWeather();
 *
 * if (loading) return <Spinner />;
 * if (!weather) return <EnableLocationPrompt />;
 *
 * return <WeatherWidget weather={weather} />;
 * ```
 */
export function useWeather(): UseWeatherReturn {
  const profile = useStore((state) => state.profile);

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch weather data with caching
   */
  const fetchWeather = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Step 1: Check cache first
      const cached = loadCachedWeather();
      if (cached) {
        setWeather(cached.weather);
        setLoading(false);
        return;
      }

      // Step 2: Get location from profile or geolocation
      let location = profile.location;

      if (!location) {
        // Try to get location via browser geolocation API
        try {
          const coords = await getUserLocation();
          location = {
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
        } catch (err: any) {
          // User denied location or browser doesn't support it
          console.warn('Could not get user location:', err.message);
          setError('Location access required for weather data');
          setLoading(false);
          return;
        }
      }

      // Step 3: Fetch weather from API
      const response = await getWeather(location.latitude, location.longitude);

      if (response.success && response.weather) {
        // Step 4: Save to cache
        saveCachedWeather(response.weather);

        // Step 5: Update state
        setWeather(response.weather);
        setError(null);
      } else {
        throw new Error(response.error || 'Failed to fetch weather');
      }
    } catch (err: any) {
      console.error('Failed to fetch weather:', err);
      setError(err.message || 'Failed to fetch weather');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear weather cache
   */
  const clearCache = (): void => {
    localStorage.removeItem(WEATHER_CACHE_KEY);
    setWeather(null);
  };

  /**
   * Auto-fetch weather on mount if location is available
   */
  useEffect(() => {
    // Only auto-fetch if we have a location (profile or geolocation possible)
    // Don't fetch if user explicitly denied location before
    const hasProfileLocation = !!profile.location;

    if (hasProfileLocation) {
      fetchWeather();
    } else {
      // Try to load from cache even without location
      // (user might have fetched before but location isn't saved)
      const cached = loadCachedWeather();
      if (cached) {
        setWeather(cached.weather);
      }
    }
  }, []); // Run once on mount

  return {
    weather,
    loading,
    error,
    fetchWeather,
    hasLocation: !!profile.location || !!weather,
    clearCache,
  };
}
