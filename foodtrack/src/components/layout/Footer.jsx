import React from 'react';
import { Home, Camera, BookOpen, TrendingUp, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Главная', path: '/' },
    { icon: BookOpen, label: 'Дневник', path: '/diary' },
    { icon: Camera, label: '+', path: '/add-meal', isMain: true },
    { icon: TrendingUp, label: 'Статистика', path: '/analytics' },
    { icon: User, label: 'Профиль', path: '/settings' },
  ];

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-divider lg:hidden z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <nav className="w-full flex justify-around items-center py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isMain) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all
                ${isActive ? 'text-black' : 'text-gray-400'}
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
};

export default Footer;