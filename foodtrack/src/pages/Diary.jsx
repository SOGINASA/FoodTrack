import React, { useState, useEffect } from 'react';
import DiaryList from '../components/diary/DiaryList';
import EditMealModal from '../components/diary/EditMealModal';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import Loader from '../components/common/Loader';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useMeals } from '../hooks/useMeals';

const Diary = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showToast, setShowToast] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  
  const { meals, loading, error, fetchMeals, updateMeal, deleteMeal, addMeal } = useMeals();

  // Загружаем приёмы пищи при смене даты
  useEffect(() => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    fetchMeals(dateStr);
  }, [currentDate, fetchMeals]);

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
  const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0);

  const handleEdit = (meal) => {
    setEditingMeal(meal);
  };

  const handleSaveEdit = async (editedMeal) => {
    const result = await updateMeal(editedMeal.id, editedMeal);
    if (result.success) {
      setShowToast({ type: 'success', message: 'Блюдо обновлено' });
      setEditingMeal(null);
    } else {
      setShowToast({ type: 'error', message: result.error || 'Ошибка обновления' });
    }
  };

  const handleDelete = async (meal) => {
    const result = await deleteMeal(meal.id);
    if (result.success) {
      setShowToast({ type: 'success', message: `Удалено: ${meal.name}` });
    } else {
      setShowToast({ type: 'error', message: result.error || 'Ошибка удаления' });
    }
  };

  const handleCopy = (meal) => {
    navigate('/add-meal');
  };

  const handleAddMeal = (mealType) => {
    navigate('/add-meal');
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
          <Calendar className="w-8 h-8" />
          <h1 className="text-3xl lg:text-4xl font-bold">Дневник питания</h1>
        </div>
        <Card padding="lg" className="bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </Card>
      </div>
    );
  }

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