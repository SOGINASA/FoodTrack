import React from 'react';
import { Bell, Droplets, TrendingUp, Users, BarChart2, UserPlus, Refrigerator, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const categoryConfig = {
  meal_reminder: { icon: Bell, color: 'bg-orange-100 text-orange-600' },
  water_reminder: { icon: Droplets, color: 'bg-blue-100 text-blue-600' },
  progress: { icon: TrendingUp, color: 'bg-green-100 text-green-600' },
  group: { icon: Users, color: 'bg-purple-100 text-purple-600' },
  weekly_report: { icon: BarChart2, color: 'bg-indigo-100 text-indigo-600' },
  friend: { icon: UserPlus, color: 'bg-pink-100 text-pink-600' },
  fridge: { icon: Refrigerator, color: 'bg-yellow-100 text-yellow-700' },
  system: { icon: Info, color: 'bg-gray-100 text-gray-600' },
};

const NotificationItem = ({ notification, onRead, onNavigate }) => {
  const config = categoryConfig[notification.category] || categoryConfig.system;
  const Icon = config.icon;

  const timeAgo = notification.createdAt
    ? formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: ru,
      })
    : '';

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    if (onNavigate) {
      const urlMap = {
        meal_reminder: '/diary',
        water_reminder: '/',
        progress: '/progress',
        group: '/groups',
        weekly_report: '/analytics',
        friend: '/friends',
        fridge: '/fridge',
        system: '/',
      };
      onNavigate(urlMap[notification.category] || '/');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
        !notification.isRead ? 'bg-gray-50/80' : ''
      }`}
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${config.color}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-tight ${!notification.isRead ? 'font-semibold' : 'font-medium text-gray-700'}`}>
            {notification.title}
          </p>
          {!notification.isRead && (
            <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-black rounded-full" />
          )}
        </div>
        <p className="text-sm text-gray-500 leading-tight mt-0.5 line-clamp-2">
          {notification.body}
        </p>
        <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
      </div>
    </button>
  );
};

export default NotificationItem;
