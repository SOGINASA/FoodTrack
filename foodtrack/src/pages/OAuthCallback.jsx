import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [toast, setToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5252/api';

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const provider = searchParams.get('provider');
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          setToast({
            type: 'error',
            message: `OAuth ошибка: ${error}`,
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        if (!provider || !code || !state) {
          setToast({
            type: 'error',
            message: 'Недостаточно данных для авторизации',
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Проверяем state из sessionStorage
        const savedState = sessionStorage.getItem(`oauth_state_${provider}`);
        if (savedState !== state) {
          setToast({
            type: 'error',
            message: 'Ошибка безопасности: state не совпадает',
          });
          setTimeout(() => navigate('/auth'), 3000);
          return;
        }

        // Отправляем callback на бэк
        const response = await fetch(`${API_BASE_URL}/auth/oauth/${provider}/callback?code=${code}&state=${state}`);
        const data = await response.json();

        if (response.ok && data.access_token) {
          // Сохраняем токены
          localStorage.setItem('accessToken', data.access_token);
          localStorage.setItem('refreshToken', data.refresh_token);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Очищаем sessionStorage
          sessionStorage.removeItem(`oauth_state_${provider}`);

          // Если это новый пользователь - редирект на онбординг
          if (data.is_new_user) {
            setToast({
              type: 'success',
              message: 'Добро пожаловать в FoodTrack!',
            });
            setTimeout(() => navigate('/onboarding'), 1500);
          } else {
            setToast({
              type: 'success',
              message: 'Успешный вход!',
            });
            setTimeout(() => navigate('/'), 1500);
          }
        } else {
          setToast({
            type: 'error',
            message: data.error || 'Ошибка при обработке OAuth',
          });
          setTimeout(() => navigate('/auth'), 3000);
        }
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
        {isProcessing && <p className="text-sm text-gray-500 mt-2">Пожалуйста, подождите</p>}
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
