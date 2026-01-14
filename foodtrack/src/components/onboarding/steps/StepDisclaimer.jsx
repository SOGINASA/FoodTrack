import React from 'react';
import { useOnboardingDraft } from '../../../context/OnboardingContext';

export default function StepDisclaimer() {
  const { draft, updateField } = useOnboardingDraft();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black tracking-tight">
        Важно перед началом
      </h1>
      <p className="text-sm text-gray-500 mt-2">
        Пожалуйста, прочитайте и подтвердите.
      </p>

      <div className="mt-6 rounded-2xl border border-gray-200 p-4 bg-white">
        <div className="text-sm text-gray-700 leading-relaxed space-y-3">
          <p>
            FoodTrack предоставляет информационные расчёты и материалы, которые не являются медицинской
            консультацией, диагнозом или лечением.
          </p>
          <p>
            Вы используете приложение добровольно и принимаете ответственность за решения о питании и тренировках,
            а также за своё состояние здоровья.
          </p>
          <p>
            При наличии заболеваний, беременности, травм или медицинских ограничений рекомендуем обратиться к врачу.
          </p>
        </div>
      </div>

      <label className="mt-5 flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={!!draft.disclaimerAccepted}
          onChange={(e) => updateField('disclaimerAccepted', e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
        />
        <span className="text-sm text-gray-700 leading-relaxed">
          Я прочитал(а) и согласен(на) с условиями. Понимаю, что команда разработчиков не несёт ответственности за моё здоровье.
        </span>
      </label>

      <div className="mt-5 text-xs text-gray-500 leading-relaxed">
        Без подтверждения мы не можем продолжить.
      </div>
    </div>
  );
}
