import React from 'react';
import { Home, Camera, BookOpen, TrendingUp, Image, Users, Settings, Lightbulb, ChefHat, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
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
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;