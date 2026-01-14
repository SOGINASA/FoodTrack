import React, { useMemo, useState } from 'react';
import { useOnboardingDraft } from '../../../context/OnboardingContext';
import { validateBirthYear } from '../../../utils/validators';

export default function StepBirthYear() {
  const { draft, updateField } = useOnboardingDraft();
  const [touched, setTouched] = useState(false);

  const validation = useMemo(
    () => validateBirthYear(draft.birthYear),
    [draft.birthYear]
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black tracking-tight">
        Год рождения
      </h1>
      <p className="text-sm text-gray-500 mt-2">
        Нужен для корректных расчётов.
      </p>

      <div className="mt-6 space-y-2">
        <label className="block text-sm font-medium text-black">
          Введите год
        </label>
        <input
          value={draft.birthYear}
          onChange={(e) => updateField('birthYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
          onBlur={() => setTouched(true)}
          inputMode="numeric"
          className={[
            'w-full rounded-2xl border px-4 py-3 text-base outline-none',
            'focus:ring-2 focus:ring-black focus:border-black transition',
            touched && !validation.ok ? 'border-red-500' : 'border-gray-200',
          ].join(' ')}
          placeholder="Например: 2004"
        />
        {touched && !validation.ok && (
          <div className="text-sm text-red-600">{validation.error}</div>
        )}
      </div>

      <div className="mt-5 text-xs text-gray-500 leading-relaxed">
        Мы не показываем ваш возраст другим пользователям.
      </div>
    </div>
  );
}
