import { useState, useCallback } from 'react';
import { waterAPI } from '../services/api';

export const useWater = () => {
  const [waterData, setWaterData] = useState({ entries: [], total_ml: 0, goal_ml: 2000 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWater = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await waterAPI.getByDate(date);
      setWaterData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка загрузки');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addWater = useCallback(async (amount_ml, date) => {
    try {
      const response = await waterAPI.add({ amount_ml, date });
      setWaterData(prev => ({
        ...prev,
        entries: [response.data.entry, ...prev.entries],
        total_ml: response.data.total_ml,
        goal_ml: response.data.goal_ml,
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  }, []);

  const deleteWater = useCallback(async (id) => {
    try {
      const response = await waterAPI.delete(id);
      setWaterData(prev => ({
        ...prev,
        entries: prev.entries.filter(e => e.id !== id),
        total_ml: response.data.total_ml,
        goal_ml: response.data.goal_ml,
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error };
    }
  }, []);

  return {
    waterData,
    loading,
    error,
    fetchWater,
    addWater,
    deleteWater,
  };
};

export default useWater;
