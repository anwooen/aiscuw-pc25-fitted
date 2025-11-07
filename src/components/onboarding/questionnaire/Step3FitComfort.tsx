import { motion } from 'framer-motion';
import { Heart, Sparkles, TrendingUp } from 'lucide-react';
import { QuestionCard } from './QuestionCard';

type FitOption = 'tight' | 'fitted' | 'regular' | 'loose' | 'oversized';
type PriorityOption = 'comfort' | 'balanced' | 'fashion';

const fitOptions: { value: FitOption; label: string; description: string }[] = [
  { value: 'tight', label: 'Tight', description: 'Form-hugging fit' },
  { value: 'fitted', label: 'Fitted', description: 'Close to body' },
  { value: 'regular', label: 'Regular', description: 'Standard fit' },
  { value: 'loose', label: 'Loose', description: 'Relaxed fit' },
  { value: 'oversized', label: 'Oversized', description: 'Extra roomy' },
];

const priorityOptions: { value: PriorityOption; label: string; description: string; icon: typeof Heart }[] = [
  { value: 'comfort', label: 'Comfort', description: 'Cozy above all', icon: Heart },
  { value: 'balanced', label: 'Balanced', description: 'Best of both worlds', icon: Sparkles },
  { value: 'fashion', label: 'Fashion', description: 'Style first', icon: TrendingUp },
];

interface Step3FitComfortProps {
  fitPreferences: {
    tops: FitOption;
    bottoms: FitOption;
    overall: PriorityOption;
  };
  onChange: (field: 'tops' | 'bottoms' | 'overall', value: string) => void;
}

/**
 * Phase 13: Step 3 - Fit & Comfort
 * Select fit preferences for tops and bottoms, plus overall priority
 */
export function Step3FitComfort({ fitPreferences, onChange }: Step3FitComfortProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          What's your comfort zone?
        </h2>
        <p className="text-lg text-white/70">
          Choose the fit that makes you feel your best
        </p>
      </div>

      {/* Tops Fit */}
      <QuestionCard delay={0}>
        <h3 className="text-2xl font-bold text-white mb-4">Tops</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {fitOptions.map((option) => {
            const isSelected = fitPreferences.tops === option.value;

            return (
              <motion.button
                key={option.value}
                onClick={() => onChange('tops', option.value)}
                className={`
                  p-4 rounded-xl text-center transition-all duration-300
                  ${
                    isSelected
                      ? 'bg-uw-purple border-2 border-uw-gold text-white'
                      : 'bg-white/10 border-2 border-white/20 text-white/70 hover:bg-white/20'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-bold text-lg mb-1">{option.label}</div>
                <div className="text-xs opacity-80">{option.description}</div>
              </motion.button>
            );
          })}
        </div>
      </QuestionCard>

      {/* Bottoms Fit */}
      <QuestionCard delay={0.1}>
        <h3 className="text-2xl font-bold text-white mb-4">Bottoms</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {fitOptions.map((option) => {
            const isSelected = fitPreferences.bottoms === option.value;

            return (
              <motion.button
                key={option.value}
                onClick={() => onChange('bottoms', option.value)}
                className={`
                  p-4 rounded-xl text-center transition-all duration-300
                  ${
                    isSelected
                      ? 'bg-uw-purple border-2 border-uw-gold text-white'
                      : 'bg-white/10 border-2 border-white/20 text-white/70 hover:bg-white/20'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="font-bold text-lg mb-1">{option.label}</div>
                <div className="text-xs opacity-80">{option.description}</div>
              </motion.button>
            );
          })}
        </div>
      </QuestionCard>

      {/* Overall Priority */}
      <QuestionCard delay={0.2}>
        <h3 className="text-2xl font-bold text-white mb-4">What matters most?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {priorityOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = fitPreferences.overall === option.value;

            return (
              <motion.button
                key={option.value}
                onClick={() => onChange('overall', option.value)}
                className={`
                  p-6 rounded-xl transition-all duration-300
                  ${
                    isSelected
                      ? 'bg-gradient-to-br from-uw-purple to-uw-gold border-2 border-uw-gold text-white'
                      : 'bg-white/10 border-2 border-white/20 text-white/70 hover:bg-white/20'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-white/10'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-xl mb-1">{option.label}</div>
                    <div className="text-sm opacity-80">{option.description}</div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </QuestionCard>
    </div>
  );
}
