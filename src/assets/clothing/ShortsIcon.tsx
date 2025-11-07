import React from 'react';

export const ShortsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M30 20H70V45H68V60H58V45H42V60H32V45H30V20Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="35" y1="25" x2="40" y2="25" stroke="currentColor" strokeWidth="2" />
    <line x1="60" y1="25" x2="65" y2="25" stroke="currentColor" strokeWidth="2" />
  </svg>
);
