import React from 'react';

export const MeshGradient: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient layer - inline styles for immediate rendering */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom right, #581c87, #6b21a8)',
          backgroundColor: '#6b21a8',
        }}
      />

      {/* Animated mesh gradient layer */}
      <div className="absolute inset-0 mesh-gradient" />

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-radial-vignette" />

      <style>{`
        @keyframes mesh-animation {
          0%, 100% {
            background-position: 0% 0%, 100% 0%, 0% 100%, 50% 50%, 100% 100%;
          }
          25% {
            background-position: 50% 50%, 50% 50%, 50% 0%, 0% 50%, 50% 100%;
          }
          50% {
            background-position: 100% 100%, 0% 100%, 100% 0%, 100% 50%, 0% 0%;
          }
          75% {
            background-position: 50% 100%, 50% 50%, 50% 50%, 100% 0%, 0% 50%;
          }
        }

        .mesh-gradient {
          background:
            radial-gradient(circle at 0% 0%, rgba(75, 46, 131, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 100% 0%, rgba(183, 165, 122, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, rgba(45, 26, 79, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(109, 76, 159, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(143, 122, 90, 0.5) 0%, transparent 50%);
          background-size: 100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%;
          animation: mesh-animation 8s ease-in-out infinite;
        }

        .bg-radial-vignette {
          background: radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
        }

        /* Mobile optimization - simpler gradient */
        @media (max-width: 768px) {
          .mesh-gradient {
            background:
              radial-gradient(circle at 20% 20%, rgba(75, 46, 131, 0.5) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(183, 165, 122, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 50% 80%, rgba(109, 76, 159, 0.4) 0%, transparent 50%);
            animation: mesh-animation 10s ease-in-out infinite;
          }
        }
      `}</style>
    </div>
  );
};
