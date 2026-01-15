import React from 'react';
import { Home, Camera, BookOpen, TrendingUp, Image, Users, Settings, Lightbulb, ChefHat, X, LogIn, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose, guestMode = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Публичные пункты меню (доступны всем)
  const publicMenuItems = [
    { icon: Camera, label: 'Распознать еду', path: '/add-meal' },
    { icon: ChefHat, label: 'Рецепты', path: '/recipes' },
  ];

  // Приватные пункты меню (только для авторизованных)
  const privateMenuItems = [
    { icon: Home, label: 'Главная', path: '/' },
    { icon: Camera, label: 'Добавить еду', path: '/add-meal' },
    { icon: BookOpen, label: 'Дневник', path: '/diary' },
    { icon: TrendingUp, label: 'Аналитика', path: '/analytics' },
    { icon: Lightbulb, label: 'Советы', path: '/tips' },
    { icon: ChefHat, label: 'Рецепты', path: '/recipes' },
    { icon: Image, label: 'Прогресс', path: '/progress' },
    { icon: Users, label: 'Группы', path: '/groups' },
    { icon: Settings, label: 'Настройки', path: '/settings' },
  ];

  const menuItems = guestMode ? publicMenuItems : privateMenuItems;

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-divider z-50
        transform transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 border-b border-divider flex items-center justify-between">
          <div 
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img 
              src="/imgs/logo.png" 
              alt="FoodTrack" 
              className="w-10 h-10 object-contain"
            />
            <h2 className="text-lg font-bold">FoodTrack</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          {guestMode && (
            <button
              onClick={() => handleNavigate('/auth')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-black text-white mb-4"
            >
              <LogIn className="w-5 h-5" />
              <span className="font-semibold text-base">Войти / Регистрация</span>
            </button>
          )}

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${isActive
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold text-base">{item.label}</span>
              </button>
            );
          })}

          {guestMode && (
            <div className="mt-6 pt-4 border-t border-divider">
              <div className="flex items-center gap-2 px-4 py-2 text-gray-400 text-sm">
                <Lock className="w-4 h-4" />
                <span>Войдите для доступа к:</span>
              </div>
              <div className="px-4 text-gray-400 text-sm space-y-1">
                <div>• Дневнику питания</div>
                <div>• Персональным советам</div>
                <div>• Аналитике</div>
                <div>• Прогрессу</div>
                <div>• Группам</div>
              </div>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;