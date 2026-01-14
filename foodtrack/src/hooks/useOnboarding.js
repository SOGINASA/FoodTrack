import { useMemo, useState } from 'react';
import {
  validateBirthYear,
  validateHeightCm,
  validateWeightKg,
  validateTargetWeightKg,
  validateMealsPerDay,
  validateWorkoutsPerWeek,
  validateDisclaimerAccepted,
} from '../utils/validators';

/**
 * Управление онбордингом внутри одной страницы:
 * - шаги 0..7
 * - направление анимации (forward/back)
 * - валидация по шагам
 *
 * Вся "форма" хранится в OnboardingContext (draft),
 * а этот хук — только логика навигации/валидации.
 */

export const ONBOARDING_STEPS = [
  'gender',
  'workouts',
  'diet',
  'birthYear',
  'bodyGoal',
  'mealsPerDay',
  'health',
  'disclaimer',
];

export function useOnboarding(draft) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = back
  const [error, setError] = useState('');

  const totalSteps = ONBOARDING_STEPS.length;

  const progress = useMemo(() => {
    return {
      stepIndex: step,
      stepNumber: step + 1,
      totalSteps,
      key: ONBOARDING_STEPS[step],
      ratio: totalSteps ? (step + 1) / totalSteps : 0,
    };
  }, [step, totalSteps]);

  const validateCurrentStep = () => {
    setError('');

    const key = ONBOARDING_STEPS[step];

    // 2) gender
    if (key === 'gender') {
      if (!draft.gender) {
        setError('Выберите пол');
        return false;
      }
      return true;
    }

    // 3) workouts
    if (key === 'workouts') {
      const v = validateWorkoutsPerWeek(draft.workoutsPerWeek);
      if (!v.ok) {
        setError(v.error);
        return false;
      }
      return true;
    }

    // 4) diet
    if (key === 'diet') {
      // diet можно оставить "none" — это валидно
      if (!draft.diet) {
        setError('Выберите вариант диеты');
        return false;
      }
      // если custom, то желательно notes (но не обязательно)
      return true;
    }

    // 5) birthYear
    if (key === 'birthYear') {
      const v = validateBirthYear(draft.birthYear);
      if (!v.ok) {
        setError(v.error);
        return false;
      }
      return true;
    }

    // 6) bodyGoal: height, weight, target
    if (key === 'bodyGoal') {
      const h = validateHeightCm(draft.heightCm);
      if (!h.ok) {
        setError(h.error);
        return false;
      }
      const w = validateWeightKg(draft.weightKg);
      if (!w.ok) {
        setError(w.error);
        return false;
      }
      const t = validateTargetWeightKg(draft.targetWeightKg);
      if (!t.ok) {
        setError(t.error);
        return false;
      }
      return true;
    }

    // 7) mealsPerDay
    if (key === 'mealsPerDay') {
      const v = validateMealsPerDay(draft.mealsPerDay);
      if (!v.ok) {
        setError(v.error);
        return false;
      }
      return true;
    }

    // 8) health
    if (key === 'health') {
      // health можно оставить пустым (значит "нет")
      return true;
    }

    // 9) disclaimer
    if (key === 'disclaimer') {
      const v = validateDisclaimerAccepted(draft.disclaimerAccepted);
      if (!v.ok) {
        setError(v.error);
        return false;
      }
      return true;
    }

    return true;
  };

  const next = () => {
    if (!validateCurrentStep()) return false;
    if (step >= totalSteps - 1) return true;

    setDirection(1);
    setStep((s) => Math.min(totalSteps - 1, s + 1));
    return true;
  };

  const back = () => {
    setError('');
    if (step <= 0) return false;

    setDirection(-1);
    setStep((s) => Math.max(0, s - 1));
    return true;
  };

  const goTo = (index) => {
    setError('');
    const nextIndex = Math.max(0, Math.min(totalSteps - 1, Number(index) || 0));
    setDirection(nextIndex >= step ? 1 : -1);
    setStep(nextIndex);
  };

  return {
    step,
    direction,
    error,
    setError,
    progress,
    next,
    back,
    goTo,
    totalSteps,
  };
}
