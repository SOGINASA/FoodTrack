import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { validateNicknameOrEmail, validatePassword } from '../utils/validators';

const pageVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
  }),
};

const pageTransition = {
  type: 'tween',
  ease: 'easeOut',
  duration: 0.22,
};

export default function Auth() {
  const navigate = useNavigate();
  const { startAuth, finishAuth } = useAuth();

  // 0 = идентификатор, 1 = пароль
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [touched, setTouched] = useState({ identifier: false, password: false });
  const [error, setError] = useState('');

  const idValidation = useMemo(() => validateNicknameOrEmail(identifier), [identifier]);
  const pwdValidation = useMemo(() => validatePassword(password), [password]);

  const goNext = () => {
    setError('');

    if (step === 0) {
      setTouched((t) => ({ ...t, identifier: true }));
      if (!idValidation.ok) return;

      startAuth(identifier.trim());
      setDirection(1);
      setStep(1);
      return;
    }

    // step === 1
    setTouched((t) => ({ ...t, password: true }));
    if (!pwdValidation.ok) return;

    const res = finishAuth(password);
    if (!res.ok) {
      setError('Не удалось войти. Проверьте данные.');
      return;
    }

    navigate('/onboarding', { replace: true });
  };

  const goBack = () => {
    setError('');
    if (step === 0) return;

    setDirection(-1);
    setStep(0);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Верхняя панель */}
        <div className="flex items-center justify-between mb-6">
          {step === 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="text-sm font-medium text-black hover:opacity-70 transition"
            >
              Назад
            </button>
          ) : (
            <div />
          )}

          <div className="text-sm text-gray-500">
            {step === 0 ? 'Аккаунт' : 'Пароль'}
          </div>

          <div className="w-10" />
        </div>

        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black tracking-tight">
            {step === 0 ? 'Начнём' : 'Почти готово'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {step === 0
              ? 'Введите ник или почту'
              : 'Создайте пароль, чтобы продолжить'}
          </p>
        </div>

        {/* Анимированные шаги */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
              className="w-full"
            >
              {step === 0 ? (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-black">
                    Ник или почта
                  </label>
                  <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, identifier: true }))}
                    className={[
                      'w-full rounded-2xl border px-4 py-3 text-base outline-none',
                      'focus:ring-2 focus:ring-black focus:border-black transition',
                      touched.identifier && !idValidation.ok ? 'border-red-500' : 'border-gray-200',
                    ].join(' ')}
                    placeholder="Например: tony или tony@mail.com"
                    autoComplete="username"
                    inputMode="email"
                  />
                  {touched.identifier && !idValidation.ok && (
                    <div className="text-sm text-red-600">
                      {idValidation.error}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-black">
                    Пароль
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    type="password"
                    className={[
                      'w-full rounded-2xl border px-4 py-3 text-base outline-none',
                      'focus:ring-2 focus:ring-black focus:border-black transition',
                      touched.password && !pwdValidation.ok ? 'border-red-500' : 'border-gray-200',
                    ].join(' ')}
                    placeholder="Минимум 4 символа"
                    autoComplete="current-password"
                  />
                  {touched.password && !pwdValidation.ok && (
                    <div className="text-sm text-red-600">
                      {pwdValidation.error}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Ошибка формы */}
        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Кнопка */}
        <div className="mt-8">
          <button
            type="button"
            onClick={goNext}
            className="w-full rounded-full bg-black text-white py-3 text-base font-semibold hover:opacity-90 transition"
          >
            Продолжить
          </button>
        </div>

        {/* Нижний текст */}
        <div className="mt-6 text-center text-xs text-gray-500 leading-relaxed">
          Продолжая, вы соглашаетесь с условиями и политикой конфиденциальности.
        </div>
      </div>
    </div>
  );
}
