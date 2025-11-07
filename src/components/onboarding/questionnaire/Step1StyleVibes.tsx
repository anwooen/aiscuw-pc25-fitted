import { motion } from 'framer-motion';
import { Shirt, Briefcase, Zap, Activity, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { QuestionCard } from './QuestionCard';

interface StyleVibe {
  id: 'casual' | 'formal' | 'streetwear' | 'athletic' | 'preppy';
  label: string;
  description: string;
  icon: LucideIcon;
}

const styleVibes: StyleVibe[] = [
  {
    id: 'casual',
    label: 'Casual',
    description: 'Relaxed, everyday comfort',
    icon: Shirt,
  },
  {
    id: 'formal',
    label: 'Formal',
    description: 'Professional and polished',
    icon: Briefcase,
  },
  {
    id: 'streetwear',
    label: 'Streetwear',
    description: 'Bold, urban, trendy',
    icon: Zap,
  },
  {
    id: 'athletic',
    label: 'Athletic',
    description: 'Active and sporty',
    icon: Activity,
  },
  {
    id: 'preppy',
    label: 'Preppy',
    description: 'Classic and refined',
    icon: BookOpen,
  },
];

interface Step1StyleVibesProps {
  values: Record<string, number>;
  onChange: (id: string, value: number) => void;
}

/**
 * Phase 13: Step 1 - Style Vibes
 * Interactive cards with rating system (0-10)
 */
export function Step1StyleVibes({ values, onChange }: Step1StyleVibesProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          What's your style vibe?
        </h2>
        <p className="text-lg text-white/70">
          Rate how much you love each style (0 = not my thing, 10 = absolutely!)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {styleVibes.map((vibe, index) => {
          const Icon = vibe.icon;
          const value = values[vibe.id] || 5;
          const isHighlyRated = value >= 8;

          return (
            <QuestionCard key={vibe.id} delay={index * 0.1}>
              <div className="space-y-4">
                {/* Icon */}
                <motion.div
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center
                    transition-all duration-300
                    ${isHighlyRated ? 'bg-uw-gold/20' : 'bg-white/10'}
                  `}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Icon
                    className={`w-8 h-8 ${isHighlyRated ? 'text-uw-gold' : 'text-white'}`}
                  />
                </motion.div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{vibe.label}</h3>
                  <p className="text-sm text-white/60">{vibe.description}</p>
                </div>

                {/* Rating Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Not my thing</span>
                    <span className="text-white font-bold text-lg">{value}/10</span>
                    <span className="text-white/50">Love it!</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={value}
                    onChange={(e) => onChange(vibe.id, parseInt(e.target.value))}
                    className="
                      w-full h-2 rounded-full appearance-none cursor-pointer
                      bg-white/10
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-5
                      [&::-webkit-slider-thumb]:h-5
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-uw-gold
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:transition-all
                      [&::-webkit-slider-thumb]:hover:scale-110
                      [&::-moz-range-thumb]:w-5
                      [&::-moz-range-thumb]:h-5
                      [&::-moz-range-thumb]:rounded-full
                      [&::-moz-range-thumb]:bg-uw-gold
                      [&::-moz-range-thumb]:border-0
                      [&::-moz-range-thumb]:cursor-pointer
                    "
                  />

                  {/* Visual dots for rating */}
                  <div className="flex items-center justify-between px-1">
                    {Array.from({ length: 11 }).map((_, i) => (
                      <div
                        key={i}
                        className={`
                          w-1.5 h-1.5 rounded-full transition-all duration-200
                          ${i <= value ? 'bg-uw-gold' : 'bg-white/20'}
                        `}
                      />
                    ))}
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
