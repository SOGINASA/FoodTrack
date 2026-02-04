import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const NotificationSettings = ({ notifications, onSave }) => {
  const [settings, setSettings] = useState({
    mealReminders: notifications.mealReminders ?? true,
    waterReminders: notifications.waterReminders ?? true,
    progressUpdates: notifications.progressUpdates ?? true,
    groupActivity: notifications.groupActivity ?? true,
    weeklyReports: notifications.weeklyReports ?? true,
    breakfastTime: notifications.breakfastTime || '08:00',
    lunchTime: notifications.lunchTime || '13:00',
    dinnerTime: notifications.dinnerTime || '19:00',
    pushEnabled: notifications.pushEnabled ?? false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const {
    isSupported,
    isSubscribed,
    permission,
    loading: pushLoading,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const handleToggle = (field) => {
    setSettings({ ...settings, [field]: !settings[field] });
    setHasChanges(true);
  };

  const handleTimeChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
  };

  const handlePushToggle = async () => {
    if (isSubscribed) {
      const result = await unsubscribe();
      if (result.success) {
        setSettings((prev) => ({ ...prev, pushEnabled: false }));
        setHasChanges(true);
      }
    } else {
      const result = await subscribe();
      if (result.success) {
        setSettings((prev) => ({ ...prev, pushEnabled: true }));
        setHasChanges(true);
      }
    }
  };

  const ToggleSwitch = ({ enabled, onChange, disabled = false }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${enabled ? 'bg-black' : 'bg-gray-300'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <Card padding="lg">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6" />
        <h3 className="text-xl font-bold">Уведомления</h3>
      </div>

      <div className="space-y-6">
        {/* Push notifications toggle */}
        {isSupported && (
          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  isSubscribed ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isSubscribed ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="font-semibold">Push-уведомления</div>
                  <div className="text-sm text-secondary">
                    {permission === 'denied'
                      ? 'Заблокированы в настройках браузера'
                      : isSubscribed
                      ? 'Уведомления приходят на это устройство'
                      : 'Получайте уведомления даже при закрытом приложении'}
                  </div>
                </div>
              </div>
              <button
                onClick={handlePushToggle}
                disabled={pushLoading || permission === 'denied'}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  permission === 'denied'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isSubscribed
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {pushLoading
                  ? 'Загрузка...'
                  : isSubscribed
                  ? 'Отключить'
                  : 'Включить'}
              </button>
            </div>
          </div>
        )}

        {/* Meal reminders */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Напоминания о приёмах пищи</div>
              <div className="text-sm text-secondary">Уведомления в установленное время</div>
            </div>
            <ToggleSwitch
              enabled={settings.mealReminders}
              onChange={() => handleToggle('mealReminders')}
            />
          </div>

          {settings.mealReminders && (
            <div className="pl-4 space-y-3 border-l-2 border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm">Завтрак</span>
                <input
                  type="time"
                  value={settings.breakfastTime}
                  onChange={(e) => handleTimeChange('breakfastTime', e.target.value)}
                  className="px-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Обед</span>
                <input
                  type="time"
                  value={settings.lunchTime}
                  onChange={(e) => handleTimeChange('lunchTime', e.target.value)}
                  className="px-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ужин</span>
                <input
                  type="time"
                  value={settings.dinnerTime}
                  onChange={(e) => handleTimeChange('dinnerTime', e.target.value)}
                  className="px-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-divider">
          <div>
            <div className="font-semibold">Напоминания о воде</div>
            <div className="text-sm text-secondary">Регулярные напоминания пить воду</div>
          </div>
          <ToggleSwitch
            enabled={settings.waterReminders}
            onChange={() => handleToggle('waterReminders')}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-divider">
          <div>
            <div className="font-semibold">Обновления прогресса</div>
            <div className="text-sm text-secondary">Уведомления о достижениях</div>
          </div>
          <ToggleSwitch
            enabled={settings.progressUpdates}
            onChange={() => handleToggle('progressUpdates')}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-divider">
          <div>
            <div className="font-semibold">Активность групп</div>
            <div className="text-sm text-secondary">Уведомления от групп</div>
          </div>
          <ToggleSwitch
            enabled={settings.groupActivity}
            onChange={() => handleToggle('groupActivity')}
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-divider">
          <div>
            <div className="font-semibold">Еженедельные отчёты</div>
            <div className="text-sm text-secondary">Статистика за неделю</div>
          </div>
          <ToggleSwitch
            enabled={settings.weeklyReports}
            onChange={() => handleToggle('weeklyReports')}
          />
        </div>

        {hasChanges && (
          <Button variant="primary" className="w-full" onClick={handleSave}>
            Сохранить настройки
          </Button>
        )}
      </div>
    </Card>
  );
};

export default NotificationSettings;
