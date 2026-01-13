import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';

const WeeklyChart = () => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex justify-between items-center gap-1 sm:gap-2">
      {days.map((day, index) => {
        const isToday = isSameDay(day, today);
        
        return (
          <div key={index} className="flex flex-col items-center gap-1">
            <span className="text-xs text-secondary uppercase font-medium">
              {format(day, 'EEEEEE', { locale: ru })}
            </span>
            <div className={`
              w-10 h-10 flex items-center justify-center rounded-full font-bold text-base transition-all
              ${isToday 
                ? 'bg-black text-white scale-110 shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}>
              {format(day, 'd')}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyChart;