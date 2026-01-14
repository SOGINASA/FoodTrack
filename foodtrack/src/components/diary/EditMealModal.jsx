import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Minus, Plus } from 'lucide-react';

const EditMealModal = ({ isOpen, onClose, meal, onSave }) => {
  const [editedMeal, setEditedMeal] = useState(null);
  const [portions, setPortions] = useState(1);

  useEffect(() => {
    if (meal) {
      setEditedMeal({ ...meal });
      setPortions(meal.portions || 1);
    }
  }, [meal]);

  if (!editedMeal) return null;

  const handlePortionChange = (delta) => {
    const newPortions = Math.max(0.5, portions + delta);
    setPortions(newPortions);
    
    const multiplier = newPortions / (meal.portions || 1);
    setEditedMeal({
      ...editedMeal,
      calories: Math.round(meal.calories * multiplier),
      protein: Math.round(meal.protein * multiplier),
      carbs: Math.round(meal.carbs * multiplier),
      fats: Math.round(meal.fats * multiplier),
      portions: newPortions,
    });
  };

  const handleFieldChange = (field, value) => {
    setEditedMeal({
      ...editedMeal,
      [field]: value,
    });
  };

  const handleSave = () => {
    onSave(editedMeal);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Редактировать блюдо"
      size="md"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">Название</label>
          <input
            type="text"
            value={editedMeal.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Время</label>
          <input
            type="time"
            value={editedMeal.time}
            onChange={(e) => handleFieldChange('time', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Порции</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePortionChange(-0.5)}
              className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>
            
            <div className="flex-1 text-center">
              <div className="text-3xl font-bold">{portions}</div>
              <div className="text-sm text-secondary">порций</div>
            </div>

            <button
              onClick={() => handlePortionChange(0.5)}
              className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Калории</label>
            <input
              type="number"
              value={editedMeal.calories}
              onChange={(e) => handleFieldChange('calories', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Белки (г)</label>
            <input
              type="number"
              value={editedMeal.protein}
              onChange={(e) => handleFieldChange('protein', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Углеводы (г)</label>
            <input
              type="number"
              value={editedMeal.carbs}
              onChange={(e) => handleFieldChange('carbs', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Жиры (г)</label>
            <input
              type="number"
              value={editedMeal.fats}
              onChange={(e) => handleFieldChange('fats', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-divider">
          <div className="text-sm text-secondary mb-2">Итого БЖУ:</div>
          <div className="flex items-center gap-4 text-base">
            <span>🍗 <span className="font-semibold text-[#FF6B6B]">{editedMeal.protein}г</span></span>
            <span>🥖 <span className="font-semibold text-[#FFB84D]">{editedMeal.carbs}г</span></span>
            <span>🧈 <span className="font-semibold text-[#4D9FFF]">{editedMeal.fats}г</span></span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditMealModal;