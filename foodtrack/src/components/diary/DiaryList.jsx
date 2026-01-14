import React from 'react';
import MealEntry from './MealEntry';
import Button from '../common/Button';
import { Plus } from 'lucide-react';

const DiaryList = ({ meals, date, onEdit, onDelete, onCopy, onAddMeal }) => {
  const mealsByType = {
    'Завтрак': meals.filter(m => m.type === 'breakfast'),
    'Обед': meals.filter(m => m.type === 'lunch'),
    'Ужин': meals.filter(m => m.type === 'dinner'),
    'Перекусы': meals.filter(m => m.type === 'snack'),
  };

  return (
    <div className="space-y-6">
      {Object.entries(mealsByType).map(([mealType, mealList]) => (
        <div key={mealType}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{mealType}</h3>
            <button
              onClick={() => onAddMeal(mealType.toLowerCase())}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {mealList.length > 0 ? (
            <div className="space-y-3">
              {mealList.map(meal => (
                <MealEntry
                  key={meal.id}
                  meal={meal}
                  mealType={mealType}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCopy={onCopy}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-2xl">
              <p className="text-secondary">Нет записей</p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="mt-2"
                onClick={() => onAddMeal(mealType.toLowerCase())}
              >
                Добавить {mealType.toLowerCase()}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DiaryList;