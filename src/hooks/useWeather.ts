import { useStore } from '../store/useStore';
import type { WeatherData } from '../types';

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
 * Phase 18: Refactored to use global Zustand store
 *
 * Custom hook for weather data with caching and location management
 *
 * Features:
 * - Automatic 30-minute caching in localStorage (handled by store)
 * - Falls back to geolocation API if profile location not set
 * - Graceful error handling (returns null, doesn't crash)
 * - Weather state persists across component unmounts (global store)
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
  // Phase 18: Use global store instead of local state
  const weather = useStore((state) => state.weatherData);
  const loading = useStore((state) => state.weatherLoading);
  const error = useStore((state) => state.weatherError);
  const fetchWeather = useStore((state) => state.fetchWeather);
  const clearCache = useStore((state) => state.clearWeatherCache);
  const profile = useStore((state) => state.profile);

  return {
    weather,
    loading,
    error,
    fetchWeather,
    hasLocation: !!profile.location || !!weather,
    clearCache,
  };
}
