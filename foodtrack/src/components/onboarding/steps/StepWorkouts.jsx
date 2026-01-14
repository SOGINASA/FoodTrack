import React from 'react';
import { useOnboardingDraft } from '../../../context/OnboardingContext';

const options = [
  { value: 0, label: '0' },
  { value: 1, label: '1–2' },
  { value: 3, label: '3–4' },
  { value: 5, label: '5–6' },
  { value: 7, label: '7+' },
];

export default function StepWorkouts() {
  const { draft, updateField } = useOnboardingDraft();

  const isSelected = (val) => {
    const current = Number(draft.workoutsPerWeek || 0);
    return current === val;
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black tracking-tight">
        Тренировки в неделю
      </h1>
      <p className="text-sm text-gray-500 mt-2">
        Это помогает точнее рассчитать вашу дневную норму.
      </p>

      <div className="mt-6 space-y-3">
        {options.map((opt) => {
          const selected = isSelected(opt.value);

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateField('workoutsPerWeek', opt.value)}
              className={[
                'w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-left',
                'transition',
                selected
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 bg-white text-black hover:border-black',
              ].join(' ')}
            >
              <span className="text-base font-medium">{opt.label}</span>
              <span
                className={[
                  'h-2.5 w-2.5 rounded-full',
                  selected ? 'bg-white' : 'bg-gray-300',
                ].join(' ')}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-5 text-xs text-gray-500 leading-relaxed">
        Под тренировками понимаются любые активности: зал, бег, футбол, домашние упражнения и т.д.
      </div>
    </div>
  );
}
