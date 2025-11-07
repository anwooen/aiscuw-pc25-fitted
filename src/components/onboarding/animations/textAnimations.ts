import { Variants } from 'framer-motion';

// Container for staggering letter animations
export const titleContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.3,
    },
  },
};

// Individual letter animation
export const titleLetterVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1], // bounce easing
    },
  },
};

// Subtitle slide up + fade
export const subtitleVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 0.9,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 1.0,
      ease: 'easeOut',
    },
  },
};

// Description fade in
export const descriptionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 0.8,
    transition: {
      duration: 0.6,
      delay: 1.4,
      ease: 'easeOut',
    },
  },
};
