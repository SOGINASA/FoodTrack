import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loader from '../components/common/Loader';
import Toast from '../components/common/Toast';

const OAuthCallback = () => {
  const navigate = useNavigate();
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

        // Сохраняем токены и данные в localStorage
        localStorage.setItem('accessToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        localStorage.setItem('user', JSON.stringify(user));

        // Если это новый пользователь - редирект на онбординг
        if (is_new_user) {
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
