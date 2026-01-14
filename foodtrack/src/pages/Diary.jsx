import React, { useState } from 'react';
import DiaryList from '../components/diary/DiaryList';
import EditMealModal from '../components/diary/EditMealModal';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const Diary = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showToast, setShowToast] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);

  const [meals, setMeals] = useState([
    {
      id: 1,
      name: 'Овсяная каша с бананом',
      time: '08:00',
      calories: 320,
      protein: 12,
      carbs: 58,
      fats: 6,
      type: 'breakfast',
      portions: 1,
      image: null,
    },
    {
      id: 2,
      name: 'Кофе с молоком',
      time: '08:30',
      calories: 45,
      protein: 2,
      carbs: 5,
      fats: 2,
      type: 'breakfast',
      portions: 1,
      image: null,
    },
    {
      id: 3,
      name: 'Греческий йогурт',
      time: '11:00',
      calories: 150,
      protein: 15,
      carbs: 12,
      fats: 5,
      type: 'snack',
      portions: 1,
      image: null,
    },
    {
      id: 4,
      name: 'Куриная грудка с рисом',
      time: '13:30',
      calories: 520,
      protein: 45,
      carbs: 62,
      fats: 8,
      type: 'lunch',
      portions: 1,
      image: null,
    },
    {
      id: 5,
      name: 'Овощной салат',
      time: '14:00',
      calories: 120,
      protein: 3,
      carbs: 18,
      fats: 4,
      type: 'lunch',
      portions: 1,
      image: null,
    },
    {
      id: 6,
      name: 'Яблоко',
      time: '16:30',
      calories: 80,
      protein: 0,
      carbs: 21,
      fats: 0,
      type: 'snack',
      portions: 1,
      image: null,
    },
    {
      id: 7,
      name: 'Лосось на гриле',
      time: '19:00',
      calories: 380,
      protein: 38,
      carbs: 8,
      fats: 22,
      type: 'dinner',
      portions: 1,
      image: null,
    },
    {
      id: 8,
      name: 'Тушёные овощи',
      time: '19:15',
      calories: 140,
      protein: 4,
      carbs: 24,
      fats: 3,
      type: 'dinner',
      portions: 1,
      image: null,
    },
  ]);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

  const handleEdit = (meal) => {
    setEditingMeal(meal);
  };

  const handleSaveEdit = (editedMeal) => {
    setMeals(meals.map(m => m.id === editedMeal.id ? editedMeal : m));
    setShowToast({ type: 'success', message: 'Блюдо обновлено' });
  };

  const handleDelete = (meal) => {
    setMeals(meals.filter(m => m.id !== meal.id));
    setShowToast({ type: 'success', message: `Удалено: ${meal.name}` });
  };

  const handleCopy = (meal) => {
    const newMeal = {
      ...meal,
      id: Date.now(),
    };
    setMeals([...meals, newMeal]);
    setShowToast({ type: 'success', message: `Скопировано: ${meal.name}` });
  };

  const handleAddMeal = (mealType) => {
    navigate('/add-meal');
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8" />
          <h1 className="text-3xl lg:text-4xl font-bold">Дневник питания</h1>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white border border-divider rounded-2xl p-4">
        <button
          onClick={() => setCurrentDate(subDays(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="text-2xl font-bold">
            {format(currentDate, 'd MMMM', { locale: ru })}
          </div>
          <div className="text-sm text-secondary">
            {format(currentDate, 'EEEE', { locale: ru })}
          </div>
        </div>

        <button
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="default">
          <div className="text-sm text-secondary mb-1">Калории</div>
          <div className="text-3xl font-bold">{totalCalories}</div>
          <div className="text-xs text-secondary mt-1">из 2500</div>
        </Card>

        <Card padding="default">
          <div className="text-sm text-secondary mb-1">Белки</div>
          <div className="text-3xl font-bold text-[#FF6B6B]">{totalProtein}г</div>
          <div className="text-xs text-secondary mt-1">из 150г</div>
        </Card>

        <Card padding="default">
          <div className="text-sm text-secondary mb-1">Углеводы</div>
          <div className="text-3xl font-bold text-[#FFB84D]">{totalCarbs}г</div>
          <div className="text-xs text-secondary mt-1">из 200г</div>
        </Card>

        <Card padding="default">
          <div className="text-sm text-secondary mb-1">Жиры</div>
          <div className="text-3xl font-bold text-[#4D9FFF]">{totalFats}г</div>
          <div className="text-xs text-secondary mt-1">из 70г</div>
        </Card>
      </div>

      <DiaryList
        meals={meals}
        date={currentDate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCopy={handleCopy}
        onAddMeal={handleAddMeal}
      />

      <EditMealModal
        isOpen={!!editingMeal}
        onClose={() => setEditingMeal(null)}
        meal={editingMeal}
        onSave={handleSaveEdit}
      />

      {showToast && (
        <Toast
          type={showToast.type}
          message={showToast.message}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  );
};

export default Diary;