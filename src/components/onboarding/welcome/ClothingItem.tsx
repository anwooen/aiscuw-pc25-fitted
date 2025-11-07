import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  floatingItemVariants,
  floatAnimation,
  rotateAnimation,
} from '../animations/floatingAnimations';

interface ClothingItemProps {
  svg: React.ReactNode;
  position: { x: string; y: string }; // e.g., "15%", "10%"
  size: number; // px
  opacity: number; // 0-1
  floatDuration: number; // seconds
  rotateDuration: number; // seconds
  depth: 1 | 2 | 3; // Parallax depth (1=foreground, 3=background)
  delay: number; // Stagger delay
  mousePosition: { x: number; y: number }; // -1 to 1
  isMouseActive: boolean;
}

export const ClothingItem: React.FC<ClothingItemProps> = React.memo(
  ({
    svg,
    position,
    size,
    opacity,
    floatDuration,
    rotateDuration,
    depth,
    delay,
    mousePosition,
    isMouseActive,
  }) => {
    // Calculate parallax offset based on depth
    const parallaxOffset = useMemo(() => {
      if (!isMouseActive) return { x: 0, y: 0 };

      // More depth = less movement (background items move less)
      const depthMultipliers = {
        1: 40, // Foreground - max movement
        2: 25, // Mid-ground
        3: 15, // Background - min movement
      };

      const maxShift = depthMultipliers[depth];

      // Move opposite to mouse direction for parallax effect
      return {
        x: -mousePosition.x * maxShift,
        y: -mousePosition.y * maxShift,
      };
    }, [mousePosition, isMouseActive, depth]);

    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return (
      <motion.div
        className="absolute pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
          width: size,
          height: size,
          opacity,
          willChange: 'transform',
        }}
        variants={floatingItemVariants}
        initial="hidden"
        animate="visible"
        custom={delay}
      >
        <motion.div
          className="w-full h-full text-white"
          style={{
            filter: `blur(${depth === 3 ? 0.5 : 0}px)`,
          }}
          animate={
            prefersReducedMotion
              ? {}
              : {
                  ...floatAnimation(floatDuration),
                  ...rotateAnimation(rotateDuration),
                  x: parallaxOffset.x,
                  y: parallaxOffset.y,
                }
          }
          transition={{
            x: {
              type: 'spring',
              stiffness: 100,
              damping: 20,
            },
            y: {
              type: 'spring',
              stiffness: 100,
              damping: 20,
            },
          }}
        >
          {svg}
        </motion.div>
      </motion.div>
    );
  }
);

ClothingItem.displayName = 'ClothingItem';
