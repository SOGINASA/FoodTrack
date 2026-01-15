import React from 'react';

const FlameIcon = ({ className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    fill="none"
  >
    {/* основная форма пламени */}
    <path
      d="M12 2.2c.2 2.5-1 4.3-2.4 5.8-1.3 1.4-2.6 2.8-2.6 5.1 0 3.2 2.6 5.9 6 5.9s6-2.6 6-6c0-3.1-1.8-5.1-3.6-6.8-.9-.9-1.7-1.8-2.1-3z"
      className="fill-white/95"
    />
    {/* внутреннее пламя */}
    <path
      d="M12.2 10.2c.1 1.2-.5 2-1.2 2.8-.7.7-1.4 1.5-1.4 2.7 0 1.8 1.4 3.2 3.2 3.2 1.8 0 3.2-1.4 3.2-3.3 0-1.6-1-2.7-2-3.7-.5-.5-1-.9-1.3-1.7z"
      className="fill-black/10"
    />
  </svg>
);

const StreakBadge = ({ streak = 0 }) => {
  const safeStreak = Number.isFinite(Number(streak)) ? Number(streak) : 0;

  return (
    <div
      className={[
        // контейнер
        'relative inline-flex items-center gap-3 rounded-full px-4 py-2',
        // градиент “огонь”
        'bg-gradient-to-r from-orange-500 via-orange-500 to-red-500',
        // обводка + тень
        'shadow-[0_10px_30px_rgba(244,63,94,0.25)]',
        'ring-1 ring-white/25',
      ].join(' ')}
    >
      {/* лёгкое свечение */}
      <div className="pointer-events-none absolute -inset-1 rounded-full blur-md bg-gradient-to-r from-orange-500/30 to-red-500/30" />

      {/* иконка */}
      <div className="relative flex items-center justify-center">
        <div className="h-10 w-10 rounded-2xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center">
          <FlameIcon className="h-6 w-6 drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]" />
        </div>
      </div>

      {/* текст */}
      <div className="relative flex flex-col leading-none">
        <div className="flex items-baseline gap-2">
          <span className="text-[22px] font-extrabold text-white tracking-tight">
            {safeStreak}
          </span>
          <span className="text-xs font-semibold text-white/90">
            {safeStreak === 1 ? 'день' : safeStreak >= 2 && safeStreak <= 4 ? 'дня' : 'дней'}
          </span>
        </div>

        <span className="mt-1 text-[11px] font-medium text-white/85">
          серия активности
        </span>
      </div>
    </div>
  );
};

export default StreakBadge;
