import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';

const LS_KEYS = {
  AUTH: 'foodtrack_auth',
  ONBOARDING_DONE: 'foodtrack_onboarding_completed',
};

const writeBool = (key, val) => localStorage.setItem(key, val ? '1' : '0');

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [toast, setToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Получаем токены и данные из URL параметров (приходят от Backend)
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const user_data = searchParams.get('user');
        const is_new_user = searchParams.get('is_new_user') === 'true';
        const error = searchParams.get('error');

        if (error) {
          setToast({
            type: 'error',
            message: `OAuth ошибка: ${error}`,
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        if (!access_token || !refresh_token || !user_data) {
          setToast({
            type: 'error',
            message: 'Недостаточно данных для авторизации',
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Парсим данные пользователя из JSON
        const user = JSON.parse(decodeURIComponent(user_data));

        // Сохраняем токены с правильными ключами (как в AuthContext)
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
        // Отмечаем что пользователь авторизован
        writeBool(LS_KEYS.AUTH, true);
        
        // Для новых OAuth пользователей отмечаем что они не завершили onboarding
        if (is_new_user) {
          writeBool(LS_KEYS.ONBOARDING_DONE, false);
        } else {
          // Для существующих пользователей берём статус из user данных
          const onboardingDone = user?.onboarding_completed || false;
          writeBool(LS_KEYS.ONBOARDING_DONE, onboardingDone);
        }
        
        localStorage.setItem('user', JSON.stringify(user));

        setToast({
          type: 'success',
          message: 'Успешная авторизация! Загрузка...',
        });
        
        // Редирект на главную - AuthContext и App.js роутинг сам разберётся куда дальше
        // Если onboarding не завершён - OnboardingRoute перебросит на /onboarding
        // Если завершён - пойдёт на /
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        setToast({
          type: 'error',
          message: 'Ошибка при обработке авторизации',
        });
        setTimeout(() => navigate('/auth'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <Loader size="lg" />
        <p className="mt-4 text-gray-600">Обработка авторизации...</p>
        <p className="text-sm text-gray-500 mt-2">Пожалуйста, подождите...</p>
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

export default OAuthCallback;
