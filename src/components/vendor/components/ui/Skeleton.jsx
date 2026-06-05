import React from 'react';

export default function Skeleton({ className = '', variant = 'rect' }) {
  const baseClasses = 'bg-slate-200 animate-pulse';
  const variants = {
    rect: 'rounded-md',
    circle: 'rounded-full',
    text: 'rounded h-3 w-full',
  };

  return <div className={`${baseClasses} ${variants[variant]} ${className}`} />;
}
