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
  const [isHovered, setIsHovered] = React.useState(false);

  // Different icon animations based on type
  const getIconAnimation = () => {
    if (iconAnimation === 'rotate') {
      return {
        rotate: isHovered ? 360 : 0,
        scale: isHovered ? 1.1 : 1,
      };
    }
    if (iconAnimation === 'glow') {
      return {
        scale: isHovered ? 1.1 : 1,
        filter: isHovered ? 'drop-shadow(0 0 8px rgba(183, 165, 122, 0.6))' : 'drop-shadow(0 0 0px rgba(183, 165, 122, 0))',
      };
    }
    if (iconAnimation === 'swipe') {
      return {
        x: isHovered ? [0, -10, 10, 0] : 0,
        scale: isHovered ? 1.05 : 1,
      };
    }
    return {};
  };

  return (
    <motion.article
      className="relative group"
      variants={cardVariants}
      custom={delay}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="p-6 rounded-2xl backdrop-blur-md transition-all duration-300 border"
        style={{
          background: isHovered
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(255, 255, 255, 0.05)',
          borderColor: isHovered
            ? 'rgba(183, 165, 122, 0.3)'
            : 'rgba(255, 255, 255, 0.1)',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: isHovered
            ? '0 12px 40px rgba(0, 0, 0, 0.2)'
            : '0 4px 15px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Animated Icon */}
        <motion.div
          className="mb-4 text-uw-gold"
          animate={getIconAnimation()}
          transition={{
            duration: iconAnimation === 'rotate' ? 0.6 : 0.3,
            ease: iconAnimation === 'swipe' ? 'easeInOut' : 'easeOut',
          }}
        >
          <Icon size={48} strokeWidth={1.5} />
        </motion.div>

        {/* Title */}
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.article>
  );
};
