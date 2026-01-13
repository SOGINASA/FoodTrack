import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-divider sticky top-0 z-40">
      <div className="w-full px-4 lg:px-8 py-3 flex items-center justify-between">
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img 
            src="/imgs/logo.png" 
            alt="FoodTrack" 
            className="w-14 h-14 lg:w-15 lg:h-15 object-contain"
            style={{ marginTop: '2px' }}
          />
          <h1 className="text-lg lg:text-xl font-bold tracking-tight">FoodTrack</h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/add-meal')}
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition-all"
          >
            <span>Добавить еду</span>
          </button>
          
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;