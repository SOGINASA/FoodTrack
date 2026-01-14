import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { goalsAPI } from '../services/api';
import ProfileSettings from '../components/settings/ProfileSettings';
import GoalsSettings from '../components/settings/GoalsSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import PrivacySettings from '../components/settings/PrivacySettings';
import PricingPage from '../components/settings/PricingPage';
import Toast from '../components/common/Toast';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { Settings as SettingsIcon, LogOut, User, Target, Bell, Shield, Crown } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [showToast, setShowToast] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);

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
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    showWeight: false,
    showPhotos: true,
    showStats: true,
  });

  const [currentPlan] = useState('free');

  // Загрузка целей при монтировании
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await goalsAPI.get();
        const data = response.data.goals;
        setGoals({
          caloriesGoal: data.calories_goal,
          proteinGoal: data.protein_goal,
          carbsGoal: data.carbs_goal,
          fatsGoal: data.fats_goal,
          targetWeight: data.target_weight || 75,
          activityLevel: data.activity_level || 'moderate',
          dietType: 'balanced',
        });
      } catch (err) {
        console.error('Failed to fetch goals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const tabs = [
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'goals', label: 'Цели', icon: Target },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'privacy', label: 'Приватность', icon: Shield },
    { id: 'pricing', label: 'Подписка', icon: Crown },
  ];

  // Сохранение профиля
  const handleSaveProfile = async (data) => {
    const result = await updateProfile({ full_name: data.name });
    if (result.success) {
      setShowToast({ type: 'success', message: 'Профиль обновлён' });
    } else {
      setShowToast({ type: 'error', message: result.error });
    }
  };

  // Смена пароля
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

  // Сохранение целей
  const handleSaveGoals = async (data) => {
    try {
      await goalsAPI.update({
        calories_goal: data.caloriesGoal,
        protein_goal: data.proteinGoal,
        carbs_goal: data.carbsGoal,
        fats_goal: data.fatsGoal,
        target_weight: data.targetWeight,
        activity_level: data.activityLevel,
      });
      setGoals(data);
      setShowToast({ type: 'success', message: 'Цели сохранены' });
    } catch (err) {
      setShowToast({ type: 'error', message: 'Ошибка сохранения целей' });
    }
  };

  const handleSaveNotifications = (data) => {
    setNotifications(data);
    setShowToast({ type: 'success', message: 'Уведомления настроены' });
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

  // Данные профиля из контекста авторизации
  const profile = {
    name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    avatar: null,
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Настройки</h1>
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-semibold hidden sm:inline">Выйти</span>
        </button>
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

        {activeTab === 'pricing' && (
          <PricingPage
            currentPlan={currentPlan}
            onSelectPlan={handleSelectPlan}
          />
        )}
      </div>

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