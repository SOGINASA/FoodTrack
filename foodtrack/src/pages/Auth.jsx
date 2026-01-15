import { useMemo, useState } from 'react';
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
  const { login, register } = useAuth();

  // 'login' | 'register'
  const [mode, setMode] = useState('login');
  const [direction, setDirection] = useState(1);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [touched, setTouched] = useState({ identifier: false, password: false, confirmPassword: false });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const idValidation = useMemo(() => validateNicknameOrEmail(identifier), [identifier]);
  const pwdValidation = useMemo(() => validatePassword(password), [password]);

  const switchMode = (newMode) => {
    setError('');
    setDirection(newMode === 'register' ? 1 : -1);
    setMode(newMode);
    setTouched({ identifier: false, password: false, confirmPassword: false });
  };

  const handleSubmit = async () => {
    setError('');
    setTouched({ identifier: true, password: true, confirmPassword: true });

    if (!idValidation.ok) return;
    if (!pwdValidation.ok) return;

    if (mode === 'register' && password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await login({ identifier: identifier.trim(), password });
      } else {
        res = await register({ identifier: identifier.trim(), password });
      }

      if (!res.ok) {
        setError(res.error || 'Произошла ошибка');
        return;
      }

      // Успешный вход/регистрация
      if (mode === 'register') {
        navigate('/onboarding', { replace: true });
      } else {
        // При логине проверяем onboarding_completed с сервера (уже обработано в login)
        navigate('/', { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Переключатель режима */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              mode === 'login'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              mode === 'register'
                ? 'bg-white text-black shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black tracking-tight">
            {mode === 'login' ? 'Добро пожаловать!' : 'Создать аккаунт'}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {mode === 'login'
              ? 'Войдите в свой аккаунт'
              : 'Зарегистрируйтесь для доступа ко всем функциям'}
          </p>
        </div>

        {/* Анимированная форма */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={mode}
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            className="w-full"
          >
            <div className="space-y-4">
              {/* Ник или почта */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">
                  Ник или почта
                </label>
                <input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, identifier: true }))}
                  onKeyPress={handleKeyPress}
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

              {/* Пароль */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">
                  Пароль
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  onKeyPress={handleKeyPress}
                  type="password"
                  className={[
                    'w-full rounded-2xl border px-4 py-3 text-base outline-none',
                    'focus:ring-2 focus:ring-black focus:border-black transition',
                    touched.password && !pwdValidation.ok ? 'border-red-500' : 'border-gray-200',
                  ].join(' ')}
                  placeholder="Минимум 4 символа"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                {touched.password && !pwdValidation.ok && (
                  <div className="text-sm text-red-600">
                    {pwdValidation.error}
                  </div>
                )}
              </div>

              {/* Подтверждение пароля (только для регистрации) */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black">
                    Подтвердите пароль
                  </label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                    onKeyPress={handleKeyPress}
                    type="password"
                    className={[
                      'w-full rounded-2xl border px-4 py-3 text-base outline-none',
                      'focus:ring-2 focus:ring-black focus:border-black transition',
                      touched.confirmPassword && password !== confirmPassword ? 'border-red-500' : 'border-gray-200',
                    ].join(' ')}
                    placeholder="Повторите пароль"
                    autoComplete="new-password"
                  />
                  {touched.confirmPassword && password !== confirmPassword && (
                    <div className="text-sm text-red-600">
                      Пароли не совпадают
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

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
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full rounded-full bg-black text-white py-3 text-base font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </div>

        {/* Нижний текст */}
        <div className="mt-6 text-center text-xs text-gray-500 leading-relaxed">
          {mode === 'login' ? (
            <>
              Нет аккаунта?{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="text-black font-semibold hover:underline"
              >
                Зарегистрироваться
              </button>
            </>
          ) : (
            <>
              Уже есть аккаунт?{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-black font-semibold hover:underline"
              >
                Войти
              </button>
            </>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-gray-400 leading-relaxed">
          Продолжая, вы соглашаетесь с условиями и политикой конфиденциальности.
        </div>
      </div>
    </div>
  );
}
