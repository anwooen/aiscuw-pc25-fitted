import React from 'react';

export const SneakersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M20 55L30 45L40 40L50 38L60 40L70 45V55L75 60H25L20 55Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M30 45V50M40 40V50M50 38V50"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line x1="25" y1="60" x2="75" y2="60" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);
