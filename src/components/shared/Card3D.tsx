import { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useStore } from '../../store/useStore';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  depth?: 'shallow' | 'medium' | 'deep'; // Tilt intensity
}

/**
 * Card3D - Premium 3D tilt effect card component
 *
 * Features:
 * - Mouse tracking for realistic tilt
 * - Theme-aware shadows and glows (light/dark mode)
 * - Spring physics for smooth motion
 * - Respects prefers-reduced-motion
 * - Optimized performance (60fps target)
 */
export const Card3D = ({ children, className = '', depth = 'medium' }: Card3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { theme } = useStore();

  // Motion values for tilt angles
  const mouseX = useMotionValue(0.5); // 0-1 (0 = left, 1 = right)
  const mouseY = useMotionValue(0.5); // 0-1 (0 = top, 1 = bottom)

  // Spring physics for smooth motion
  const springConfig = { stiffness: 300, damping: 20 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  // Tilt intensity based on depth
  const depthMultipliers = {
    shallow: 5,  // ±5 degrees
    medium: 10,  // ±10 degrees
    deep: 15,    // ±15 degrees
  };
  const maxTilt = depthMultipliers[depth];

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || prefersReducedMotion) return;

    const rect = cardRef.current.getBoundingClientRect();

    // Calculate mouse position relative to card center (0-1 range)
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    mouseX.set(x);
    mouseY.set(y);

    // Calculate rotation angles
    // X rotation: based on Y position (tilt forward/backward)
    // Y rotation: based on X position (tilt left/right)
    const xRotation = (y - 0.5) * maxTilt * -1; // Invert for natural feel
    const yRotation = (x - 0.5) * maxTilt;

    rotateX.set(xRotation);
    rotateY.set(yRotation);
  };

  // Reset tilt when mouse leaves
  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;

    mouseX.set(0.5);
    mouseY.set(0.5);
    rotateX.set(0);
    rotateY.set(0);
  };

  // Theme-aware shadow styles
  const shadowStyles = theme === 'dark'
    ? {
        // Dark mode: Purple-tinted shadows (deeper, more dramatic)
        boxShadow: `
          0 20px 60px rgba(75, 46, 131, 0.4),
          0 10px 30px rgba(75, 46, 131, 0.3),
          0 0 20px rgba(183, 165, 122, 0.2)
        `,
      }
    : {
        // Light mode: Purple glow with gray shadows
        boxShadow: `
          0 20px 60px rgba(0, 0, 0, 0.12),
          0 10px 30px rgba(0, 0, 0, 0.08),
          0 0 20px rgba(75, 46, 131, 0.3)
        `,
      };

  // Theme-aware edge glow (subtle highlight on top edge)
  const glowStyles = theme === 'dark'
    ? {
        // Dark mode: Gold glow
        background: `linear-gradient(to bottom, rgba(183, 165, 122, 0.3), transparent 40%)`,
      }
    : {
        // Light mode: White glow
        background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent 40%)`,
      };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        perspective: '1000px', // Enable 3D space
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformStyle: 'preserve-3d',
          ...shadowStyles,
        }}
        className="relative rounded-2xl overflow-hidden will-change-transform"
      >
        {/* Edge glow overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl opacity-50"
          style={{
            ...glowStyles,
            transform: 'translateZ(1px)', // Slightly in front
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};
