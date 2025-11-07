import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { QuestionCard } from './QuestionCard';

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

const PATTERN_OPTIONS = [
  { name: 'solid', label: 'Solid', description: 'One color, no patterns' },
  { name: 'striped', label: 'Striped', description: 'Lines and stripes' },
  { name: 'plaid', label: 'Plaid', description: 'Checkered patterns' },
  { name: 'floral', label: 'Floral', description: 'Flowers and plants' },
  { name: 'graphic', label: 'Graphic', description: 'Logos and prints' },
  { name: 'textured', label: 'Textured', description: 'Knit, corduroy, etc.' },
];

interface Step5ColorsPatternsProps {
  favoriteColors: string[];
  patternPreferences: Record<string, number>;
  colorPreferences: {
    monochrome: number;
    colorful: number;
    neutral: number;
    matching: boolean;
    metalAccents: boolean;
  };
  onColorToggle: (color: string) => void;
  onPatternChange: (pattern: string, value: number) => void;
  onColorPrefChange: (field: string, value: number | boolean) => void;
}

/**
 * Phase 13: Step 5 - Colors & Patterns
 * Enhanced color selection + new pattern preferences
 */
export function Step5ColorsPatterns({
  favoriteColors,
  patternPreferences,
  colorPreferences,
  onColorToggle,
  onPatternChange,
  onColorPrefChange,
}: Step5ColorsPatternsProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Colors & Patterns
        </h2>
        <p className="text-lg text-white/70">
          Show us your color palette and pattern preferences
        </p>
      </div>

      {/* Favorite Colors */}
      <QuestionCard delay={0}>
        <h3 className="text-2xl font-bold text-white mb-4">Favorite Colors</h3>
        <p className="text-white/70 mb-4">Select at least 3 colors you love wearing</p>

        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {COLOR_OPTIONS.map((color) => {
            const isSelected = favoriteColors.includes(color.name);
            const isLight = color.hex === '#FFFFFF' || color.hex === '#d4c5b9';

            return (
              <motion.button
                key={color.name}
                onClick={() => onColorToggle(color.name)}
                className={`
                  relative rounded-xl p-3 transition-all duration-200
                  ${isSelected ? 'ring-4 ring-uw-gold scale-105' : 'ring-2 ring-white/20 hover:ring-white/40'}
                `}
                style={{ backgroundColor: color.hex }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="aspect-square rounded-lg" />
                {isSelected && (
                  <motion.div
                    className={`absolute top-1 right-1 w-6 h-6 rounded-full ${
                      isLight ? 'bg-uw-purple' : 'bg-uw-gold'
                    } flex items-center justify-center`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check className={`w-4 h-4 ${isLight ? 'text-white' : 'text-uw-purple'}`} />
                  </motion.div>
                )}
                <p
                  className={`text-xs font-medium text-center mt-2 ${
                    isLight ? 'text-gray-800' : 'text-white'
                  }`}
                >
                  {color.name}
                </p>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-4 text-center text-sm text-white/60">
          Selected: {favoriteColors.length} {favoriteColors.length < 3 && '(minimum 3)'}
        </div>
      </QuestionCard>

      {/* Color Style Preferences */}
      <QuestionCard delay={0.1}>
        <h3 className="text-2xl font-bold text-white mb-4">Color Style</h3>

        <div className="space-y-4">
          {/* Monochrome */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Monochrome (Black/White/Gray)</span>
              <span className="text-white/70">{colorPreferences.monochrome}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={colorPreferences.monochrome}
              onChange={(e) => onColorPrefChange('monochrome', parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-300 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Colorful */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Colorful (Bright & Bold)</span>
              <span className="text-white/70">{colorPreferences.colorful}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={colorPreferences.colorful}
              onChange={(e) => onColorPrefChange('colorful', parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-400 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>

          {/* Neutral */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Neutral (Earth Tones)</span>
              <span className="text-white/70">{colorPreferences.neutral}/10</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={colorPreferences.neutral}
              onChange={(e) => onColorPrefChange('neutral', parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-700 [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
        </div>

        {/* Toggle preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <motion.button
            onClick={() => onColorPrefChange('matching', !colorPreferences.matching)}
            className={`p-4 rounded-xl text-left transition-all duration-300 ${
              colorPreferences.matching
                ? 'bg-uw-purple border-2 border-uw-gold'
                : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-white font-medium">Matching colors</div>
            <div className="text-xs text-white/60">Coordinated, harmonious</div>
          </motion.button>

          <motion.button
            onClick={() => onColorPrefChange('metalAccents', !colorPreferences.metalAccents)}
            className={`p-4 rounded-xl text-left transition-all duration-300 ${
              colorPreferences.metalAccents
                ? 'bg-uw-purple border-2 border-uw-gold'
                : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-white font-medium">Metal accents</div>
            <div className="text-xs text-white/60">Gold/silver accessories</div>
          </motion.button>
        </div>
      </QuestionCard>

      {/* Pattern Preferences */}
      <QuestionCard delay={0.2}>
        <h3 className="text-2xl font-bold text-white mb-4">Pattern Preferences</h3>
        <p className="text-white/70 mb-4">Rate how much you like each pattern style</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PATTERN_OPTIONS.map((pattern) => {
            const value = patternPreferences[pattern.name] || 5;

            return (
              <div key={pattern.name} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{pattern.label}</span>
                    <span className="text-white/70 text-sm">{value}/10</span>
                  </div>
                  <p className="text-xs text-white/50">{pattern.description}</p>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  value={value}
                  onChange={(e) => onPatternChange(pattern.name, parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-uw-gold [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </QuestionCard>
    </div>
  );
}
