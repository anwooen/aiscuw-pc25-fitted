import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { QuestionCard } from './QuestionCard';

const PREDEFINED_GOALS = [
  'Look more professional',
  'Be more confident',
  'Stand out from the crowd',
  'Simplify my style',
  'Discover new styles',
  'Dress more sustainably',
  'Match my personality',
];

const PREDEFINED_INSPIRATIONS = [
  'Minimalist',
  'Vintage',
  'Tech-wear',
  'Bohemian',
  'Scandinavian',
  'Korean street style',
  'Old Money',
  'Y2K',
];

interface Step6FashionGoalsProps {
  fashionGoals: string[];
  inspirations: string[];
  onGoalToggle: (goal: string) => void;
  onInspirationToggle: (inspiration: string) => void;
}

/**
 * Phase 13: Step 6 - Fashion Goals & Inspirations
 * Multi-select chips for goals and style inspirations
 */
export function Step6FashionGoals({
  fashionGoals,
  inspirations,
  onGoalToggle,
  onInspirationToggle,
}: Step6FashionGoalsProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          What are you hoping to achieve?
        </h2>
        <p className="text-lg text-white/70">
          Tell us your fashion goals and inspirations
        </p>
      </div>

      {/* Fashion Goals */}
      <QuestionCard delay={0}>
        <h3 className="text-2xl font-bold text-white mb-4">Fashion Goals</h3>
        <p className="text-white/70 mb-4">Select all that resonate with you</p>

        <div className="flex flex-wrap gap-3">
          {PREDEFINED_GOALS.map((goal) => {
            const isSelected = fashionGoals.includes(goal);

            return (
              <motion.button
                key={goal}
                onClick={() => onGoalToggle(goal)}
                className={`
                  px-6 py-3 rounded-full font-medium transition-all duration-300
                  flex items-center gap-2
                  ${
                    isSelected
                      ? 'bg-gradient-to-r from-uw-purple to-uw-gold text-white border-2 border-uw-gold'
                      : 'bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/20 hover:text-white'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
                {goal}
              </motion.button>
            );
          })}
        </div>

        {fashionGoals.length > 0 && (
          <div className="mt-4 text-sm text-white/60">
            Selected {fashionGoals.length} {fashionGoals.length === 1 ? 'goal' : 'goals'}
          </div>
        )}
      </QuestionCard>

      {/* Style Inspirations */}
      <QuestionCard delay={0.1}>
        <h3 className="text-2xl font-bold text-white mb-4">Style Inspirations</h3>
        <p className="text-white/70 mb-4">What aesthetic vibes do you love?</p>

        <div className="flex flex-wrap gap-3">
          {PREDEFINED_INSPIRATIONS.map((inspiration) => {
            const isSelected = inspirations.includes(inspiration);

            return (
              <motion.button
                key={inspiration}
                onClick={() => onInspirationToggle(inspiration)}
                className={`
                  px-6 py-3 rounded-full font-medium transition-all duration-300
                  flex items-center gap-2
                  ${
                    isSelected
                      ? 'bg-gradient-to-r from-uw-purple to-uw-gold text-white border-2 border-uw-gold'
                      : 'bg-white/10 text-white/70 border-2 border-white/20 hover:bg-white/20 hover:text-white'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
                {inspiration}
              </motion.button>
            );
          })}
        </div>

        {inspirations.length > 0 && (
          <div className="mt-4 text-sm text-white/60">
            Selected {inspirations.length} {inspirations.length === 1 ? 'inspiration' : 'inspirations'}
          </div>
        )}
      </QuestionCard>

      {/* Optional message */}
      <QuestionCard delay={0.2}>
        <div className="text-center py-4">
          <p className="text-white/70 text-sm">
            Don't worry - you can always update your preferences later in settings!
          </p>
        </div>
      </QuestionCard>
    </div>
  );
}
