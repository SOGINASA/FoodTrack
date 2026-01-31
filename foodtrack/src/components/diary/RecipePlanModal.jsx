import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Clock, Flame, Check } from 'lucide-react';

const RecipePlanModal = ({ isOpen, onClose, plan, onDelete }) => {
  if (!plan) return null;

  // Парсим JSON массивы если они строки
  const ingredients = typeof plan.ingredients === 'string' 
    ? JSON.parse(plan.ingredients || '[]') 
    : (plan.ingredients || []);

  const steps = typeof plan.steps === 'string' 
    ? JSON.parse(plan.steps || '[]') 
    : (plan.steps || []);

  const tags = typeof plan.tags === 'string' 
    ? JSON.parse(plan.tags || '[]') 
    : (plan.tags || []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Изображение */}
        {plan.image_url && (
          <div className="relative rounded-2xl overflow-hidden h-64 -m-6 mb-4">
            <img
              src={plan.image_url}
              alt={plan.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Название и теги */}
        <div>
          <h2 className="text-3xl font-bold mb-3">{plan.name}</h2>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Основная информация */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {plan.cooking_time && (
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 mx-auto mb-1 text-gray-600" />
              <div className="text-sm text-gray-600">Время</div>
              <div className="font-bold">{plan.cooking_time} мин</div>
            </div>
          )}

          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-600" />
            <div className="text-sm text-gray-600">Калории</div>
            <div className="font-bold">{plan.calories}</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-lg mb-1">🍗</div>
            <div className="text-sm text-gray-600">Белки</div>
            <div className="font-bold text-[#FF6B6B]">{plan.protein}г</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-lg mb-1">🥖</div>
            <div className="text-sm text-gray-600">Углеводы</div>
            <div className="font-bold text-[#FFB84D]">{plan.carbs}г</div>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <div className="text-lg mb-1">🧈</div>
            <div className="text-sm text-gray-600">Жиры</div>
            <div className="font-bold text-[#4D9FFF]">{plan.fats}г</div>
          </div>
        </div>

        {/* Ингредиенты */}
        {ingredients.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-3">Ингредиенты</h3>
            <ul className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Приготовление */}
        {steps.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-3">Приготовление</h3>
            <ol className="space-y-3">
              {steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Кнопки действия */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Закрыть
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              onDelete(plan.id);
              onClose();
            }}
          >
            Удалить
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RecipePlanModal;
