import React from 'react';
import Card from '../common/Card';
import { Clock, Flame, TrendingUp } from 'lucide-react';

const RecipeCard = ({ recipe, onClick }) => {
  const { name, image, cookTime, calories, protein, carbs, fats, difficulty, tags } = recipe;

  const difficultyColors = {
    easy: 'text-green-600',
    medium: 'text-orange-600',
    hard: 'text-red-600',
  };

  const difficultyLabels = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно',
  };

  return (
    <Card hoverable padding="none" onClick={onClick}>
      <div className="w-full h-48 bg-gray-100 rounded-t-2xl overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍳
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{name}</h3>

        <div className="flex items-center gap-4 text-sm text-secondary mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{cookTime} мин</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            <span>{calories} ккал</span>
          </div>
          <div className={`flex items-center gap-1 font-medium ${difficultyColors[difficulty]}`}>
            <TrendingUp className="w-4 h-4" />
            <span>{difficultyLabels[difficulty]}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm mb-3 pb-3 border-b border-divider">
          <span className="text-secondary">🍗 {protein}г</span>
          <span className="text-secondary">🥖 {carbs}г</span>
          <span className="text-secondary">🧈 {fats}г</span>
        </div>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default RecipeCard;