import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FOOD_EMOJIS = [
  '🍕', '🍔', '🌮', '🍣', '🥑', '🍩', '🍰', '🥐',
  '🍟', '🌯', '🥗', '🍜', '🧁', '🍪', '🥞', '🍇',
];

const FloatingEmoji = ({ emoji, style }) => (
  <span
    className="absolute text-2xl sm:text-3xl select-none pointer-events-none animate-bounce"
    style={{
      ...style,
      animationDuration: `${2 + Math.random() * 3}s`,
      animationDelay: `${Math.random() * 2}s`,
    }}
  >
    {emoji}
  </span>
);

const NotFound = () => {
  const navigate = useNavigate();
  const [emojis, setEmojis] = useState([]);

  useEffect(() => {
    const placed = [];
    const count = 10;

    for (let i = 0; i < count; i++) {
      let top, left, tooClose;
      let attempts = 0;

      do {
        top = 5 + Math.random() * 80;
        left = 5 + Math.random() * 85;
        tooClose = placed.some(
          (p) => Math.abs(p.top - top) < 12 && Math.abs(p.left - left) < 12,
        );
        attempts++;
      } while (tooClose && attempts < 20);

      placed.push({ top, left });
    }

    setEmojis(
      placed.map((pos, i) => ({
        id: i,
        emoji: FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)],
        style: { top: `${pos.top}%`, left: `${pos.left}%`, opacity: 0.18 },
      })),
    );
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center text-center min-h-[75vh] overflow-hidden px-4 -mt-6">
      {/* Floating food emojis background */}
      {emojis.map((e) => (
        <FloatingEmoji key={e.id} emoji={e.emoji} style={e.style} />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Plate illustration */}
        <div className="relative mb-2">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gray-100 border-[6px] border-gray-200 flex items-center justify-center shadow-inner">
            <span className="text-6xl sm:text-7xl select-none">🍽️</span>
          </div>
          {/* Question mark on plate */}
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold shadow-lg">
            ?
          </div>
        </div>

        {/* 404 number */}
        <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-black leading-none">
          404
        </h1>

        {/* Message */}
        <p className="text-xl sm:text-2xl font-semibold text-black mt-1">
          Тарелка пуста!
        </p>
        <p className="text-secondary text-base sm:text-lg max-w-sm">
          Такой страницы не существует — возможно, её уже съели.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border-2 border-black text-black font-semibold hover:bg-gray-100 active:scale-[0.97] transition"
          >
            Назад
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-black text-white font-semibold hover:bg-black/90 active:scale-[0.97] transition"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
