import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import Loader from '../components/common/Loader';
import { Mail, Lock, Eye, EyeOff, User, Check } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Валидация пароля
  const passwordChecks = {
    length: formData.password.length >= 6,
    match: formData.password === formData.confirmPassword && formData.confirmPassword !== '',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация
    if (!formData.fullName || !formData.email || !formData.password) {
      setToast({ type: 'error', message: 'Заполните все обязательные поля' });
      return;
    }

    if (!passwordChecks.length) {
      setToast({ type: 'error', message: 'Пароль должен содержать минимум 6 символов' });
      return;
    }

    if (!passwordChecks.match) {
      setToast({ type: 'error', message: 'Пароли не совпадают' });
      return;
    }

    setIsSubmitting(true);

    const result = await register(formData.email, formData.password, formData.fullName);

    if (result.success) {
      setToast({ type: 'success', message: 'Регистрация успешна!' });
      setTimeout(() => navigate('/'), 500);
    } else {
      setToast({ type: 'error', message: result.error });
    }

    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Логотип */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">FoodTrack</h1>
          <p className="text-secondary">Создайте аккаунт</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Имя */}
            <div>
              <label className="block text-sm font-medium mb-2">Полное имя</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Иван Иванов"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Пароль */}
            <div>
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Минимум 6 символов"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Подтверждение пароля */}
            <div>
              <label className="block text-sm font-medium mb-2">Подтвердите пароль</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Повторите пароль"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Индикаторы валидации */}
            {formData.password && (
              <div className="space-y-2 text-sm">
                <div className={`flex items-center gap-2 ${passwordChecks.length ? 'text-green-600' : 'text-gray-400'}`}>
                  <Check className={`w-4 h-4 ${passwordChecks.length ? 'opacity-100' : 'opacity-30'}`} />
                  <span>Минимум 6 символов</span>
                </div>
                {formData.confirmPassword && (
                  <div className={`flex items-center gap-2 ${passwordChecks.match ? 'text-green-600' : 'text-red-500'}`}>
                    <Check className={`w-4 h-4 ${passwordChecks.match ? 'opacity-100' : 'opacity-30'}`} />
                    <span>{passwordChecks.match ? 'Пароли совпадают' : 'Пароли не совпадают'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Кнопка регистрации */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>

          {/* Разделитель */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-400">или</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Ссылка на вход */}
          <p className="text-center text-secondary">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-black font-semibold hover:underline">
              Войдите
            </Link>
          </p>
        </Card>
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Register;