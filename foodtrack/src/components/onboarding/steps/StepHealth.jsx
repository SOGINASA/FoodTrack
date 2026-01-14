import React from 'react';
import { useOnboardingDraft } from '../../../context/OnboardingContext';

const FLAGS = [
  { key: 'none', label: 'Нет особенностей' },
  { key: 'diabetes', label: 'Диабет' },
  { key: 'hypertension', label: 'Повышенное давление' },
  { key: 'gi', label: 'Проблемы ЖКТ' },
  { key: 'allergy', label: 'Аллергии / непереносимость' },
  { key: 'other', label: 'Другое' },
];

function has(arr, k) {
  return Array.isArray(arr) && arr.includes(k);
}

export default function StepHealth() {
  const { draft, toggleHealthFlag, updateField } = useOnboardingDraft();

  const selectedNone = has(draft.healthFlags, 'none');
  const selectedOther = has(draft.healthFlags, 'other');

  const onToggle = (key) => {
    // логика "none" как взаимоисключающая
    if (key === 'none') {
      // если включаем "none" — убираем остальные
      if (!selectedNone) {
        updateField('healthFlags', ['none']);
        updateField('healthNotes', '');
      } else {
        updateField('healthFlags', []);
      }
      return;
    }

    // если выбран "none" и человек кликает что-то другое — снимаем "none"
    if (selectedNone) {
      updateField('healthFlags', []);
    }

    toggleHealthFlag(key);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black tracking-tight">
        Состояние здоровья
      </h1>
      <p className="text-sm text-gray-500 mt-2">
        Это нужно для более безопасных подсказок. Можно пропустить.
      </p>

      <div className="mt-6 space-y-3">
        {FLAGS.map((f) => {
          const selected = has(draft.healthFlags, f.key);

          return (
            <button
              key={f.key}
              type="button"
              onClick={() => onToggle(f.key)}
              className={[
                'w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-left transition',
                selected
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 bg-white text-black hover:border-black',
              ].join(' ')}
            >
              <span className="text-base font-medium">{f.label}</span>
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

      {selectedOther && !selectedNone && (
        <div className="mt-5">
          <label className="block text-sm font-medium text-black mb-2">
            Уточните (необязательно)
          </label>
          <input
            value={draft.healthNotes || ''}
            onChange={(e) => updateField('healthNotes', e.target.value)}
            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-black focus:border-black transition"
            placeholder="Например: гастрит, астма, противопоказания и т.д."
          />
          <div className="mt-2 text-xs text-gray-500">
            Мы не заменяем врача. Эти данные нужны только для корректности подсказок.
          </div>
        </div>
      )}
    </div>
  );
}
