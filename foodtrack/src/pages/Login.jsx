import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Toast from '../components/common/Toast';
import Loader from '../components/common/Loader';
import OAuthButtons from '../components/auth/OAuthButtons';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setToast({ type: 'error', message: 'Заполните все поля' });
      return;
    }

    setIsSubmitting(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      setToast({ type: 'success', message: 'Успешный вход!' });
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
          <h1 className="text-4xl font-bold mb-1">FoodTrack</h1>
          <p className="text-lg text-gray-500 font-medium tracking-wide mb-2">Snap it. Track it.</p>
          <p className="text-secondary">Войдите в свой аккаунт</p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Введите пароль"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  autoComplete="current-password"
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

            {/* Забыли пароль */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Забыли пароль?
              </Link>
            </div>

            {/* Кнопка входа */}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          {/* OAuth Кнопки */}
          <OAuthButtons />

          {/* Ссылка на регистрацию */}
          <p className="text-center text-secondary mt-6">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-black font-semibold hover:underline">
              Зарегистрируйтесь
            </Link>
          </p>
        </Card>

        {/* Демо доступ */}
        <Card padding="default" className="mt-4 bg-blue-50 border-blue-100">
          <p className="text-sm text-center text-blue-800">
            <span className="font-semibold">Демо доступ:</span> demo@foodtrack.app / demo123
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

export default Login;