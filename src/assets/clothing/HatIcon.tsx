import React from 'react';

export const HatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <ellipse
      cx="50"
      cy="50"
      rx="25"
      ry="8"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M35 50V35C35 26.7 41.7 20 50 20C58.3 20 65 26.7 65 35V50"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line x1="45" y1="50" x2="45" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
  </svg>
);
