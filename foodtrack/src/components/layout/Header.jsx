import React from 'react';
import { Settings, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = ({ guestMode = false }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-divider sticky top-0 z-40">
      <div className="w-full px-4 lg:px-8 py-3 flex items-center justify-between">
        <div
          onClick={() => navigate(guestMode ? '/add-meal' : '/')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src="/imgs/logo.png"
            alt="FoodTrack"
            className="w-14 h-14 lg:w-15 lg:h-15 object-contain"
            style={{ marginTop: '2px' }}
          />
          <div className="flex flex-col">
            <h1 className="text-lg lg:text-xl font-bold tracking-tight">FoodTrack</h1>
            <p className="text-xs lg:text-sm text-gray-500 font-medium tracking-wide">Snap it. Track it.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {guestMode ? (
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-semibold hover:bg-gray-900 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>Войти</span>
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;