import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI } from '../services/api';

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
    const initAuth = async () => {
      const authed = readBool(LS_KEYS.AUTH);
      const onboarded = readBool(LS_KEYS.ONBOARDING_DONE);
      const token = localStorage.getItem('access_token');

      setIsAuthenticated(authed);
      setOnboardingCompleted(onboarded);

      // Если есть токен - загружаем данные пользователя с сервера
      if (authed && token) {
        try {
          const response = await authAPI.getMe();
          const userData = response.data?.data?.user || response.data?.user;
          if (userData) {
            setUser(userData);
          }
        } catch (err) {
          // Токен невалидный - разлогиниваем
          console.error('Failed to fetch user:', err);
          writeBool(LS_KEYS.AUTH, false);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const startAuth = useCallback((identifier) => {
    setTempIdentifier((identifier || '').trim());
  }, []);

  const finishAuth = useCallback(
    async (password) => {
      const identifier = (tempIdentifier || '').trim();
      const pwd = (password || '').trim();

      if (!identifier || pwd.length < 4) {
        return { ok: false, error: 'Неверные данные для входа' };
      }

      try {
        // Пробуем войти через API
        const response = await authAPI.login({ identifier, password: pwd });
        const { user: userData, access_token, refresh_token } = response.data;

        // Сохраняем токены
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);

        writeBool(LS_KEYS.AUTH, true);
        localStorage.setItem(LS_KEYS.USER_IDENTIFIER, identifier);

        // onboarding по умолчанию НЕ пройден (если вообще нет ключа)
        if (localStorage.getItem(LS_KEYS.ONBOARDING_DONE) == null) {
          writeBool(LS_KEYS.ONBOARDING_DONE, false);
        }

        setIsAuthenticated(true);
        setUser(userData);
        setOnboardingCompleted(readBool(LS_KEYS.ONBOARDING_DONE));

        return { ok: true };
      } catch (err) {
        // Если пользователь не найден - пробуем зарегистрировать
        if (err.response?.status === 401) {
          try {
            const regResponse = await authAPI.register({ identifier, password: pwd });
            const { user: userData, access_token, refresh_token } = regResponse.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            writeBool(LS_KEYS.AUTH, true);
            localStorage.setItem(LS_KEYS.USER_IDENTIFIER, identifier);
            writeBool(LS_KEYS.ONBOARDING_DONE, false);

            setIsAuthenticated(true);
            setUser(userData);
            setOnboardingCompleted(false);

            return { ok: true, isNewUser: true };
          } catch (regErr) {
            return { ok: false, error: regErr.response?.data?.error || 'Ошибка регистрации' };
          }
        }
        return { ok: false, error: err.response?.data?.error || 'Ошибка входа' };
      }
    },
    [tempIdentifier]
  );

  const login = useCallback(async ({ identifier, password }) => {
    const id = (identifier || '').trim();
    const pwd = (password || '').trim();

    if (!id || pwd.length < 4) {
      return { ok: false, error: 'Неверные данные для входа' };
    }

    try {
      const response = await authAPI.login({ identifier: id, password: pwd });
      const { user: userData, access_token, refresh_token } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      writeBool(LS_KEYS.AUTH, true);
      localStorage.setItem(LS_KEYS.USER_IDENTIFIER, id);

      if (localStorage.getItem(LS_KEYS.ONBOARDING_DONE) == null) {
        writeBool(LS_KEYS.ONBOARDING_DONE, false);
      }

      setIsAuthenticated(true);
      setUser(userData);
      setOnboardingCompleted(readBool(LS_KEYS.ONBOARDING_DONE));

      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || 'Ошибка входа' };
    }
  }, []);

  const logout = useCallback(() => {
    authAPI.logout();
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

  // Обновление профиля
  const updateProfile = useCallback(async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data?.data?.user || response.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Ошибка обновления профиля' };
    }
  }, []);

  // Смена пароля
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword({ current_password: currentPassword, new_password: newPassword });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Ошибка смены пароля' };
    }
  }, []);

  // Загрузка данных текущего пользователя
  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data?.data?.user || response.data?.user;
      if (userData) {
        setUser(userData);
      }
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Ошибка загрузки профиля' };
    }
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
      updateProfile,
      changePassword,
      fetchCurrentUser,
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
      updateProfile,
      changePassword,
      fetchCurrentUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return ctx;
};
