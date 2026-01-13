import React from 'react';
import Card from '../common/Card';

const TipCard = ({ tip }) => {
  const { icon, title, description, category, priority } = tip;

  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-orange-100 text-orange-700 border-orange-200',
    low: 'bg-green-100 text-green-700 border-green-200',
  };

  const priorityLabels = {
    high: 'Важно',
    medium: 'Рекомендуем',
    low: 'Подсказка',
  };

  return (
    <Card hoverable padding="lg">
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">{icon}</div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold">{title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full font-medium border ${priorityColors[priority]}`}>
              {priorityLabels[priority]}
            </span>
          </div>
          
          <p className="text-secondary text-base leading-relaxed">{description}</p>
          
          {category && (
            <span className="inline-block mt-3 text-xs text-tertiary bg-gray-100 px-3 py-1 rounded-full">
              {category}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TipCard;