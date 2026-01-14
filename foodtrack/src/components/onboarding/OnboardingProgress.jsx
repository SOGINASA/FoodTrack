import React, { useMemo } from 'react';

export default function OnboardingProgress({ stepNumber, totalSteps }) {
  const ratio = useMemo(() => {
    if (!totalSteps) return 0;
    return stepNumber / totalSteps;
  }, [stepNumber, totalSteps]);

  const percent = Math.round(ratio * 100);

  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-black rounded-full transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Готово: {percent}%
      </div>
    </div>
  );
}
