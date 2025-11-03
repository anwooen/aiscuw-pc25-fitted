import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  className = ''
}) => {
  return (
    <div className={`flex justify-center ${className}`}>
      <div className={`relative ${sizeMap[size]}`}>
        {/* White background circle */}
        <div
          className="absolute inset-0 rounded-full bg-white"
        ></div>
        {/* Spinning purple gradient track */}
        <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '1s' }}>
          <div className="w-full h-full rounded-full"
               style={{
                 background: `conic-gradient(
                   from 0deg,
                   transparent 0deg,
                   transparent 270deg,
                   #8b5cf6 270deg,
                   #a78bfa 300deg,
                   #c4b5fd 330deg,
                   #7c3aed 360deg
                 )`
               }}>
          </div>
        </div>
        {/* Inner white circle */}
        <div className="absolute inset-3 rounded-full bg-white"></div>
      </div>
    </div>
  );
};
