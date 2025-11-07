import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Dumbbell, Home, Users, Award, Heart } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { QuestionCard } from './QuestionCard';

interface Occasion {
  id: 'work' | 'class' | 'gym' | 'casual' | 'social' | 'formal' | 'date';
  label: string;
  description: string;
  icon: LucideIcon;
}

const occasions: Occasion[] = [
  {
    id: 'work',
    label: 'Work',
    description: 'Office or professional settings',
    icon: Briefcase,
  },
  {
    id: 'class',
    label: 'Class',
    description: 'College lectures and studying',
    icon: GraduationCap,
  },
  {
    id: 'gym',
    label: 'Gym',
    description: 'Workouts and athletic activities',
    icon: Dumbbell,
  },
  {
    id: 'casual',
    label: 'Casual',
    description: 'Everyday errands and hangouts',
    icon: Home,
  },
  {
    id: 'social',
    label: 'Social',
    description: 'Parties, events, and gatherings',
    icon: Users,
  },
  {
    id: 'formal',
    label: 'Formal',
    description: 'Interviews and ceremonies',
    icon: Award,
  },
  {
    id: 'date',
    label: 'Date',
    description: 'Romantic outings',
    icon: Heart,
  },
];

interface Step2LifeOccasionsProps {
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
}

/**
 * Phase 13: Step 2 - Life Occasions
 * Rate how often you dress for each occasion
 */
export function Step2LifeOccasions({ values, onChange }: Step2LifeOccasionsProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          What's your lifestyle?
        </h2>
        <p className="text-lg text-white/70">
          How often do you dress for these occasions? (0 = never, 10 = daily)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {occasions.map((occasion, index) => {
          const Icon = occasion.icon;
          const value = values[occasion.id] || 0;
          const isFrequent = value >= 7;

          return (
            <QuestionCard key={occasion.id} delay={index * 0.1}>
              <div className="flex items-start gap-4">
                {/* Icon */}
                <motion.div
                  className={`
                    flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center
                    transition-all duration-300
                    ${isFrequent ? 'bg-uw-purple/30' : 'bg-white/10'}
                  `}
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon
                    className={`w-7 h-7 ${isFrequent ? 'text-uw-gold' : 'text-white'}`}
                  />
                </motion.div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{occasion.label}</h3>
                    <p className="text-sm text-white/60">{occasion.description}</p>
                  </div>

                  {/* Frequency slider with bar visualization */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">Never</span>
                      <span className="text-white font-bold">{value}/10</span>
                      <span className="text-white/50">Daily</span>
                    </div>

                    {/* Visual bar chart */}
                    <div className="relative h-8 bg-white/10 rounded-lg overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-uw-purple to-uw-gold rounded-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${(value / 10) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/80 text-xs font-medium">
                          {value === 0
                            ? 'Never'
                            : value <= 3
                            ? 'Rarely'
                            : value <= 6
                            ? 'Sometimes'
                            : value <= 8
                            ? 'Often'
                            : 'Daily'}
                        </span>
                      </div>
                    </div>

                    {/* Slider control */}
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={value}
                      onChange={(e) => onChange(occasion.id, parseInt(e.target.value))}
                      className="
                        w-full h-2 rounded-full appearance-none cursor-pointer
                        bg-white/10
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:bg-uw-gold
                        [&::-webkit-slider-thumb]:cursor-pointer
                        [&::-webkit-slider-thumb]:transition-all
                        [&::-webkit-slider-thumb]:hover:scale-125
                        [&::-moz-range-thumb]:w-4
                        [&::-moz-range-thumb]:h-4
                        [&::-moz-range-thumb]:rounded-full
                        [&::-moz-range-thumb]:bg-uw-gold
                        [&::-moz-range-thumb]:border-0
                        [&::-moz-range-thumb]:cursor-pointer
                      "
                    />
                  </div>
                </div>
              </div>
            </QuestionCard>
          );
        })}
      </div>
    </div>
  );
}
