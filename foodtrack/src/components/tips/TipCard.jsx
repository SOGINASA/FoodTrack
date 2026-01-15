import React from 'react';
import Card from '../common/Card';

const TipCard = ({ title, description, icon, priority, category }) => {
  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-orange-100 text-orange-700',
    low: 'bg-green-100 text-green-700',
  };

  const priorityLabels = {
    high: 'Важно',
    medium: 'Средний',
    low: 'Рекомендация',
  };

  const categoryLabels = {
    calories: 'Калории',
    protein: 'Белки',
    carbs: 'Углеводы',
    fats: 'Жиры',
    lifestyle: 'Образ жизни',
    motivation: 'Мотивация',
  };

  return (
    <Card hoverable padding="lg">
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{icon}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-lg leading-tight">{title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${priorityColors[priority]}`}>
              {priorityLabels[priority]}
            </span>
          </div>
          
          <p className="text-secondary text-sm leading-relaxed mb-3">
            {description}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {categoryLabels[category]}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TipCard;