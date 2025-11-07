import { Variants } from 'framer-motion';

// Floating item enter animation
export const floatingItemVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
    y: 50,
  },
  visible: (delay: number) => ({
    opacity: 0.15,
    scale: 1,
    y: 0,
    transition: {
      duration: 1.2,
      delay,
      ease: [0.34, 1.56, 0.64, 1], // bounce easing
    },
  }),
};

// Float animation (vertical bobbing)
export const floatAnimation = (duration: number) => ({
  y: [0, -30, 0],
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut",
  },
});

// Rotate animation (gentle rotation)
export const rotateAnimation = (duration: number) => ({
  rotate: [0, 15, 0, -15, 0],
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut",
  },
});

// Helper to generate randomized animation durations
export const getRandomDuration = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};
