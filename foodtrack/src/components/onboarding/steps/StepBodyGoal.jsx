import React, { useMemo, useState } from 'react';
import { useOnboardingDraft } from '../../../context/OnboardingContext';
import {
  validateHeightCm,
  validateWeightKg,
  validateTargetWeightKg,
} from '../../../utils/validators';

function NumberField({
  label,
  value,
  onChange,
  placeholder,
  touched,
  setTouched,
  validate,
  suffix,
}) {
  const validation = useMemo(() => validate(value), [value, validate]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-black">
        {label}
      </label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/[^\d.]/g, '').slice(0, 6);
            onChange(cleaned);
          }}
          onBlur={() => setTouched(true)}
          inputMode="decimal"
          className={[
            'w-full rounded-2xl border px-4 py-3 text-base outline-none pr-12',
            'focus:ring-2 focus:ring-black focus:border-black transition',
            touched && !validation.ok ? 'border-red-500' : 'border-gray-200',
          ].join(' ')}
          placeholder={placeholder}
        />
        {suffix ? (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
            {suffix}
          </div>
        ) : null}
      </div>

      {touched && !validation.ok && (
        <div className="text-sm text-red-600">{validation.error}</div>
      )}
    </div>
  );
}

export default function StepBodyGoal() {
  const { draft, updateField } = useOnboardingDraft();

  const [touched, setTouched] = useState({
    height: false,
    weight: false,
    target: false,
  });

  // Небольшая подсказка “цель”
  const goalHint = useMemo(() => {
    const w = Number(draft.weightKg);
    const t = Number(draft.targetWeightKg);
    if (!Number.isFinite(w) || !Number.isFinite(t) || !w || !t) return '';

    if (t < w) return 'Цель: снизить вес';
    if (t > w) return 'Цель: набрать вес';
    return 'Цель: поддерживать вес';
  }, [draft.weightKg, draft.targetWeightKg]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black tracking-tight">
        Параметры тела и цель
      </h1>
      <p className="text-sm text-gray-500 mt-2">
        Эти данные нужны, чтобы рассчитать норму калорий и БЖУ.
      </p>

      <div className="mt-6 space-y-5">
        <NumberField
          label="Рост"
          value={draft.heightCm}
          onChange={(v) => updateField('heightCm', v)}
          placeholder="Например: 175"
          touched={touched.height}
          setTouched={(v) => setTouched((t) => ({ ...t, height: v }))}
          validate={validateHeightCm}
          suffix="см"
        />

        <NumberField
          label="Вес"
          value={draft.weightKg}
          onChange={(v) => updateField('weightKg', v)}
          placeholder="Например: 72"
          touched={touched.weight}
          setTouched={(v) => setTouched((t) => ({ ...t, weight: v }))}
          validate={validateWeightKg}
          suffix="кг"
        />

        <NumberField
          label="Цель по весу"
          value={draft.targetWeightKg}
          onChange={(v) => updateField('targetWeightKg', v)}
          placeholder="Например: 68"
          touched={touched.target}
          setTouched={(v) => setTouched((t) => ({ ...t, target: v }))}
          validate={validateTargetWeightKg}
          suffix="кг"
        />
      </div>

      {goalHint ? (
        <div className="mt-5 text-sm text-gray-600">
          {goalHint}
        </div>
      ) : null}

      <div className="mt-5 text-xs text-gray-500 leading-relaxed">
        Всё можно будет изменить позже в настройках.
      </div>
    </div>
  );
}
