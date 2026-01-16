import React from 'react';
import Card from '../common/Card';
import { MoreVertical, Pencil, Trash2, Copy } from 'lucide-react';

const MealEntry = ({ meal, mealType, onEdit, onDelete, onCopy }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <Card padding="sm" className="relative">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-base text-secondary">{mealType}</h4>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors relative"
        >
          <MoreVertical className="w-5 h-5 text-gray-400" />
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-divider rounded-xl shadow-lg py-2 z-10 min-w-[160px]">
              <button
                onClick={() => {
                  onEdit(meal);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
              >
                <Pencil className="w-4 h-4" />
                <span className="text-sm">Редактировать</span>
              </button>
              <button
                onClick={() => {
                  onCopy(meal);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">Копировать</span>
              </button>
              <button
                onClick={() => {
                  onDelete(meal);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Удалить</span>
              </button>
            </div>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
          {meal.image ? (
            <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              🍽️
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h5 className="font-semibold text-base truncate">{meal.name}</h5>
          <p className="text-sm text-secondary">{meal.time}</p>
          
          <div className="flex items-center gap-3 mt-1 text-xs">
            <span className="font-semibold">🔥 {Number(meal.calories?.toFixed(2) || 0)}</span>
            <span className="text-secondary">🍗 {Number(meal.protein?.toFixed(2) || 0)}г</span>
            <span className="text-secondary">🥖 {Number(meal.carbs?.toFixed(2) || 0)}г</span>
            <span className="text-secondary">🧈 {Number(meal.fats?.toFixed(2) || 0)}г</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MealEntry;