import React from 'react';
import Card from '../common/Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const WeeklyStats = ({ data }) => {
  const avgCalories = Math.round(data.reduce((sum, day) => sum + day.calories, 0) / data.length);
  const prevWeekAvg = 2100;
  const change = avgCalories - prevWeekAvg;
  const changePercent = Math.round((change / prevWeekAvg) * 100);

  return (
    <Card padding="lg">
      <h3 className="text-xl font-bold mb-4">Статистика за неделю</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-divider">
          <div>
            <div className="text-sm text-secondary mb-1">Среднее за день</div>
            <div className="text-4xl font-bold">{avgCalories}</div>
            <div className="text-sm text-secondary">калорий</div>
          </div>
          <div className={`flex items-center gap-1 ${change > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {change > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            <span className="font-bold">{Math.abs(changePercent)}%</span>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((day, index) => {
            const percentage = Math.round((day.calories / 2500) * 100);
            return (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-secondary">{day.day}</span>
                  <span className="font-semibold">{day.calories} ккал</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default WeeklyStats;