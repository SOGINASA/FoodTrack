import React from 'react';
import OnboardingProgress from './OnboardingProgress';

export default function OnboardingShell({
  children,
  stepNumber,
  totalSteps,
  onBack,
  onContinue,
  error,
}) {
  return (
    <div className="w-full">
      {/* Верхняя панель */}
      <div className="flex items-center justify-between mb-6">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-black hover:opacity-70 transition"
          >
            Назад
          </button>
        ) : (
          <div />
        )}

        <div className="text-sm text-gray-500">
          Шаг {stepNumber} из {totalSteps}
        </div>

        <div className="w-10" />
      </div>

      {/* Прогресс */}
      <OnboardingProgress stepNumber={stepNumber} totalSteps={totalSteps} />

      {/* Контент */}
      <div className="mt-8">
        {children}
      </div>

      {/* Ошибка */}
      {error ? (
        <div className="mt-5 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {/* Продолжить */}
      <div className="mt-8">
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-full bg-black text-white py-3 text-base font-semibold hover:opacity-90 transition"
        >
          Продолжить
        </button>
      </div>

      {/* Подпись */}
      <div className="mt-6 text-center text-xs text-gray-500 leading-relaxed">
        Это можно будет изменить позже в настройках.
      </div>
    </div>
  );
}
