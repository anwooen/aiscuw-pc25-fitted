import React from 'react';

export const JeansIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M35 15H65V50H63V85H55V50H45V85H37V50H35V15Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="40" y1="20" x2="45" y2="20" stroke="currentColor" strokeWidth="2" />
    <line x1="55" y1="20" x2="60" y2="20" stroke="currentColor" strokeWidth="2" />
    <circle cx="42" cy="27" r="2" fill="currentColor" />
    <circle cx="58" cy="27" r="2" fill="currentColor" />
  </svg>
);
