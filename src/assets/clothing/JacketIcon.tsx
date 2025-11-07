import React from 'react';

export const JacketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M25 20L35 15L45 20V75H35L25 80V20Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M75 20L65 15L55 20V75H65L75 80V20Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M45 20L48 18L50 15L52 18L55 20V35H45V20Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="35" y1="30" x2="40" y2="30" stroke="currentColor" strokeWidth="2" />
    <line x1="60" y1="30" x2="65" y2="30" stroke="currentColor" strokeWidth="2" />
  </svg>
);
