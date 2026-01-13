import React from 'react';
import CircularProgress from './CircularProgress';

const DashboardStats = ({ 
  calories = 0, 
  caloriesGoal = 2500,
  protein = 0,
  proteinGoal = 150,
  carbs = 0,
  carbsGoal = 200,
  fats = 0,
  fatsGoal = 70
}) => {
  const caloriesPercentage = Math.min((calories / caloriesGoal) * 100, 100);
  const caloriesRadius = 45;
  const caloriesCircumference = 2 * Math.PI * caloriesRadius;
  const caloriesOffset = caloriesCircumference - (caloriesPercentage / 100) * caloriesCircumference;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-6xl lg:text-7xl font-bold tracking-tight leading-none">{calories}</span>
            <span className="text-2xl lg:text-3xl text-secondary font-semibold">/ {caloriesGoal}</span>
          </div>
          <p className="text-secondary mt-2 text-base lg:text-lg font-normal">Калорий съедено</p>
        </div>

        <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
          <svg width={100} height={100} className="transform -rotate-90">
            <circle
              cx={50}
              cy={50}
              r={caloriesRadius}
              stroke="#F2F2F7"
              strokeWidth={10}
              fill="none"
            />
            <circle
              cx={50}
              cy={50}
              r={caloriesRadius}
              stroke="#000000"
              strokeWidth={10}
              fill="none"
              strokeDasharray={caloriesCircumference}
              strokeDashoffset={caloriesOffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
        </div>
      </div>

      <div className="flex justify-around items-center pt-6 border-t border-divider gap-4 lg:gap-8">
        <CircularProgress
          value={protein}
          max={proteinGoal}
          color="#FF6B6B"
          label="Белки"
          size={80}
          strokeWidth={8}
        />
        <CircularProgress
          value={carbs}
          max={carbsGoal}
          color="#FFB84D"
          label="Углеводы"
          size={80}
          strokeWidth={8}
        />
        <CircularProgress
          value={fats}
          max={fatsGoal}
          color="#4D9FFF"
          label="Жиры"
          size={80}
          strokeWidth={8}
        />
      </div>
    </div>
  );
};

export default DashboardStats;