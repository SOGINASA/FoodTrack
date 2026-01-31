import React, { useState, useEffect } from 'react';
import DiaryList from '../components/diary/DiaryList';
import EditMealModal from '../components/diary/EditMealModal';
import RecipePlanModal from '../components/diary/RecipePlanModal';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import Loader from '../components/common/Loader';
import { Calendar, ChevronLeft, ChevronRight, Trash2, ChefHat } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useMeals } from '../hooks/useMeals';
import { mealPlansAPI } from '../services/api';

const Diary = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showToast, setShowToast] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [mealPlans, setMealPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const { meals, loading, error, fetchMeals, updateMeal, deleteMeal, addMeal } = useMeals();

  // Загружаем приёмы пищи при смене даты
  useEffect(() => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    fetchMeals(dateStr);
    fetchMealPlans(dateStr);
  }, [currentDate, fetchMeals]);

  const fetchMealPlans = async (dateStr) => {
    setLoadingPlans(true);
    try {
      const response = await mealPlansAPI.getAll({ date: dateStr });
      setMealPlans(response.data.meal_plans || []);
    } catch (error) {
      console.error('Ошибка загрузки плана питания:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

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

  const handleDeleteMealPlan = async (planId) => {
    try {
      await mealPlansAPI.delete(planId);
      setShowToast({ type: 'success', message: 'Рецепт удален из плана' });
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      await fetchMealPlans(dateStr);
    } catch (error) {
      console.error('Ошибка удаления:', error);
      setShowToast({ type: 'error', message: 'Ошибка удаления рецепта' });
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
          <div className="text-3xl font-bold">{Number(totalCalories.toFixed(2))}</div>
          <div className="text-xs text-secondary mt-1">из 2500</div>
        </Card>

        <Card padding="default">
          <div className="text-sm text-secondary mb-1">Белки</div>
          <div className="text-3xl font-bold text-[#FF6B6B]">{Number(totalProtein.toFixed(2))}г</div>
          <div className="text-xs text-secondary mt-1">из 150г</div>
        </Card>

        <Card padding="default">
          <div className="text-sm text-secondary mb-1">Углеводы</div>
          <div className="text-3xl font-bold text-[#FFB84D]">{Number(totalCarbs.toFixed(2))}г</div>
          <div className="text-xs text-secondary mt-1">из 200г</div>
        </Card>

        <Card padding="default">
          <div className="text-sm text-secondary mb-1">Жиры</div>
          <div className="text-3xl font-bold text-[#4D9FFF]">{Number(totalFats.toFixed(2))}г</div>
          <div className="text-xs text-secondary mt-1">из 70г</div>
        </Card>
      </div>

      {/* Сохраненные рецепты из плана питания */}
      {loadingPlans ? (
        <div className="flex justify-center py-4">
          <Loader size="md" />
        </div>
      ) : mealPlans.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ChefHat className="w-6 h-6" />
            <h3 className="text-lg font-bold">Сохраненные рецепты</h3>
            <span className="text-sm bg-black text-white px-3 py-1 rounded-full">{mealPlans.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mealPlans.map(plan => (
              <Card key={plan.id} padding="lg" className="relative cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedPlan(plan)}>
                <div className="flex gap-4">
                  {plan.image_url && (
                    <img
                      src={plan.image_url}
                      alt={plan.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base mb-2">{plan.name}</h4>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-secondary">Калории:</span>
                        <div className="font-bold">{plan.calories}</div>
                      </div>
                      <div>
                        <span className="text-secondary">Белки:</span>
                        <div className="font-bold text-[#FF6B6B]">{plan.protein}г</div>
                      </div>
                      <div>
                        <span className="text-secondary">Углеводы:</span>
                        <div className="font-bold text-[#FFB84D]">{plan.carbs}г</div>
                      </div>
                      <div>
                        <span className="text-secondary">Жиры:</span>
                        <div className="font-bold text-[#4D9FFF]">{plan.fats}г</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMealPlan(plan.id);
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 flex-shrink-0 h-fit"
                    title="Удалить из плана"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

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

      <RecipePlanModal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        plan={selectedPlan}
        onDelete={handleDeleteMealPlan}
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