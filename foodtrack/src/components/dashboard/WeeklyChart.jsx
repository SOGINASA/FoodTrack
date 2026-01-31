import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';

const WeeklyChart = ({ selectedDate = new Date(), onDateSelect = () => {} }) => {
  const today = new Date();
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex justify-between items-center gap-1 sm:gap-2">
      {days.map((day, index) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, today);
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => onDateSelect(day)}
            className="flex flex-col items-center gap-1 hover:opacity-80 active:scale-95 transition cursor-pointer"
          >
            <span className="text-xs text-secondary uppercase font-medium">
              {format(day, 'EEEEEE', { locale: ru })}
            </span>
            <div className={`
              w-10 h-10 flex items-center justify-center rounded-full font-bold text-base transition-all
              ${isSelected
                ? 'bg-black text-white scale-110 shadow-md' 
                : isToday
                ? 'bg-gray-100 text-black border-2 border-black'
                : 'text-gray-600 hover:bg-gray-100'
              }
            `}>
              {format(day, 'd')}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default WeeklyChart;