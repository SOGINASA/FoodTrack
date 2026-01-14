import React, { useMemo } from 'react';
import { useOnboardingDraft } from '../../../context/OnboardingContext';

const options = [
  { value: 'none', label: 'Нет' },
  { value: 'keto', label: 'Кето' },
  { value: 'vegetarian', label: 'Вегетарианство' },
  { value: 'vegan', label: 'Веганство' },
  { value: 'halal', label: 'Халяль' },
  { value: 'lowcarb', label: 'Низкоуглеводная' },
  { value: 'custom', label: 'Другое' },
];

export default function StepDiet() {
  const { draft, updateField } = useOnboardingDraft();

  const showNotes = useMemo(() => draft.diet === 'custom', [draft.diet]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black tracking-tight">
        Диета сейчас
      </h1>
      <p className="text-sm text-gray-500 mt-2">
        Выберите, если уже придерживаетесь какого-то режима питания.
      </p>

      <div className="mt-6 space-y-3">
        {options.map((opt) => {
          const selected = draft.diet === opt.value;

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateField('diet', opt.value)}
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

      {showNotes && (
        <div className="mt-5">
          <label className="block text-sm font-medium text-black mb-2">
            Опишите кратко (необязательно)
          </label>
          <input
            value={draft.dietNotes || ''}
            onChange={(e) => updateField('dietNotes', e.target.value)}
            className={[
              'w-full rounded-2xl border px-4 py-3 text-base outline-none',
              'border-gray-200 focus:ring-2 focus:ring-black focus:border-black transition',
            ].join(' ')}
            placeholder="Например: без сахара, интервальное голодание и т.д."
          />
          <div className="mt-2 text-xs text-gray-500">
            Это поможет точнее подстраивать советы и аналитику.
          </div>
        </div>
      )}
    </div>
  );
}
