import React from 'react';
import Card from '../common/Card';

const MonthlyStats = ({ data }) => {
  const totalDays = data.length;
  const daysOnTarget = data.filter(d => d.calories >= 1800 && d.calories <= 2200).length;
  const successRate = Math.round((daysOnTarget / totalDays) * 100);

  return (
    <Card padding="lg">
      <h3 className="text-xl font-bold mb-4">Статистика за месяц</h3>

      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl font-bold mb-2">{successRate}%</div>
          <div className="text-secondary">дней в пределах нормы</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold">{daysOnTarget}</div>
            <div className="text-sm text-secondary mt-1">дней в цели</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-3xl font-bold">{totalDays - daysOnTarget}</div>
            <div className="text-sm text-secondary mt-1">дней вне цели</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-secondary">Лучший день</span>
            <span className="font-semibold">Понедельник (1950 ккал)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">Худший день</span>
            <span className="font-semibold">Воскресенье (2680 ккал)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-secondary">Стрик</span>
            <span className="font-semibold">15 дней подряд 🔥</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MonthlyStats;