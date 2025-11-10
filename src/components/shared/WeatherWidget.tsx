import { Cloud, CloudRain, CloudSnow, Sun, Wind, MapPin } from 'lucide-react';
import type { WeatherData } from '../../types';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading?: boolean;
  error?: string | null;
  onRequestWeather?: () => void;
}

/**
 * Get weather icon based on condition
 */
const getWeatherIcon = (condition: string) => {
  const lower = condition.toLowerCase();

  if (lower.includes('rain') || lower.includes('drizzle')) {
    return <CloudRain className="w-6 h-6" />;
  }
  if (lower.includes('snow') || lower.includes('sleet')) {
    return <CloudSnow className="w-6 h-6" />;
  }
  if (lower.includes('cloud') || lower.includes('overcast')) {
    return <Cloud className="w-6 h-6" />;
  }
  if (lower.includes('wind')) {
    return <Wind className="w-6 h-6" />;
  }
  // Default to sunny
  return <Sun className="w-6 h-6" />;
};

/**
 * Weather widget for displaying current conditions
 */
export function WeatherWidget({ weather, loading, error, onRequestWeather }: WeatherWidgetProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    // Show error message with retry button
    return (
      <button
        onClick={onRequestWeather}
        className="bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 shadow-md border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Cloud className="w-6 h-6 text-red-500" />
          <div className="text-sm text-left">
            <div className="font-semibold text-red-900 dark:text-red-200">Weather Error</div>
            <div className="text-xs text-red-700 dark:text-red-300">Click to retry</div>
          </div>
        </div>
      </button>
    );
  }

  if (!weather) {
    // Show button to get weather
    return (
      <button
        onClick={onRequestWeather}
        className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-uw-purple" />
          <div className="text-sm text-left">
            <div className="font-semibold text-gray-900 dark:text-white">Get Weather</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Click to enable</div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Weather Icon */}
        <div className="text-uw-purple dark:text-uw-gold">
          {getWeatherIcon(weather.condition)}
        </div>

        {/* Temperature & Condition */}
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(weather.temperature)}°F
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {weather.condition}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-right text-xs text-gray-600 dark:text-gray-400">
          {weather.precipitation > 0 && (
            <div>💧 {weather.precipitation}%</div>
          )}
          <div>Feels {Math.round(weather.feelsLike)}°F</div>
        </div>
      </div>
    </div>
  );
}
