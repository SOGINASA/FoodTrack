import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../common/Toast';
import Loader from '../common/Loader';
import { Mail } from 'lucide-react';

const OAuthButtons = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [toast, setToast] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5252/api';

  const handleOAuthStart = async (provider) => {
    try {
      setIsLoading(true);
      setLoadingProvider(provider);

      // Получаем redirect URL от бэка
      const response = await fetch(`${API_BASE_URL}/auth/oauth/start/${provider}`);
      const data = await response.json();

      if (data.redirect_url) {
        // Сохраняем state в sessionStorage
        sessionStorage.setItem(`oauth_state_${provider}`, data.state);
        
        // Редирект на провайдера
        window.location.href = data.redirect_url;
      } else {
        setToast({
          type: 'error',
          message: `Ошибка при подключении ${provider}`,
        });
      }
    } catch (error) {
      console.error('OAuth start error:', error);
      setToast({
        type: 'error',
        message: 'Ошибка при подключении. Попробуйте снова',
      });
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const OAuthButton = ({ provider, icon, label, bgColor }) => (
    <button
      onClick={() => handleOAuthStart(provider)}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${bgColor} hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loadingProvider === provider ? (
        <Loader size="sm" />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 w-full">
      {/* Разделитель */}
      <p className="text-center text-sm text-gray-500 font-medium">Или войдите через</p>

      {/* Google */}
      <OAuthButton
        provider="google"
        icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        }
        label="Google"
        bgColor="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
      />

      {/* GitHub */}
      <OAuthButton
        provider="github"
        icon={
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 0C4.477 0 0 4.484 0 10c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.603-3.369-1.343-3.369-1.343-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.002.07 1.527 1.03 1.527 1.03.89 1.529 2.341 1.544 2.914 1.186.092-.923.35-1.544.636-1.9-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0110 4.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C17.138 18.163 20 14.413 20 10c0-5.516-4.477-10-10-10z"
              clipRule="evenodd"
            />
          </svg>
        }
        label="GitHub"
        bgColor="bg-gray-900 text-white hover:bg-gray-800"
      />
    </div>
  );
};

export default OAuthButtons;
