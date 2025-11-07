import React from 'react';

export const HoodieIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M25 20L35 15H45L50 10L55 15H65L75 20V35L70 30V85H30V30L25 35V20Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M42 15L45 10H55L58 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="50"
      cy="50"
      r="8"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
