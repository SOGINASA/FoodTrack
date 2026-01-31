import { useEffect, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Toast from '../common/Toast';
import Loader from '../common/Loader';
import { Unlink2, Link2 } from 'lucide-react';

const OAuthSettings = () => {
  const [oauthAccounts, setOauthAccounts] = useState([]);
  const [hasPassword, setHasPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [unlinkLoading, setUnlinkLoading] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5252/api';

  // Получить список привязанных OAuth аккаунтов
  useEffect(() => {
    const fetchOAuthAccounts = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/auth/oauth/accounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setOauthAccounts(data.oauth_accounts);
          setHasPassword(data.has_password);
        } else {
          setToast({
            type: 'error',
            message: data.error || 'Ошибка при загрузке OAuth аккаунтов',
          });
        }
      } catch (error) {
        console.error('Error fetching OAuth accounts:', error);
        setToast({
          type: 'error',
          message: 'Ошибка при загрузке OAuth аккаунтов',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOAuthAccounts();
  }, []);

  const handleOAuthLink = async (provider) => {
    try {
      setLoading(true);

      // Получаем redirect URL от бэка
      const response = await fetch(`${API_BASE_URL}/auth/oauth/start/${provider}`);
      const data = await response.json();

      if (data.redirect_url) {
        // Сохраняем state в sessionStorage
        sessionStorage.setItem(`oauth_state_${provider}`, data.state);
        sessionStorage.setItem('oauth_return_url', '/settings');

        // Редирект на провайдера
        window.location.href = data.redirect_url;
      } else {
        setToast({
          type: 'error',
          message: `Ошибка при подключении ${provider}`,
        });
      }
    } catch (error) {
      console.error('OAuth link error:', error);
      setToast({
        type: 'error',
        message: 'Ошибка при подключении. Попробуйте снова',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthUnlink = async (provider) => {
    // Проверяем, есть ли пароль перед удалением
    if (!hasPassword) {
      setToast({
        type: 'error',
        message: 'Вы не можете отвязать OAuth, если у вас нет пароля. Установите пароль сначала.',
      });
      return;
    }

    try {
      setUnlinkLoading(provider);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/auth/oauth/unlink/${provider}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setOauthAccounts(oauthAccounts.filter((acc) => acc.provider !== provider));
        setToast({
          type: 'success',
          message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} отвязан`,
        });
      } else {
        setToast({
          type: 'error',
          message: data.error || 'Ошибка при отвязке OAuth',
        });
      }
    } catch (error) {
      console.error('OAuth unlink error:', error);
      setToast({
        type: 'error',
        message: 'Ошибка при отвязке OAuth',
      });
    } finally {
      setUnlinkLoading(null);
    }
  };

  const providers = [
    { id: 'google', name: 'Google', icon: '🔍' },
    { id: 'github', name: 'GitHub', icon: '💻' },
  ];

  if (loading) {
    return (
      <Card padding="lg">
        <div className="flex justify-center py-8">
          <Loader size="md" />
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Подключенные аккаунты</h3>
          <p className="text-gray-600 text-sm">
            Управляйте подключенными социальными аккаунтами для быстрой авторизации
          </p>
        </div>

        {/* OAuth Аккаунты */}
        <div className="space-y-3">
          {providers.map((provider) => {
            const isLinked = oauthAccounts.some((acc) => acc.provider === provider.id);

            return (
              <div
                key={provider.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    {isLinked && (
                      <p className="text-sm text-green-600">
                        Подключен {new Date(oauthAccounts.find((acc) => acc.provider === provider.id).linked_at).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() =>
                    isLinked
                      ? handleOAuthUnlink(provider.id)
                      : handleOAuthLink(provider.id)
                  }
                  variant={isLinked ? 'danger' : 'secondary'}
                  size="sm"
                  disabled={unlinkLoading === provider.id}
                >
                  {unlinkLoading === provider.id ? (
                    <Loader size="xs" />
                  ) : isLinked ? (
                    <>
                      <Unlink2 className="w-4 h-4" />
                      Отвязать
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Подключить
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Предупреждение о пароле */}
        {!hasPassword && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Рекомендуется установить пароль для вашего аккаунта, чтобы вы могли войти, даже если OAuth недоступен.
            </p>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </Card>
  );
};

export default OAuthSettings;
