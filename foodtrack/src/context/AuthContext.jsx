import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const LS_KEYS = {
  AUTH: 'foodtrack_auth',
  USER_IDENTIFIER: 'foodtrack_user_identifier',
  ONBOARDING_DONE: 'foodtrack_onboarding_completed',
};

const readBool = (key) => localStorage.getItem(key) === '1';
const writeBool = (key, val) => localStorage.setItem(key, val ? '1' : '0');

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const [user, setUser] = useState(null);

  // Для /auth: одно поле -> следующий экран (пароль)
  const [tempIdentifier, setTempIdentifier] = useState('');

  useEffect(() => {
    const authed = readBool(LS_KEYS.AUTH);
    const onboarded = readBool(LS_KEYS.ONBOARDING_DONE);
    const identifier = localStorage.getItem(LS_KEYS.USER_IDENTIFIER) || '';

    setIsAuthenticated(authed);
    setOnboardingCompleted(onboarded);

    if (authed) {
      setUser({ identifier });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, []);

  const startAuth = useCallback((identifier) => {
    setTempIdentifier((identifier || '').trim());
  }, []);

  const finishAuth = useCallback(
    (password) => {
      const identifier = (tempIdentifier || '').trim();
      const pwd = (password || '').trim();

      if (!identifier || pwd.length < 4) {
        return { ok: false, error: 'Неверные данные для входа' };
      }

      writeBool(LS_KEYS.AUTH, true);

      // onboarding по умолчанию НЕ пройден (если вообще нет ключа)
      if (localStorage.getItem(LS_KEYS.ONBOARDING_DONE) == null) {
        writeBool(LS_KEYS.ONBOARDING_DONE, false);
      }

      localStorage.setItem(LS_KEYS.USER_IDENTIFIER, identifier);

      setIsAuthenticated(true);
      setUser({ identifier });
      setOnboardingCompleted(readBool(LS_KEYS.ONBOARDING_DONE));

      return { ok: true };
    },
    [tempIdentifier]
  );

  const login = useCallback(({
    identifier,
    password,
  }) => {
    setTempIdentifier((identifier || '').trim());

    const id = (identifier || '').trim();
    const pwd = (password || '').trim();

    if (!id || pwd.length < 4) {
      return { ok: false, error: 'Неверные данные для входа' };
    }

    writeBool(LS_KEYS.AUTH, true);

    if (localStorage.getItem(LS_KEYS.ONBOARDING_DONE) == null) {
      writeBool(LS_KEYS.ONBOARDING_DONE, false);
    }

    localStorage.setItem(LS_KEYS.USER_IDENTIFIER, id);

    setIsAuthenticated(true);
    setUser({ identifier: id });
    setOnboardingCompleted(readBool(LS_KEYS.ONBOARDING_DONE));

    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    writeBool(LS_KEYS.AUTH, false);
    localStorage.removeItem(LS_KEYS.USER_IDENTIFIER);

    setIsAuthenticated(false);
    setUser(null);
    setTempIdentifier('');
  }, []);

  const completeOnboarding = useCallback(() => {
    writeBool(LS_KEYS.ONBOARDING_DONE, true);
    setOnboardingCompleted(true);
    return { ok: true };
  }, []);

  const resetOnboarding = useCallback(() => {
    writeBool(LS_KEYS.ONBOARDING_DONE, false);
    setOnboardingCompleted(false);
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      loading,
      isAuthenticated,
      onboardingCompleted,
      user,

      tempIdentifier,
      startAuth,
      finishAuth,

      login,
      logout,
      completeOnboarding,
      resetOnboarding,
    }),
    [
      loading,
      isAuthenticated,
      onboardingCompleted,
      user,
      tempIdentifier,
      startAuth,
      finishAuth,
      login,
      logout,
      completeOnboarding,
      resetOnboarding,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return ctx;
};
