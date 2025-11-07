import React, { useMemo } from 'react';
import { MeshGradient } from './MeshGradient';
import { useMouseTracking } from '../animations/useMouseTracking';

export const AnimatedBackground: React.FC = React.memo(() => {
  const { mousePosition, isMouseActive } = useMouseTracking();

  // Calculate parallax transform based on mouse position
  const parallaxTransform = useMemo(() => {
    if (!isMouseActive) return 'translate(0, 0)';

    // Move background opposite to mouse movement (±20px max)
    const maxShift = 20;
    const translateX = -mousePosition.x * maxShift;
    const translateY = -mousePosition.y * maxShift;

    return `translate(${translateX}px, ${translateY}px)`;
  }, [mousePosition, isMouseActive]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        transform: parallaxTransform,
        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform',
      }}
    >
      <MeshGradient />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';
