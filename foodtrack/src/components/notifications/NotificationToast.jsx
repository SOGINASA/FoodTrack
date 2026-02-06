import React, { useEffect, useState } from 'react';
import {
  Bell,
  Utensils,
  Droplets,
  TrendingUp,
  Users,
  BarChart2,
  UserPlus,
  Refrigerator,
  Info,
  X,
} from 'lucide-react';
import { useNotificationContext } from '../../context/NotificationContext';

const categoryConfig = {
  meal_reminder: { icon: Utensils, color: 'bg-orange-500', label: 'Напоминание' },
  water_reminder: { icon: Droplets, color: 'bg-blue-500', label: 'Вода' },
  progress: { icon: TrendingUp, color: 'bg-green-500', label: 'Прогресс' },
  group: { icon: Users, color: 'bg-purple-500', label: 'Группа' },
  weekly_report: { icon: BarChart2, color: 'bg-indigo-500', label: 'Отчёт' },
  friend: { icon: UserPlus, color: 'bg-pink-500', label: 'Друзья' },
  fridge: { icon: Refrigerator, color: 'bg-teal-500', label: 'Холодильник' },
  system: { icon: Info, color: 'bg-gray-500', label: 'Система' },
  default: { icon: Bell, color: 'bg-black', label: 'Уведомление' },
};

const NotificationToast = () => {
  const { newNotification, clearNewNotification } = useNotificationContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (newNotification) {
      setIsVisible(true);
      setIsExiting(false);
    }
  }, [newNotification]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      clearNewNotification();
    }, 300);
  };

  if (!isVisible || !newNotification) {
    return null;
  }

  const config = categoryConfig[newNotification.category] || categoryConfig.default;
  const Icon = config.icon;

  return (
    <div
      className={`fixed top-4 right-4 z-[100] max-w-sm w-full transition-all duration-300 ${
        isExiting
          ? 'opacity-0 translate-x-full'
          : 'opacity-100 translate-x-0'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {config.label}
                </span>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <p className="mt-1 text-sm font-semibold text-black line-clamp-2">
                {newNotification.title}
              </p>

              {newNotification.message && (
                <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                  {newNotification.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar for auto-dismiss */}
        <div className="h-1 bg-gray-100">
          <div
            className={`h-full ${config.color} animate-shrink-width`}
            style={{ animationDuration: '5s' }}
          />
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
