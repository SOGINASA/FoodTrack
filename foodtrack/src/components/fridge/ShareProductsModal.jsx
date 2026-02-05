import React, { useState, useEffect, useCallback } from 'react';
import { Users, MapPin, Package, Send, Loader } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import ShareProductsMap from './ShareProductsMap';
import { fridgeAPI } from '../../services/api';

const ShareProductsModal = ({ isOpen, onClose, products }) => {
  const [step, setStep] = useState('location'); // location, selectUser, selectProducts
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Функция для расчета расстояния между двумя точками (формула Haversine)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Радиус Земли в метрах
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Расстояние в метрах
  };

  // Получение геолокации пользователя
  const getUserLocation = useCallback(() => {
    setIsLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Геолокация не поддерживается вашим браузером');
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setIsLoadingLocation(false);
        fetchNearbyUsers(location);
      },
      (error) => {
        setIsLoadingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Вы запретили доступ к геолокации');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Информация о местоположении недоступна');
            break;
          case error.TIMEOUT:
            setLocationError('Время ожидания истекло');
            break;
          default:
            setLocationError('Неизвестная ошибка при получении геолокации');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Получение списка пользователей в радиусе 1 км через API
  const fetchNearbyUsers = async (location) => {
    try {
      const response = await fridgeAPI.getNearbyUsers(location.lat, location.lng, 1000);
      const users = response.data || [];
      setNearbyUsers(users);
      setStep('selectUser');
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      setNearbyUsers([]);
      setStep('selectUser');
    }
  };

  // Открытие модалки - получаем геолокацию
  useEffect(() => {
    if (isOpen) {
      getUserLocation();
    } else {
      // Сброс состояния при закрытии
      setStep('location');
      setUserLocation(null);
      setNearbyUsers([]);
      setSelectedUser(null);
      setSelectedProducts([]);
      setLocationError(null);
    }
  }, [isOpen, getUserLocation]);

  // Выбор пользователя
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setStep('selectProducts');
  };

  // Переключение выбора продукта
  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Отправка запроса на sharing
  const handleSendRequest = async () => {
    if (selectedProducts.length === 0) {
      alert('Выберите хотя бы один продукт');
      return;
    }

    try {
      await fridgeAPI.sendShareRequest({
        recipientId: selectedUser.id,
        productIds: selectedProducts,
        senderLocation: userLocation,
      });
      alert(`Запрос отправлен пользователю ${selectedUser.name}!`);
      onClose();
    } catch (error) {
      console.error('Ошибка отправки запроса:', error);
      alert('Не удалось отправить запрос. Попробуйте ещё раз.');
    }
  };

  const renderContent = () => {
    // Загрузка геолокации
    if (step === 'location' && isLoadingLocation) {
      return (
        <div className="text-center py-12">
          <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" />
          <p className="text-lg font-semibold mb-2">Определяем ваше местоположение</p>
          <p className="text-gray-600">Пожалуйста, разрешите доступ к геолокации</p>
        </div>
      );
    }

    // Ошибка геолокации
    if (locationError) {
      return (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-semibold mb-2 text-red-600">Ошибка геолокации</p>
          <p className="text-gray-600 mb-6">{locationError}</p>
          <Button onClick={getUserLocation}>Попробовать снова</Button>
        </div>
      );
    }

    // Шаг 1: Карта с пользователями
    if (step === 'selectUser') {
      return (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg mb-2">Пользователи рядом с вами</h3>
            <p className="text-gray-600 text-sm mb-4">
              Найдено пользователей в радиусе 1 км: {nearbyUsers.length}
            </p>
          </div>

          <ShareProductsMap
            userLocation={userLocation}
            nearbyUsers={nearbyUsers}
            onSelectUser={handleSelectUser}
          />

          {nearbyUsers.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-xl">
              <Users className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600">Пользователей рядом не найдено</p>
              <p className="text-sm text-gray-500 mt-1">
                Попробуйте позже или пригласите друзей
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-semibold text-sm text-gray-700">
                Нажмите на маркер на карте или выберите из списка:
              </p>
              {nearbyUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name[0]}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-gray-500">
                        ~{Math.round(user.distance)}м от вас
                      </p>
                    </div>
                  </div>
                  <Send className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Шаг 2: Выбор продуктов
    if (step === 'selectProducts') {
      return (
        <div className="space-y-4">
          <div>
            <button
              onClick={() => setStep('selectUser')}
              className="text-blue-500 text-sm mb-2 hover:underline"
            >
              ← Назад к выбору пользователя
            </button>
            <h3 className="font-bold text-lg mb-2">
              Отправить продукты пользователю {selectedUser.name}
            </h3>
            <p className="text-gray-600 text-sm">
              Выберите продукты, которыми хотите поделиться
            </p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => toggleProductSelection(product.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  selectedProducts.includes(product.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                        selectedProducts.includes(product.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedProducts.includes(product.id) && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.quantity} {product.unit}
                        {product.expiryDate && (
                          <span className="ml-2">
                            • До {new Date(product.expiryDate).toLocaleDateString('ru-RU')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Package className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-3">
              Выбрано продуктов: {selectedProducts.length}
            </p>
            <Button
              onClick={handleSendRequest}
              disabled={selectedProducts.length === 0}
              className="w-full"
            >
              <Send className="w-5 h-5 mr-2" />
              Отправить запрос
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Поделиться продуктами" size="lg">
      {renderContent()}
    </Modal>
  );
};

export default ShareProductsModal;
