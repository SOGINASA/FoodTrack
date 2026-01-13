import React from 'react';

const StreakBadge = ({ streak = 0 }) => {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full shadow-lg">
      <span className="text-2xl">🔥</span>
      <div className="flex flex-col">
        <span className="text-lg font-bold leading-none">{streak}</span>
        <span className="text-xs opacity-90 font-medium">День</span>
      </div>
    </div>
  );
};

export default StreakBadge;