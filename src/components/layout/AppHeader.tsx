import { Moon, Sun } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useWeather } from '../../hooks/useWeather';
import { Header } from './Header';
import { WeatherWidget } from '../shared/WeatherWidget';

interface AppHeaderProps {
  subtitle: string;
  extraRightContent?: React.ReactNode;
}

/**
 * Standardized app header component used across all pages
 *
 * Features:
 * - Consistent "Fitted" branding
 * - Theme toggle (left)
 * - Weather widget (right)
 * - Page-specific subtitle
 * - Optional extra content (e.g., item count on Wardrobe)
 */
export const AppHeader = ({ subtitle, extraRightContent }: AppHeaderProps) => {
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const { weather, loading: weatherLoading, error: weatherError, fetchWeather } = useWeather();

  // Theme toggle button
  const themeToggle = (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );

  // Weather widget
  const weatherWidget = (
    <div className="flex items-center">
      <WeatherWidget
        weather={weather}
        loading={weatherLoading}
        error={weatherError}
        onRequestWeather={fetchWeather}
      />
    </div>
  );

  // Combine weather widget with any extra content
  const rightContent = extraRightContent ? (
    <div className="flex items-center gap-4">
      {weatherWidget}
      {extraRightContent}
    </div>
  ) : (
    weatherWidget
  );

  return (
    <Header
      title="Fitted"
      subtitle={subtitle}
      leftContent={themeToggle}
      rightContent={rightContent}
    />
  );
};
