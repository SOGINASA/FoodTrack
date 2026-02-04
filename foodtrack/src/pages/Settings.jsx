import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { goalsAPI, notificationsAPI } from '../services/api';
import { useNotifications } from '../hooks/useNotifications';
import ProfileSettings from '../components/settings/ProfileSettings';
import GoalsSettings from '../components/settings/GoalsSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import OAuthSettings from '../components/settings/OAuthSettings';
import PricingPage from '../components/settings/PricingPage';
import NotificationsPanel from '../components/notifications/NotificationsPanel';
import Toast from '../components/common/Toast';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { Settings as SettingsIcon, LogOut, User, Target, Bell, Shield, Crown, LogIn } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [showToast, setShowToast] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [loading, setLoading] = useState(true);

  const { unreadCount, fetchUnreadCount } = useNotifications();

  const [goals, setGoals] = useState({
    caloriesGoal: 2500,
    proteinGoal: 150,
    carbsGoal: 200,
    fatsGoal: 70,
    targetWeight: 75,
    activityLevel: 'moderate',
    dietType: 'balanced',
  });

  const [notifications, setNotifications] = useState({
    mealReminders: true,
    waterReminders: true,
    progressUpdates: true,
    groupActivity: true,
    weeklyReports: true,
    breakfastTime: '08:00',
    lunchTime: '13:00',
    dinnerTime: '19:00',
    pushEnabled: false,
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    showWeight: false,
    showPhotos: true,
    showStats: true,
  });

  const [currentPlan] = useState('free');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [goalsRes, prefsRes] = await Promise.all([
          goalsAPI.get(),
          notificationsAPI.getPreferences().catch(() => null),
        ]);

        const data = goalsRes.data.goals;
        setGoals({
          caloriesGoal: data.calories_goal,
          proteinGoal: data.protein_goal,
          carbsGoal: data.carbs_goal,
          fatsGoal: data.fats_goal,
          targetWeight: data.target_weight || 75,
          activityLevel: data.activity_level || 'moderate',
          dietType: data.diet_type || 'balanced',
        });

        if (prefsRes?.data?.preferences) {
          setNotifications(prefsRes.data.preferences);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'goals', label: 'Цели', icon: Target },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'privacy', label: 'Приватность', icon: Shield },
    { id: 'oauth', label: 'OAuth', icon: LogIn },
    { id: 'pricing', label: 'Подписка', icon: Crown },
  ];

  const handleSaveProfile = async (data) => {
    const updateData = {};
    if (data.name) updateData.full_name = data.name;
    if (data.nickname) updateData.nickname = data.nickname;

    const result = await updateProfile(updateData);
    if (result.success) {
      setShowToast({ type: 'success', message: 'Профиль обновлён' });
    } else {
      setShowToast({ type: 'error', message: result.error });
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      setShowToast({ type: 'success', message: 'Пароль изменён' });
      return { success: true };
    } else {
      setShowToast({ type: 'error', message: result.error });
      return { success: false, error: result.error };
    }
  };

  const handleSaveOnboarding = async (data) => {
    const updateData = {
      gender: data.gender,
      birth_year: data.birthYear,
      height_cm: data.heightCm,
      weight_kg: data.weightKg,
      target_weight_kg: data.targetWeightKg,
      workouts_per_week: data.workoutsPerWeek,
      diet: data.diet,
      diet_notes: data.dietNotes,
      meals_per_day: data.mealsPerDay,
      health_flags: data.healthFlags,
      health_notes: data.healthNotes,
    };

    const result = await updateProfile(updateData);
    if (result.success) {
      setShowToast({ type: 'success', message: 'Данные профиля сохранены' });
    } else {
      setShowToast({ type: 'error', message: result.error });
    }
  };

  const handleSaveGoals = async (data) => {
    try {
      await goalsAPI.update({
        calories_goal: data.caloriesGoal,
        protein_goal: data.proteinGoal,
        carbs_goal: data.carbsGoal,
        fats_goal: data.fatsGoal,
        target_weight: data.targetWeight,
        activity_level: data.activityLevel,
        diet_type: data.dietType,
      });
      setGoals(data);
      setShowToast({ type: 'success', message: 'Цели сохранены' });
    } catch (err) {
      setShowToast({ type: 'error', message: 'Ошибка сохранения целей' });
    }
  };

  const handleSaveNotifications = async (data) => {
    try {
      await notificationsAPI.savePreferences(data);
      setNotifications(data);
      setShowToast({ type: 'success', message: 'Уведомления настроены' });
    } catch (err) {
      setShowToast({ type: 'error', message: 'Ошибка сохранения настроек уведомлений' });
    }
  };

  const handleSavePrivacy = (data) => {
    setPrivacy(data);
    setShowToast({ type: 'success', message: 'Настройки приватности сохранены' });
  };

  const handleExportData = () => {
    setShowToast({ type: 'info', message: 'Экспорт данных начат. Вы получите файл на email.' });
  };

  const handleDeleteAccount = () => {
    setShowToast({ type: 'error', message: 'Функция удаления аккаунта в разработке' });
  };

  const handleSelectPlan = (planId) => {
    setShowToast({ type: 'info', message: 'Это MVP. Оплата не реализована.' });
  };

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  const profile = {
    name: user?.full_name || '',
    email: user?.email || '',
    nickname: user?.nickname || '',
    avatar: null,
    gender: user?.gender || 'na',
    birth_year: user?.birth_year || '',
    height_cm: user?.height_cm || '',
    weight_kg: user?.weight_kg || '',
    target_weight_kg: user?.target_weight_kg || '',
    workouts_per_week: user?.workouts_per_week || 0,
    diet: user?.diet || 'none',
    diet_notes: user?.diet_notes || '',
    meals_per_day: user?.meals_per_day || 3,
    health_flags: user?.health_flags || [],
    health_notes: user?.health_notes || '',
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Настройки</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop: notification bell */}
          <button
            onClick={() => setShowNotificationsPanel(true)}
            className="hidden lg:flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold hidden sm:inline">Выйти</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 lg:flex lg:gap-2 border-b border-divider pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-2 px-2 py-2 lg:px-4 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 lg:w-4 lg:h-4" />
              <span className="text-xs lg:text-base whitespace-nowrap hidden lg:inline">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="max-w-4xl">
        {activeTab === 'profile' && (
          <ProfileSettings
            profile={profile}
            onSave={handleSaveProfile}
            onSaveOnboarding={handleSaveOnboarding}
            onChangePassword={handleChangePassword}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsSettings goals={goals} onSave={handleSaveGoals} />
        )}

        {activeTab === 'notifications' && (
          <NotificationSettings
            notifications={notifications}
            onSave={handleSaveNotifications}
          />
        )}

        {activeTab === 'privacy' && (
          <PrivacySettings
            privacy={privacy}
            onSave={handleSavePrivacy}
            onExportData={handleExportData}
            onDeleteAccount={handleDeleteAccount}
          />
        )}

        {activeTab === 'oauth' && (
          <OAuthSettings />
        )}

        {activeTab === 'pricing' && (
          <PricingPage
            currentPlan={currentPlan}
            onSelectPlan={handleSelectPlan}
          />
        )}
      </div>

      <NotificationsPanel
        isOpen={showNotificationsPanel}
        onClose={() => setShowNotificationsPanel(false)}
      />

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Выйти из аккаунта?"
      >
        <div className="space-y-4">
          <p className="text-secondary">
            Вы уверены, что хотите выйти?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>
      </Modal>

      {showToast && (
        <Toast
          type={showToast.type}
          message={showToast.message}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  );
};

export default Settings;
