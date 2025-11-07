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

interface Step5ColorsPatternsProps {
  favoriteColors: string[];
  onColorToggle: (color: string) => void;
}

/**
 * Step: Favorite Colors (simplified)
 */
export function Step5ColorsPatterns({ favoriteColors, onColorToggle }: Step5ColorsPatternsProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Favorite Colors</h2>
        <p className="text-lg text-white/70">Select at least 3 colors you love wearing</p>
      </div>

      <QuestionCard delay={0}>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {COLOR_OPTIONS.map((color) => {
            const isSelected = favoriteColors.includes(color.name);
            const isLight = color.hex === '#FFFFFF' || color.hex === '#d4c5b9';

            return (
              <motion.button
                key={color.name}
                onClick={() => onColorToggle(color.name)}
                className={`relative rounded-xl p-3 transition-all duration-200 ${
                  isSelected ? 'ring-4 ring-uw-gold scale-105' : 'ring-2 ring-white/20 hover:ring-white/40'
                }`}
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
                <p className={`text-xs font-medium text-center mt-2 ${isLight ? 'text-gray-800' : 'text-white'}`}>
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
    </div>
  );
}
