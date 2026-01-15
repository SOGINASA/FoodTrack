import { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { User, Camera, Lock, Eye, EyeOff, Ruler, Apple } from 'lucide-react';

const genderOptions = [
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
  { value: 'na', label: 'Не указан' },
];

const dietOptions = [
  { value: 'none', label: 'Без ограничений' },
  { value: 'keto', label: 'Кето' },
  { value: 'vegetarian', label: 'Вегетарианство' },
  { value: 'vegan', label: 'Веганство' },
  { value: 'halal', label: 'Халяль' },
  { value: 'lowcarb', label: 'Низкоуглеводная' },
  { value: 'custom', label: 'Другое' },
];

const healthFlagOptions = [
  { value: 'diabetes', label: 'Диабет' },
  { value: 'hypertension', label: 'Гипертония' },
  { value: 'allergy', label: 'Пищевая аллергия' },
  { value: 'lactose', label: 'Непереносимость лактозы' },
  { value: 'gluten', label: 'Непереносимость глютена' },
];

const ProfileSettings = ({ profile, onSave, onSaveOnboarding, onChangePassword }) => {
  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    nickname: profile.nickname || '',
    avatar: profile.avatar || null,
  });

  // Данные онбординга
  const [onboardingData, setOnboardingData] = useState({
    gender: profile.gender || 'na',
    birthYear: profile.birth_year || '',
    heightCm: profile.height_cm || '',
    weightKg: profile.weight_kg || '',
    targetWeightKg: profile.target_weight_kg || '',
    workoutsPerWeek: profile.workouts_per_week || 0,
    diet: profile.diet || 'none',
    dietNotes: profile.diet_notes || '',
    mealsPerDay: profile.meals_per_day || 3,
    healthFlags: profile.health_flags || [],
    healthNotes: profile.health_notes || '',
  });
  const [hasOnboardingChanges, setHasOnboardingChanges] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState(profile.avatar);
  const [hasChanges, setHasChanges] = useState(false);

  // Форма смены пароля
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        setFormData({ ...formData, avatar: reader.result });
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(formData);
    setHasChanges(false);
  };

  const handleOnboardingChange = (field, value) => {
    setOnboardingData({ ...onboardingData, [field]: value });
    setHasOnboardingChanges(true);
  };

  const handleHealthFlagToggle = (flag) => {
    const newFlags = onboardingData.healthFlags.includes(flag)
      ? onboardingData.healthFlags.filter((f) => f !== flag)
      : [...onboardingData.healthFlags, flag];
    handleOnboardingChange('healthFlags', newFlags);
  };

  const handleSaveOnboarding = () => {
    onSaveOnboarding(onboardingData);
    setHasOnboardingChanges(false);
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
    setPasswordError('');
  };

  const handleSavePassword = async () => {
    // Валидация
    if (!passwordData.currentPassword) {
      setPasswordError('Введите текущий пароль');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Новый пароль должен содержать минимум 6 символов');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    setIsSavingPassword(true);
    const result = await onChangePassword(passwordData.currentPassword, passwordData.newPassword);
    setIsSavingPassword(false);

    if (result.success) {
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordError(result.error || 'Ошибка смены пароля');
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-6 h-6" />
          <h3 className="text-xl font-bold">Профиль</h3>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-black rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h4 className="font-bold text-lg">{formData.name || formData.nickname || 'Ваше имя'}</h4>
              <p className="text-sm text-secondary">
                {formData.nickname && <span>@{formData.nickname}</span>}
                {formData.nickname && formData.email && <span> · </span>}
                {formData.email && <span>{formData.email}</span>}
                {!formData.nickname && !formData.email && <span>Заполните профиль</span>}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Имя</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Введите ваше имя"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Никнейм</label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => handleChange('nickname', e.target.value)}
              placeholder="Ваш никнейм"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
            <p className="text-xs text-secondary mt-1">3-20 символов: буквы, цифры, точки, подчёркивания</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-xl text-base text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-secondary mt-1">Email нельзя изменить</p>
          </div>

          {hasChanges && (
            <Button variant="primary" className="w-full" onClick={handleSave}>
              Сохранить изменения
            </Button>
          )}
        </div>
      </Card>

      {/* Физические параметры */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <Ruler className="w-6 h-6" />
          <h3 className="text-xl font-bold">Физические параметры</h3>
        </div>

        <div className="space-y-6">
          {/* Пол */}
          <div>
            <label className="block text-sm font-semibold mb-2">Пол</label>
            <div className="flex gap-2">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOnboardingChange('gender', option.value)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    onboardingData.gender === option.value
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Год рождения */}
          <div>
            <label className="block text-sm font-semibold mb-2">Год рождения</label>
            <input
              type="number"
              value={onboardingData.birthYear}
              onChange={(e) => handleOnboardingChange('birthYear', parseInt(e.target.value) || '')}
              placeholder="Например: 1990"
              min="1920"
              max="2010"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Рост и Вес */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Рост (см)</label>
              <input
                type="number"
                value={onboardingData.heightCm}
                onChange={(e) => handleOnboardingChange('heightCm', parseInt(e.target.value) || '')}
                placeholder="170"
                min="100"
                max="250"
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Вес (кг)</label>
              <input
                type="number"
                value={onboardingData.weightKg}
                onChange={(e) => handleOnboardingChange('weightKg', parseFloat(e.target.value) || '')}
                placeholder="70"
                min="30"
                max="300"
                step="0.1"
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          {/* Целевой вес */}
          <div>
            <label className="block text-sm font-semibold mb-2">Целевой вес (кг)</label>
            <input
              type="number"
              value={onboardingData.targetWeightKg}
              onChange={(e) => handleOnboardingChange('targetWeightKg', parseFloat(e.target.value) || '')}
              placeholder="65"
              min="30"
              max="300"
              step="0.1"
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Тренировки в неделю */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Тренировок в неделю: {onboardingData.workoutsPerWeek}
            </label>
            <input
              type="range"
              value={onboardingData.workoutsPerWeek}
              onChange={(e) => handleOnboardingChange('workoutsPerWeek', parseInt(e.target.value))}
              min="0"
              max="7"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>7</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Питание и здоровье */}
      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <Apple className="w-6 h-6" />
          <h3 className="text-xl font-bold">Питание и здоровье</h3>
        </div>

        <div className="space-y-6">
          {/* Тип питания */}
          <div>
            <label className="block text-sm font-semibold mb-2">Тип питания</label>
            <select
              value={onboardingData.diet}
              onChange={(e) => handleOnboardingChange('diet', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            >
              {dietOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Заметки по диете */}
          {onboardingData.diet === 'custom' && (
            <div>
              <label className="block text-sm font-semibold mb-2">Описание диеты</label>
              <textarea
                value={onboardingData.dietNotes}
                onChange={(e) => handleOnboardingChange('dietNotes', e.target.value)}
                placeholder="Опишите ваш тип питания..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none resize-none"
              />
            </div>
          )}

          {/* Приёмов пищи в день */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Приёмов пищи в день: {onboardingData.mealsPerDay}
            </label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleOnboardingChange('mealsPerDay', num)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                    onboardingData.mealsPerDay === num
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Особенности здоровья */}
          <div>
            <label className="block text-sm font-semibold mb-2">Особенности здоровья</label>
            <div className="flex flex-wrap gap-2">
              {healthFlagOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleHealthFlagToggle(option.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    onboardingData.healthFlags.includes(option.value)
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Заметки по здоровью */}
          <div>
            <label className="block text-sm font-semibold mb-2">Дополнительные заметки</label>
            <textarea
              value={onboardingData.healthNotes}
              onChange={(e) => handleOnboardingChange('healthNotes', e.target.value)}
              placeholder="Аллергии, хронические заболевания, особенности..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none resize-none"
            />
          </div>

          {hasOnboardingChanges && (
            <Button variant="primary" className="w-full" onClick={handleSaveOnboarding}>
              Сохранить изменения
            </Button>
          )}
        </div>
      </Card>

      {/* Смена пароля */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6" />
            <h3 className="text-xl font-bold">Безопасность</h3>
          </div>
        </div>

        {!showPasswordForm ? (
          <Button
            variant="secondary"
            onClick={() => setShowPasswordForm(true)}
            className="w-full"
          >
            Изменить пароль
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Текущий пароль */}
            <div>
              <label className="block text-sm font-semibold mb-2">Текущий пароль</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  placeholder="Введите текущий пароль"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Новый пароль */}
            <div>
              <label className="block text-sm font-semibold mb-2">Новый пароль</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  placeholder="Минимум 6 символов"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Подтверждение пароля */}
            <div>
              <label className="block text-sm font-semibold mb-2">Подтвердите пароль</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                placeholder="Повторите новый пароль"
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
              />
            </div>

            {passwordError && (
              <p className="text-red-500 text-sm">{passwordError}</p>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordError('');
                }}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSavePassword}
                disabled={isSavingPassword}
              >
                {isSavingPassword ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfileSettings;