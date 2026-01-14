import React, { useMemo } from 'react';
import { useOnboardingDraft } from '../../../context/OnboardingContext';

const options = [1, 2, 3, 4, 5, 6];

export default function StepMealsPerDay() {
  const { draft, updateField } = useOnboardingDraft();

  const current = useMemo(() => Number(draft.mealsPerDay || 3), [draft.mealsPerDay]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black tracking-tight">
        Приёмов пищи в день
      </h1>
      <p className="text-sm text-gray-500 mt-2">
        Это поможет удобнее вести дневник.
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {options.map((n) => {
          const selected = current === n;

          return (
            <button
              key={n}
              type="button"
              onClick={() => updateField('mealsPerDay', n)}
              className={[
                'rounded-2xl border py-4 text-center font-semibold text-base transition',
                selected
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 bg-white text-black hover:border-black',
              ].join(' ')}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="mt-5 text-xs text-gray-500 leading-relaxed">
        Если иногда бывают перекусы — ничего страшного, можно добавлять отдельно.
      </div>
    </div>
  );
}
