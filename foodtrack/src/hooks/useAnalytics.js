import { useState, useCallback } from 'react';
import { analyticsAPI, goalsAPI } from '../services/api';

export const useAnalytics = () => {
  const [dailyStats, setDailyStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [topFoods, setTopFoods] = useState([]);
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [goals, setGoals] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузить дневную статистику
  const fetchDailyStats = useCallback(async (date) => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getDaily(date);
      setDailyStats(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить недельную статистику
  const fetchWeeklyStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getWeekly();
      setWeeklyStats(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить месячную статистику
  const fetchMonthlyStats = useCallback(async (year, month) => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getMonthly(year, month);
      setMonthlyStats(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить топ продуктов
  const fetchTopFoods = useCallback(async (days = 30, limit = 10) => {
    try {
      const response = await analyticsAPI.getTopFoods(days, limit);
      setTopFoods(response.data.top_foods);
      return response.data.top_foods;
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
      return [];
    }
  }, []);

  // Загрузить серию дней
  const fetchStreak = useCallback(async () => {
    try {
      const response = await analyticsAPI.getStreak();
      setStreak(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
      return { current_streak: 0, longest_streak: 0 };
    }
  }, []);

  // Загрузить цели пользователя
  const fetchGoals = useCallback(async () => {
    try {
      const response = await goalsAPI.get();
      setGoals(response.data.goals);
      return response.data.goals;
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
      return null;
    }
  }, []);

  // Обновить цели
  const updateGoals = useCallback(async (data) => {
    try {
      const response = await goalsAPI.update(data);
      setGoals(response.data.goals);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  }, []);

  // Загрузить историю веса
  const fetchWeightHistory = useCallback(async (days = 30) => {
    try {
      const response = await goalsAPI.getWeightHistory(days);
      setWeightHistory(response.data.entries);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
      return { entries: [], stats: null };
    }
  }, []);

  // Добавить запись веса
  const addWeight = useCallback(async (data) => {
    try {
      const response = await goalsAPI.addWeight(data);
      setWeightHistory((prev) => [response.data.entry, ...prev]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  }, []);

  return {
    dailyStats,
    weeklyStats,
    monthlyStats,
    topFoods,
    streak,
    goals,
    weightHistory,
    loading,
    error,
    fetchDailyStats,
    fetchWeeklyStats,
    fetchMonthlyStats,
    fetchTopFoods,
    fetchStreak,
    fetchGoals,
    updateGoals,
    fetchWeightHistory,
    addWeight,
  };
};

export default useAnalytics;