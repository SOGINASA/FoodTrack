import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardStats from '../components/dashboard/DashboardStats';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import StreakBadge from '../components/dashboard/StreakBadge';
import MealCard from '../components/meals/MealCard';
import AddMealButton from '../components/meals/AddMealButton';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { useMeals } from '../hooks/useMeals';
import { useAnalytics } from '../hooks/useAnalytics';
import { useWater } from '../hooks/useWater';

// ✅ импорт из api.js
import { notificationsAPI } from '../services/api'; // если путь другой — поправь на '../api.js' или '../services/api'

const QuickIconTips = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path d="M9.5 21h5M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M8 10a4 4 0 1 1 8 0c0 1.7-.9 2.6-1.8 3.5-.7.7-1.2 1.4-1.2 2.5h-2c0-1.1-.5-1.8-1.2-2.5C8.9 12.6 8 11.7 8 10Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const QuickIconRecipes = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path d="M7 3h10v18H7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 7h6M9 11h6M9 15h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const QuickIconProgress = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <path d="M4 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M8 19v-6M12 19V9M16 19v-10M20 19v-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const QuickIconFridge = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M5 10h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 5v3M8 13v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const QuickIconGroups = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
    <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
    <path
      d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="17" cy="8" r="2.5" stroke="currentColor" strokeWidth="2" />
    <path
      d="M17 13.5a3.5 3.5 0 0 1 3.5 3.5v1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);



const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateInputRef = React.useRef(null);

  const { meals, loading, error, fetchMeals } = useMeals();
  const { streak, fetchStreak, weeklyStats, fetchWeeklyStats, fetchDailyStats } = useAnalytics();
  const { waterData, fetchWater, addWater } = useWater();
  const [waterAdding, setWaterAdding] = useState(false);

  // ✅ состояния для тестового уведомления
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState(null); // { type: 'success'|'error', text: string }

  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetchMeals(dateStr);
    fetchDailyStats(dateStr);
    fetchStreak();
    fetchWeeklyStats();
    fetchWater(dateStr);
  }, [selectedDate, fetchMeals, fetchDailyStats, fetchStreak, fetchWeeklyStats, fetchWater]);

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    // Валидация: не позволяем выбрать дату в будущем
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newDate = new Date(value + 'T00:00:00');

    if (isNaN(newDate.getTime())) {
      return; // Игнорируем некорректные даты
    }

    if (newDate > today) {
      setSelectedDate(today);
      return;
    }

    setSelectedDate(newDate);
  };

  const formatDateDisplay = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    }
  };

  const handleAddWater = async (amount) => {
    setWaterAdding(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    await addWater(amount, dateStr);
    setWaterAdding(false);
  };

  // ✅ функция, которая делает запрос на API (POST /notifications/test)
  const handleSendTestNotification = async () => {
    setTestSending(true);
    setTestResult(null);

    try {
      await notificationsAPI.sendTest();
      setTestResult({ type: 'success', text: 'Тестовое уведомление отправлено.' });
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        'Не удалось отправить тестовое уведомление.';
      setTestResult({ type: 'error', text: message });
    } finally {
      setTestSending(false);
    }
  };

  const waterPercent = waterData.goal_ml > 0
    ? Math.min(100, Math.round((waterData.total_ml / waterData.goal_ml) * 100))
    : 0;

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);

  const quickLinks = [
    { label: 'Советы', path: '/tips', Icon: QuickIconTips },
    { label: 'Рецепты', path: '/recipes', Icon: QuickIconRecipes },
    { label: 'Холодильник', path: '/fridge', Icon: QuickIconFridge },
    { label: 'Прогресс', path: '/progress', Icon: QuickIconProgress },
    { label: 'Группы', path: '/groups', Icon: QuickIconGroups },
  ];

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
        <h1 className="text-3xl lg:text-4xl font-bold">Сегодня</h1>
        <Card padding="lg" className="bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={handlePrevDay}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition cursor-pointer"
          aria-label="Предыдущий день"
        >
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => dateInputRef.current?.click()}
          className="flex-1 min-w-0 text-center hover:bg-gray-100 py-2 rounded-lg transition cursor-pointer"
        >
          <h1 className="text-3xl lg:text-4xl font-bold">
            {formatDateDisplay(selectedDate)}
          </h1>
          <p className="text-sm text-secondary mt-1">
            {selectedDate.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </button>

        <button
          type="button"
          onClick={handleNextDay}
          disabled={selectedDate.toDateString() === new Date().toDateString()}
          className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Следующий день"
        >
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          max={new Date().toISOString().split('T')[0]}
          onChange={handleDateChange}
          className="hidden"
        />
      </div>

      {selectedDate.toDateString() !== new Date().toDateString() && (
        <button
          type="button"
          onClick={handleToday}
          className="w-full py-2 px-4 rounded-lg bg-black text-white font-medium hover:bg-black/90 transition text-sm"
        >
          Вернуться на сегодня
        </button>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div></div>
        <StreakBadge streak={streak?.current_streak || 0} />
      </div>

      <WeeklyChart selectedDate={selectedDate} onDateSelect={setSelectedDate} />

      {/* ✅ Видно ТОЛЬКО на мобильных (скрыто на lg и выше) */}
      <div className="grid grid-cols-2 gap-3 lg:hidden">
        {quickLinks.map(({ label, path, Icon }, index) => (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className={[
              'group w-full rounded-2xl border border-gray-200 bg-white',
              'px-3 py-3 sm:px-4 sm:py-4',
              'flex items-center justify-center gap-2',
              'hover:border-black hover:shadow-sm transition',
              'active:scale-[0.99]',
              quickLinks.length % 2 !== 0 && index === quickLinks.length - 1 ? 'col-span-2' : '',
            ].join(' ')}
          >
            <span className="inline-flex items-center justify-center">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-black/80 group-hover:text-black transition" />
            </span>
            <span className="text-sm sm:text-base font-semibold text-black">
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card padding="lg" className="lg:col-span-2">
          <DashboardStats
            calories={totalCalories}
            caloriesGoal={2500}
            protein={totalProtein}
            proteinGoal={150}
            carbs={totalCarbs}
            carbsGoal={200}
            fats={totalFats}
            fatsGoal={70}
          />
        </Card>

        <Card padding="lg" className="flex flex-col justify-center items-center text-center">
          <div className="mb-4">
            <div className="text-5xl font-bold mb-2">
              {Math.round((totalCalories / 2500) * 100)}%
            </div>
            <p className="text-secondary">от дневной цели</p>
          </div>
          <div className="space-y-2 text-sm text-secondary w-full">
            <div className="flex justify-between">
              <span>Осталось калорий</span>
              <span className="font-semibold text-black">{Math.max(0, 2500 - totalCalories)}</span>
            </div>
            <div className="flex justify-between">
              <span>Приёмов пищи</span>
              <span className="font-semibold text-black">{meals.length}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Water Tracker */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z"
                  fill="currentColor"
                  opacity="0.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Вода</h3>
              <p className="text-sm text-secondary">
                {waterData.total_ml} / {waterData.goal_ml} мл
              </p>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-500">
            {waterPercent}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-3 mb-4">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              width: `${waterPercent}%`,
              background: waterPercent >= 100
                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                : 'linear-gradient(90deg, #60a5fa, #3b82f6)',
            }}
          />
        </div>

        {/* Quick add buttons */}
        <div className="flex gap-2 flex-wrap">
          {[150, 250, 350, 500].map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => handleAddWater(amount)}
              disabled={waterAdding}
              className="flex-1 min-w-[70px] py-2.5 px-3 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 active:scale-[0.97] transition text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              <span className="block text-blue-500">{amount} мл</span>
            </button>
          ))}
        </div>

        {/* Water entries for today */}
        {waterData.entries.length > 0 && (
          <div className="mt-4 pt-3 border-t border-divider">
            <div className="flex flex-wrap gap-2">
              {waterData.entries.map((entry) => (
                <span
                  key={entry.id}
                  className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg"
                >
                  {entry.time && <span className="text-blue-400">{entry.time}</span>}
                  {entry.amount_ml} мл
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Недавно добавлено</h3>
          {meals.length > 0 ? (
            <div className="space-y-3">
              {meals.slice(0, 3).map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          ) : (
            <Card padding="lg" className="text-center">
              <p className="text-secondary">Нет добавленных блюд</p>
            </Card>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Статистика за неделю</h3>
          <Card padding="lg">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-divider">
                <span className="text-secondary">Средние калории</span>
                <span className="text-2xl font-bold">
                  {weeklyStats?.summary?.avg_calories ? Math.round(weeklyStats.summary.avg_calories) : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-divider">
                <span className="text-secondary">Дней с целью</span>
                <span className="text-2xl font-bold">
                  {weeklyStats?.summary?.days_with_goal !== undefined ? `${weeklyStats.summary.days_with_goal}/7` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Приёмов пищи</span>
                <span className="text-xl font-semibold">
                  {weeklyStats?.summary?.total_meals || '—'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ✅ Dev/Test: отправка тестового уведомления */}
      <Card padding="lg">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-lg font-semibold">Тест уведомлений</h3>
            <p className="text-sm text-secondary">
              Дёргает <span className="font-mono">POST /notifications/test</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleSendTestNotification}
            disabled={testSending}
            className="py-2 px-4 rounded-lg bg-black text-white font-medium hover:bg-black/90 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testSending ? 'Отправляю…' : 'Отправить тест'}
          </button>
        </div>

        {testResult && (
          <div
            className={[
              'mt-4 rounded-lg border px-3 py-2 text-sm',
              testResult.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800',
            ].join(' ')}
          >
            {testResult.text}
          </div>
        )}
      </Card>

      <AddMealButton />
    </div>
  );
};

export default Dashboard;
