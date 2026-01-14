import { useState, useCallback } from 'react';
import { mealsAPI } from '../services/api';

export const useMeals = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузить приёмы пищи за дату
  const fetchMeals = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealsAPI.getAll({ date });
      setMeals(response.data.meals);
      return response.data.meals;
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка загрузки данных';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Загрузить приёмы пищи за сегодня
  const fetchToday = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealsAPI.getToday();
      setMeals(response.data.meals);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка загрузки данных';
      setError(message);
      return { meals: [], totals: {} };
    } finally {
      setLoading(false);
    }
  }, []);

  // Добавить приём пищи
  const addMeal = useCallback(async (mealData) => {
    try {
      const response = await mealsAPI.create(mealData);
      setMeals((prev) => [response.data.meal, ...prev]);
      return { success: true, meal: response.data.meal };
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка сохранения';
      return { success: false, error: message };
    }
  }, []);

  // Обновить приём пищи
  const updateMeal = useCallback(async (id, mealData) => {
    try {
      const response = await mealsAPI.update(id, mealData);
      setMeals((prev) =>
        prev.map((m) => (m.id === id ? response.data.meal : m))
      );
      return { success: true, meal: response.data.meal };
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка обновления';
      return { success: false, error: message };
    }
  }, []);

  // Удалить приём пищи
  const deleteMeal = useCallback(async (id) => {
    try {
      await mealsAPI.delete(id);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка удаления';
      return { success: false, error: message };
    }
  }, []);

  // Копировать приём пищи
  const copyMeal = useCallback(async (id, data = {}) => {
    try {
      const response = await mealsAPI.copy(id, data);
      setMeals((prev) => [response.data.meal, ...prev]);
      return { success: true, meal: response.data.meal };
    } catch (err) {
      const message = err.response?.data?.error || 'Ошибка копирования';
      return { success: false, error: message };
    }
  }, []);

  // Подсчёт итогов
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: acc.protein + (meal.protein || 0),
      carbs: acc.carbs + (meal.carbs || 0),
      fats: acc.fats + (meal.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return {
    meals,
    setMeals,
    loading,
    error,
    totals,
    fetchMeals,
    fetchToday,
    addMeal,
    updateMeal,
    deleteMeal,
    copyMeal,
  };
};

export default useMeals;