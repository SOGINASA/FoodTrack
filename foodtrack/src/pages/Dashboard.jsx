import React, { useEffect } from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import StreakBadge from '../components/dashboard/StreakBadge';
import MealCard from '../components/meals/MealCard';
import AddMealButton from '../components/meals/AddMealButton';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { useMeals } from '../hooks/useMeals';
import { useAnalytics } from '../hooks/useAnalytics';

const Dashboard = () => {
  const { meals, loading, error, fetchToday } = useMeals();
  const { streak, fetchStreak, weeklyStats, fetchWeeklyStats } = useAnalytics();

  useEffect(() => {
    fetchToday();
    fetchStreak();
    fetchWeeklyStats();
  }, [fetchToday, fetchStreak, fetchWeeklyStats]);

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);

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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl lg:text-4xl font-bold">Сегодня</h1>
        <StreakBadge streak={streak?.current_streak || 0} />
      </div>

      <WeeklyChart />

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
            <div className="text-5xl font-bold mb-2">{Math.round((totalCalories / 2500) * 100)}%</div>
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

      <AddMealButton />
    </div>
  );
};

export default Dashboard;