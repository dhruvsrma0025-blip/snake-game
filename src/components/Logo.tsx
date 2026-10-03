import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-20 h-20" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main Snake Body (Continuous Line) */}
      <path 
        d="M 40 50 
           L 30 50 
           A 10 10 0 0 0 20 60 
           A 10 10 0 0 0 30 70 
           L 70 70 
           A 10 10 0 0 0 80 60 
           A 10 10 0 0 0 70 50 
           L 60 50 
           L 80 30 
           L 60 10 
           L 40 10 
           L 20 30 
           Z" 
        stroke="#D4AF37" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Eyes */}
      <path 
        d="M 38 30 L 45 34" 
        stroke="#D4AF37" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      <path 
        d="M 62 30 L 55 34" 
        stroke="#D4AF37" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      {/* Tongue */}
      <path 
        d="M 50 45 L 50 55 M 50 55 L 46 60 M 50 55 L 54 60" 
        stroke="#D4AF37" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
};
