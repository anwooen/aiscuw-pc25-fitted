import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay: number;
  iconAnimation?: 'rotate' | 'glow' | 'swipe';
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.34, 1.56, 0.64, 1], // bounce easing
    },
  }),
};

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  delay,
  iconAnimation = 'rotate',
}) => {
  return (
    <motion.article
      className="relative group"
      variants={cardVariants}
      custom={delay}
      initial="hidden"
      animate="visible"
    >
      <div
        className="p-6 rounded-2xl backdrop-blur-md transition-all duration-300 border"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Icon */}
        <div className="mb-4 text-uw-gold">
          <Icon size={48} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.article>
  );
};
