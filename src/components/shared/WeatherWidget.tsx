import { Cloud, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';
import type { WeatherData } from '../../types';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading?: boolean;
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
export function WeatherWidget({ weather, loading }: WeatherWidgetProps) {
  if (loading) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!weather) {
    return null;
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
