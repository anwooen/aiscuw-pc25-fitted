import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../shared/Button';
import type { StylePreference } from '../../types';

interface QuestionnaireData {
  stylePreferences: Record<StylePreference, number>;
  favoriteColors: string[];
}

interface FashionQuestionnaireProps {
  onComplete: (data: QuestionnaireData) => void;
  onBack: () => void;
}

const STYLE_OPTIONS: { value: StylePreference; label: string; description: string; emoji: string }[] = [
  { value: 'casual', label: 'Casual', description: 'Relaxed, everyday comfort', emoji: '👕' },
  { value: 'formal', label: 'Formal', description: 'Business and dressy attire', emoji: '👔' },
  { value: 'streetwear', label: 'Streetwear', description: 'Urban, trendy, and bold', emoji: '🧢' },
  { value: 'athletic', label: 'Athletic', description: 'Sporty and active wear', emoji: '⚡' },
  { value: 'preppy', label: 'Preppy', description: 'Classic collegiate style', emoji: '🎓' },
];

const COLOR_OPTIONS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1e3a8a' },
  { name: 'Gray', hex: '#7f8c8d' },
  { name: 'Beige', hex: '#d4c5b9' },
  { name: 'Brown', hex: '#8b4513' },
  { name: 'Red', hex: '#dc2626' },
  { name: 'Blue', hex: '#3498db' },
  { name: 'Green', hex: '#27ae60' },
  { name: 'Purple', hex: '#9b59b6' },
  { name: 'Pink', hex: '#fd79a8' },
  { name: 'Yellow', hex: '#f1c40f' },
  { name: 'Orange', hex: '#e67e22' },
  { name: 'Burgundy', hex: '#800020' },
];

export const FashionQuestionnaire: React.FC<FashionQuestionnaireProps> = ({
  onComplete,
  onBack,
}) => {
  const [step, setStep] = useState(1);
  const [stylePreferences, setStylePreferences] = useState<Record<StylePreference, number>>({
    casual: 5,
    formal: 5,
    streetwear: 5,
    athletic: 5,
    preppy: 5,
  });
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);

  const handleStyleChange = (style: StylePreference, value: number) => {
    setStylePreferences((prev) => ({
      ...prev,
      [style]: value,
    }));
  };

  const toggleColor = (colorName: string) => {
    setFavoriteColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onComplete({ stylePreferences, favoriteColors });
    }
  };

  const canProceed = step === 1 || favoriteColors.length >= 3;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold text-uw-purple">
              {step === 1 ? 'Your Style Preferences' : 'Your Favorite Colors'}
            </h2>
            <span className="text-sm text-gray-500">Step {step} of 2</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {step === 1
              ? 'Rate how much you like each style from 1-10'
              : 'Select at least 3 colors you love wearing'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-uw-purple h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Step 1: Style Preferences */}
        {step === 1 && (
          <div className="space-y-6 mb-8">
            {STYLE_OPTIONS.map((style) => (
              <div
                key={style.value}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{style.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {style.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {style.description}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-uw-purple">
                    {stylePreferences[style.value]}
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={stylePreferences[style.value]}
                  onChange={(e) =>
                    handleStyleChange(style.value, parseInt(e.target.value))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-uw-purple"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Not my style</span>
                  <span>Love it!</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Color Preferences */}
        {step === 2 && (
          <div className="mb-8">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => toggleColor(color.name)}
                  className={`
                    relative rounded-xl p-4 transition-all duration-200
                    ${
                      favoriteColors.includes(color.name)
                        ? 'ring-4 ring-uw-purple scale-105'
                        : 'ring-2 ring-gray-200 hover:ring-gray-300'
                    }
                  `}
                  style={{ backgroundColor: color.hex }}
                >
                  <div className="aspect-square rounded-lg" />
                  <p
                    className={`
                      text-xs font-medium text-center mt-2
                      ${color.hex === '#FFFFFF' || color.hex === '#d4c5b9' ? 'text-gray-800' : 'text-white'}
                    `}
                  >
                    {color.name}
                  </p>
                  {favoriteColors.includes(color.name) && (
                    <div className="absolute top-2 right-2 bg-uw-purple text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              {favoriteColors.length} selected (minimum 3)
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={step === 1 ? onBack : () => setStep(1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Back' : 'Previous'}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            {step === 1 ? 'Next' : 'Complete'}
            {step === 1 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
