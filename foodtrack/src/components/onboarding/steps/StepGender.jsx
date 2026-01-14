import React from 'react';
import { useOnboardingDraft } from '../../../context/OnboardingContext';

const options = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
  { value: 'na', label: 'Не хочу указывать' },
];

export default function StepGender() {
  const { draft, updateField } = useOnboardingDraft();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black tracking-tight">
        Ваш пол
      </h1>
      <p className="text-sm text-gray-500 mt-2">
        Это помогает точнее подобрать дневные цели.
      </p>

      <div className="mt-6 space-y-3">
        {options.map((opt) => {
          const selected = draft.gender === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateField('gender', opt.value)}
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
    </div>
  );
}
