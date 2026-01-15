import React, { useState, useEffect } from 'react';
import WeeklyStats from '../components/analytics/WeeklyStats';
import MonthlyStats from '../components/analytics/MonthlyStats';
import TopFoods from '../components/analytics/TopFoods';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { TrendingUp } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const { weeklyStats, monthlyStats, topFoods, loading, error, fetchWeeklyStats, fetchMonthlyStats, fetchTopFoods } = useAnalytics();

  // Загружаем данные при смене диапазона
  useEffect(() => {
    if (timeRange === 'week') {
      fetchWeeklyStats();
      fetchTopFoods(30, 5);
    } else {
      const now = new Date();
      fetchMonthlyStats(now.getFullYear(), now.getMonth() + 1);
      fetchTopFoods(30, 5);
    }
  }, [timeRange, fetchWeeklyStats, fetchMonthlyStats, fetchTopFoods]);

  // Преобразуем данные для WeeklyStats
  const getWeeklyData = () => {
    if (!weeklyStats || !weeklyStats.daily) return [];
    return weeklyStats.daily.map(day => ({
      day: new Date(day.date).toLocaleDateString('ru-RU', { weekday: 'short' }).slice(0, 2),
      calories: Math.round(day.calories)
    }));
  };

  // Преобразуем данные для MonthlyStats
  const getMonthlyData = () => {
    if (!monthlyStats || !monthlyStats.weeks) return [];
    return monthlyStats.weeks.map(week => ({
      day: week.week,
      calories: Math.round(week.calories / Math.max(1, week.meals_count)) // Среднее на приём пищи
    }));
  };

  // Преобразуем данные для TopFoods
  const getFoodsData = () => {
    if (!topFoods || topFoods.length === 0) return [];
    return topFoods.map(food => ({
      name: food.name,
      count: food.count,
      totalCalories: Math.round(food.total_calories)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8" />
          <h1 className="text-3xl lg:text-4xl font-bold">Аналитика</h1>
        </div>
        <Card padding="lg" className="bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8" />
        <h1 className="text-3xl lg:text-4xl font-bold">Аналитика</h1>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTimeRange('week')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            timeRange === 'week' ? 'bg-black text-white' : 'text-gray-600'
          }`}
        >
          Неделя
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            timeRange === 'month' ? 'bg-black text-white' : 'text-gray-600'
          }`}
        >
          Месяц
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {timeRange === 'week' ? (
          <div className="lg:col-span-2">
            {weeklyStats && <WeeklyStats data={getWeeklyData()} />}
          </div>
        ) : (
          <div className="lg:col-span-2">
            {monthlyStats && <MonthlyStats data={getMonthlyData()} />}
          </div>
        )}

        <div>
          <TopFoods foods={getFoodsData()} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;