import React from 'react';

export const BootsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M30 20V50L25 55V65H70V55L65 50V30L60 20H30Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="35" y1="30" x2="55" y2="30" stroke="currentColor" strokeWidth="2" />
    <line x1="25" y1="65" x2="70" y2="65" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);
