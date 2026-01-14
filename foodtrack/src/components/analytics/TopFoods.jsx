import React from 'react';
import Card from '../common/Card';

const TopFoods = ({ foods }) => {
  return (
    <Card padding="lg">
      <h3 className="text-xl font-bold mb-4">Топ продуктов</h3>

      <div className="space-y-3">
        {foods.map((food, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full font-bold text-sm">
              {index + 1}
            </div>
            
            <div className="flex-1">
              <div className="font-semibold">{food.name}</div>
              <div className="text-sm text-secondary">{food.count} раз</div>
            </div>

            <div className="text-right">
              <div className="font-bold">{food.totalCalories}</div>
              <div className="text-xs text-secondary">ккал всего</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TopFoods;