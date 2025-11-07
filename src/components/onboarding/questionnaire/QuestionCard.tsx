import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface QuestionCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Phase 13: Reusable glass-morphism card for questionnaire steps
 * Matches the visual style of Welcome page FeatureCard
 */
export function QuestionCard({ children, delay = 0, className = '' }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.34, 1.56, 0.64, 1], // Bounce easing
      }}
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/5 backdrop-blur-md
        border border-white/10
        p-6 md:p-8
        transition-all duration-300
        hover:bg-white/8 hover:border-uw-gold/30
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
