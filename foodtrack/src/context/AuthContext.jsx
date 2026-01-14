import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверка авторизации при загрузке
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Регистрация
  const register = async (email, password, fullName) => {
    setError(null);
    try {
      const response = await authAPI.register({
        email,
        password,
        full_name: fullName,
      });

      const { user, access_token, refresh_token } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setUser(user);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка регистрации';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Вход
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authAPI.login({ email, password });

      const { user, access_token, refresh_token } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      setUser(user);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Неверный email или пароль';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Выход
  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  // Обновление профиля
  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data.user);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка обновления профиля';
      return { success: false, error: message };
    }
  };

  // Смена пароля
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка смены пароля';
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;