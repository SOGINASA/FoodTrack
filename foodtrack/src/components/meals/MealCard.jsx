import React from 'react';
import Card from '../common/Card';

const MealCard = ({ meal }) => {
  const { name, image, calories, protein, carbs, fats, time } = meal;

  return (
    <Card hoverable padding="sm" className="flex items-center gap-3">
      <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            🍽️
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-base truncate">{name}</h4>
        <p className="text-sm text-secondary mt-0.5 font-normal">{time}</p>
        
        <div className="flex items-center gap-3 mt-2 text-sm">
          <span className="font-semibold">🔥 {Number(calories?.toFixed(2) || 0)}</span>
          <span className="text-secondary">🍗 {Number(protein?.toFixed(2) || 0)}г</span>
          <span className="text-secondary">🥖 {Number(carbs?.toFixed(2) || 0)}г</span>
          <span className="text-secondary">🧈 {Number(fats?.toFixed(2) || 0)}г</span>
        </div>
      </div>
    </Card>
  );
};

export default MealCard;