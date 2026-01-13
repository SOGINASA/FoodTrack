import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ size = 'md', text, fullScreen = false }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizes[size]} animate-spin text-black`} />
      {text && <p className="text-sm text-secondary">{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }
  
  return content;
};

export const SkeletonLoader = ({ className = '', count = 1 }) => {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className={className}>
          <div className="h-20 bg-gray-200 rounded-2xl mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};

export default Loader;