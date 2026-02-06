import React, { useEffect, useCallback } from 'react';
import { X, CheckCheck, Bell, BellOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../../context/NotificationContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import NotificationItem from './NotificationItem';

const NotificationsPanel = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
  } = useNotificationContext();

  const {
    isSupported,
    isSubscribed,
    permission,
    loading: pushLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1);
    }
  }, [isOpen, fetchNotifications]);

  const handleNavigate = useCallback(
    (path) => {
      onClose();
      navigate(path);
    },
    [onClose, navigate]
  );

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const groupByDate = (items) => {
    const groups = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    items.forEach((item) => {
      const date = new Date(item.createdAt);
      date.setHours(0, 0, 0, 0);

      let label;
      if (date.getTime() === today.getTime()) {
        label = 'Сегодня';
      } else if (date.getTime() === yesterday.getTime()) {
        label = 'Вчера';
      } else {
        label = date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
        });
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });

    return groups;
  };

  const grouped = groupByDate(notifications);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 transform transition-transform duration-300 shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-divider">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-bold">Уведомления</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-black text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Прочитать все"
              >
                <CheckCheck className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Push toggle */}
        {isSupported && (
          <div className="px-4 py-3 border-b border-divider">
            <button
              onClick={handlePushToggle}
              disabled={pushLoading || permission === 'denied'}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {isSubscribed ? (
                  <Bell className="w-4 h-4 text-green-600" />
                ) : (
                  <BellOff className="w-4 h-4 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {permission === 'denied'
                    ? 'Уведомления заблокированы в браузере'
                    : isSubscribed
                    ? 'Push-уведомления включены'
                    : 'Включить push-уведомления'}
                </span>
              </div>
              {permission !== 'denied' && (
                <div
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    isSubscribed ? 'bg-black' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      isSubscribed ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </div>
              )}
            </button>
          </div>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Bell className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">Нет уведомлений</p>
              <p className="text-xs mt-1">Здесь будут появляться ваши уведомления</p>
            </div>
          ) : (
            <>
              {Object.entries(grouped).map(([date, items]) => (
                <div key={date}>
                  <div className="px-4 py-2 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {date}
                    </p>
                  </div>
                  {items.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              ))}

              {hasMore && (
                <div className="px-4 py-3">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full py-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                  >
                    {loading ? 'Загрузка...' : 'Загрузить ещё'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
