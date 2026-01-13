import React from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import WeeklyChart from '../components/dashboard/WeeklyChart';
import StreakBadge from '../components/dashboard/StreakBadge';
import MealCard from '../components/meals/MealCard';
import AddMealButton from '../components/meals/AddMealButton';
import Card from '../components/common/Card';

const Dashboard = () => {
  const mockMeals = [
    {
      id: 1,
      name: 'Лосось на гриле с овощами',
      time: '18:30',
      calories: 620,
      protein: 47,
      carbs: 35,
      fats: 28,
      image: null,
    },
    {
      id: 2,
      name: 'Салат Цезарь',
      time: '13:15',
      calories: 330,
      protein: 12,
      carbs: 25,
      fats: 18,
      image: null,
    },
    {
      id: 3,
      name: 'Овсянка с ягодами',
      time: '08:00',
      calories: 280,
      protein: 10,
      carbs: 45,
      fats: 8,
      image: null,
    },
    {
      id: 4,
      name: 'Куриная грудка с рисом',
      time: '12:00',
      calories: 450,
      protein: 38,
      carbs: 52,
      fats: 9,
      image: null,
    },
    {
      id: 5,
      name: 'Греческий йогурт с мёдом',
      time: '10:30',
      calories: 180,
      protein: 15,
      carbs: 20,
      fats: 5,
      image: null,
    },
  ];

  const totalCalories = mockMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = mockMeals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = mockMeals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = mockMeals.reduce((sum, meal) => sum + meal.fats, 0);

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl lg:text-4xl font-bold">Сегодня</h1>
        <StreakBadge streak={15} />
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
              <span className="font-semibold text-black">{2500 - totalCalories}</span>
            </div>
            <div className="flex justify-between">
              <span>Приёмов пищи</span>
              <span className="font-semibold text-black">{mockMeals.length}</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Недавно добавлено</h3>
          <div className="space-y-3">
            {mockMeals.slice(0, 3).map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Статистика за неделю</h3>
          <Card padding="lg">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-divider">
                <span className="text-secondary">Средние калории</span>
                <span className="text-2xl font-bold">2180</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-divider">
                <span className="text-secondary">Дней с целью</span>
                <span className="text-2xl font-bold">5/7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-secondary">Самый активный день</span>
                <span className="text-xl font-semibold">Понедельник</span>
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