import React, { useState } from 'react';
import WeeklyStats from '../components/analytics/WeeklyStats';
import MonthlyStats from '../components/analytics/MonthlyStats';
import TopFoods from '../components/analytics/TopFoods';
import { TrendingUp } from 'lucide-react';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');

  const weeklyData = [
    { day: 'Пн', calories: 2100 },
    { day: 'Вт', calories: 1950 },
    { day: 'Ср', calories: 2300 },
    { day: 'Чт', calories: 2050 },
    { day: 'Пт', calories: 2200 },
    { day: 'Сб', calories: 2400 },
    { day: 'Вс', calories: 1900 },
  ];

  const monthlyData = Array(30).fill(0).map((_, i) => ({
    day: i + 1,
    calories: 1800 + Math.random() * 600,
  }));

  const topFoods = [
    { name: 'Куриная грудка', count: 12, totalCalories: 1980 },
    { name: 'Овсяная каша', count: 10, totalCalories: 1200 },
    { name: 'Яйца', count: 9, totalCalories: 810 },
    { name: 'Греческий йогурт', count: 8, totalCalories: 640 },
    { name: 'Банан', count: 7, totalCalories: 630 },
  ];

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
            <WeeklyStats data={weeklyData} />
          </div>
        ) : (
          <div className="lg:col-span-2">
            <MonthlyStats data={monthlyData} />
          </div>
        )}

        <div>
          <TopFoods foods={topFoods} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;