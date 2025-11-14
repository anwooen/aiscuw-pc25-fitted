import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Moon, Sun, Palette, TrendingUp, Trash2, AlertCircle, Shirt, Briefcase, Zap, Activity, BookOpen, User } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import type { StylePreference } from '../../types';
import type { LucideIcon } from 'lucide-react';

const STYLE_OPTIONS: { key: StylePreference; label: string; icon: LucideIcon }[] = [
  { key: 'casual', label: 'Casual', icon: Shirt },
  { key: 'formal', label: 'Formal', icon: Briefcase },
  { key: 'streetwear', label: 'Streetwear', icon: Zap },
  { key: 'athletic', label: 'Athletic', icon: Activity },
  { key: 'preppy', label: 'Preppy', icon: BookOpen },
];

const COLOR_OPTIONS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Navy', hex: '#1E3A8A' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Purple', hex: '#4B2E83' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Brown', hex: '#92400E' },
];

export const ProfileSettings = () => {
  const { profile, setProfile, theme, toggleTheme, resetApp } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [stylePreferences, setStylePreferences] = useState(profile.stylePreferences);
  const [favoriteColors, setFavoriteColors] = useState(profile.favoriteColors);

  const handleStyleChange = (style: StylePreference, value: number) => {
    setStylePreferences(prev => ({
      ...prev,
      [style]: value
    }));
  };

  const handleColorToggle = (colorName: string) => {
    setFavoriteColors(prev => {
      if (prev.includes(colorName)) {
        return prev.filter(c => c !== colorName);
      } else {
        return [...prev, colorName];
      }
    });
  };

  const handleSave = () => {
    setProfile({
      ...profile,
      stylePreferences,
      favoriteColors,
    });
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    resetApp();
    setShowResetConfirm(false);
    alert('App has been reset. Refresh the page to start over.');
  };

  return (
    <div className="space-y-6">
        {/* Account Authentication Section */}
        <div className={`rounded-xl p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <SignedOut>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-uw-purple/10 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-uw-purple dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className={`text-lg font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Account
                </h2>
                <p className={`text-sm mb-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Sign in to sync your wardrobe across devices and access from anywhere.
                </p>
                <div className="flex gap-3">
                  <SignInButton mode="modal">
                    <button className="px-4 py-2 bg-uw-purple hover:bg-uw-purple/90 text-white rounded-lg font-semibold transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className={`px-4 py-2 font-semibold rounded-lg transition-colors border-2 ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-purple-400 border-purple-400'
                        : 'bg-white hover:bg-gray-50 text-uw-purple border-uw-purple'
                    }`}>
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              </div>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <UserButton />
              </div>
              <div className="flex-1">
                <h2 className={`text-lg font-semibold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Account
                </h2>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Your wardrobe is synced and accessible across all your devices.
                </p>
              </div>
            </div>
          </SignedIn>
        </div>

        {/* Theme Toggle */}
        <div className={`rounded-xl p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-purple-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
              <div>
                <h3 className={`font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Theme
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {theme === 'dark' ? 'Dark' : 'Light'} mode
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Style Preferences */}
        <div className={`rounded-xl p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Style Preferences
            </h3>
          </div>
          <p className={`text-sm mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Rate how much you like each style (1-10)
          </p>

          <div className="space-y-4">
            {STYLE_OPTIONS.map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`} />
                    <span className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {label}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${
                    theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                  }`}>
                    {stylePreferences[key]}/10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={stylePreferences[key]}
                  onChange={(e) => handleStyleChange(key, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Colors */}
        <div className={`rounded-xl p-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}>
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-purple-500" />
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Favorite Colors
            </h3>
          </div>
          <p className={`text-sm mb-4 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Select colors you like to wear
          </p>

          <div className="grid grid-cols-4 gap-3">
            {COLOR_OPTIONS.map((color) => {
              const isSelected = favoriteColors.includes(color.name);
              return (
                <button
                  key={color.name}
                  onClick={() => handleColorToggle(color.name)}
                  className={`relative rounded-lg p-3 transition-all ${
                    isSelected
                      ? 'ring-2 ring-purple-600 ring-offset-2'
                      : theme === 'dark'
                      ? 'ring-1 ring-gray-600'
                      : 'ring-1 ring-gray-300'
                  }`}
                >
                  <div
                    className="w-full aspect-square rounded-md mb-1"
                    style={{
                      backgroundColor: color.hex,
                      border: color.hex === '#FFFFFF' ? '1px solid #e5e7eb' : 'none'
                    }}
                  />
                  <div className={`text-xs text-center ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {color.name}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-4 bg-uw-purple text-white font-semibold rounded-xl hover:bg-purple-800 transition-colors"
        >
          Save Changes
        </button>

        {/* Danger Zone */}
        <div className={`rounded-xl p-4 ${
          theme === 'dark' ? 'bg-red-900/20 border border-red-900/50' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className={`font-semibold ${
              theme === 'dark' ? 'text-red-400' : 'text-red-700'
            }`}>
              Danger Zone
            </h3>
          </div>
          <p className={`text-sm mb-4 ${
            theme === 'dark' ? 'text-red-300' : 'text-red-600'
          }`}>
            This will delete all your data including wardrobe items and outfit history.
          </p>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 flex items-center justify-center gap-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Reset App
            </button>
          ) : (
            <div className="space-y-2">
              <p className={`text-sm font-semibold ${
                theme === 'dark' ? 'text-red-400' : 'text-red-700'
              }`}>
                Are you sure? This cannot be undone!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className={`flex-1 py-3 font-semibold rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
};
