import React, { useState, useEffect } from 'react';
import { Refrigerator, Plus, Scan, ChefHat, Users } from 'lucide-react';
import Button from '../components/common/Button';
import ProductScanner from '../components/fridge/ProductScanner';
import AddProductModal from '../components/fridge/AddProductModal';
import ProductCard from '../components/fridge/ProductCard';
import RecipeGeneratorModal from '../components/fridge/RecipeGeneratorModal';
import ShareProductsModal from '../components/fridge/ShareProductsModal';
import { ShareRequestsList } from '../components/fridge/ShareRequestNotification';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { fridgeAPI } from '../services/api';
import useNotificationStore from '../stores/notificationStore';
import useToastStore from '../stores/toastStore';

const Fridge = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [shareRequests, setShareRequests] = useState([]);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const newNotification = useNotificationStore((s) => s.newNotification);
  const { showToast } = useToastStore();

  // Загрузка продуктов при монтировании
  useEffect(() => {
    fetchProducts();
    loadShareRequests();
  }, []);

  // Рефетч при fridge-уведомлении через WebSocket
  useEffect(() => {
    if (newNotification?.category === 'fridge') {
      loadShareRequests();
      fetchProducts();
    }
  }, [newNotification]);

  // Загрузка входящих запросов на sharing
  const loadShareRequests = async () => {
    try {
      const response = await fridgeAPI.getShareRequests();
      const data = (response.data || []).map(r => ({
        id: r.id,
        senderName: r.senderName,
        products: r.products,
      }));
      setShareRequests(data);
    } catch (error) {
      console.error('Ошибка загрузки запросов:', error);
      setShareRequests([]);
    }
  };

  // Принять запрос на sharing
  const handleAcceptShareRequest = async (requestId) => {
    try {
      await fridgeAPI.acceptShareRequest(requestId);
      setShareRequests(prev => prev.filter(req => req.id !== requestId));
      showToast('Запрос принят! Продукты добавлены в ваш холодильник', 'success');
      fetchProducts(); // обновляем список продуктов
    } catch (error) {
      console.error('Ошибка принятия запроса:', error);
      showToast('Не удалось принять запрос', 'error');
    }
  };

  // Отклонить запрос на sharing
  const handleDeclineShareRequest = async (requestId) => {
    try {
      await fridgeAPI.rejectShareRequest(requestId);
      setShareRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Ошибка отклонения запроса:', error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fridgeAPI.getAll();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка результатов сканирования
  const handleScanComplete = async (scanData, scanMode) => {
    if (scanMode === 'receipt') {
      // Если отсканирован чек - добавляем все продукты из него
      for (const item of scanData) {
        const productData = {
          name: item.name,
          quantity: item.quantity || 1,
          unit: 'шт',
          category: 'other',
        };
        await handleAddProduct(productData);
      }
    } else {
      // Если отсканирован штрихкод - открываем модалку добавления с предзаполненными данными
      setEditingProduct({
        name: scanData.name,
        quantity: 1,
        unit: 'шт',
        category: 'other',
      });
      setIsAddModalOpen(true);
    }
  };

  // Добавление продукта
  const handleAddProduct = async (productData) => {
    try {
      const response = await fridgeAPI.addProduct(productData);
      setProducts(prev => [response.data, ...prev]);
      showToast('Продукт добавлен', 'success');
    } catch (error) {
      console.error('Ошибка добавления продукта:', error);
      // Временно добавляем локально
      const newProduct = {
        id: Date.now(),
        ...productData,
      };
      setProducts(prev => [newProduct, ...prev]);
      showToast('Продукт добавлен локально', 'warning');
    }
  };

  // Обновление продукта
  const handleUpdateProduct = async (productData) => {
    try {
      await fridgeAPI.updateProduct(editingProduct.id, productData);
      setProducts(prev =>
        prev.map(p => (p.id === editingProduct.id ? { ...p, ...productData } : p))
      );
      showToast('Продукт обновлён', 'success');
    } catch (error) {
      console.error('Ошибка обновления продукта:', error);
      showToast('Не удалось обновить продукт', 'error');
    }
  };

  // Удаление продукта (открытие модалки подтверждения)
  const handleDeleteProductClick = (productId) => {
    setDeleteProductId(productId);
  };

  // Подтверждение удаления
  const confirmDeleteProduct = async () => {
    if (!deleteProductId) return;

    try {
      await fridgeAPI.deleteProduct(deleteProductId);
      setProducts(prev => prev.filter(p => p.id !== deleteProductId));
      showToast('Продукт удалён', 'success');
    } catch (error) {
      console.error('Ошибка удаления продукта:', error);
      // Временно удаляем локально
      setProducts(prev => prev.filter(p => p.id !== deleteProductId));
      showToast('Продукт удалён локально', 'warning');
    } finally {
      setDeleteProductId(null);
    }
  };

  // Открытие редактирования
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  // Фильтрация продуктов
  const filteredProducts = products.filter(product => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'expiring') {
      const daysUntilExpiry = product.expiryDate
        ? Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null;
      return daysUntilExpiry !== null && daysUntilExpiry <= 7;
    }
    return product.category === filterCategory;
  });

  // Подсчёт продуктов с истекающим сроком
  const expiringCount = products.filter(product => {
    const daysUntilExpiry = product.expiryDate
      ? Math.ceil((new Date(product.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      : null;
    return daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry >= 0;
  }).length;

  const categories = [
    { value: 'all', label: 'Все', emoji: '📦' },
    { value: 'expiring', label: 'Истекают', emoji: '⚠️' },
    { value: 'dairy', label: 'Молочное', emoji: '🥛' },
    { value: 'meat', label: 'Мясо', emoji: '🍖' },
    { value: 'vegetables', label: 'Овощи', emoji: '🥗' },
    { value: 'fruits', label: 'Фрукты', emoji: '🍎' },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* Шапка */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Refrigerator className="w-8 h-8" />
          <h1 className="text-3xl lg:text-4xl font-bold">Холодильник</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2"
          >
            <Scan className="w-5 h-5" />
            <span className="hidden sm:inline">Сканировать</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditingProduct(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Добавить</span>
          </Button>
        </div>
      </div>

      {/* Генерация рецептов - только если есть продукты */}
      {products.length > 0 && (
        <button
          onClick={() => setIsRecipeModalOpen(true)}
          className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl p-4 hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-3"
        >
          <ChefHat className="w-6 h-6" />
          <div className="text-left">
            <div className="font-bold text-lg">Создать рецепты из продуктов</div>
            {expiringCount > 0 && (
              <div className="text-sm opacity-90">
                {expiringCount} {expiringCount === 1 ? 'продукт' : 'продукта'} скоро испортится
              </div>
            )}
          </div>
        </button>
      )}

      {/* Поделиться продуктами - только если есть продукты */}
      {products.length > 0 && (
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-4 hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-3"
        >
          <Users className="w-6 h-6" />
          <div className="text-left">
            <div className="font-bold text-lg">Поделиться продуктами</div>
            <div className="text-sm opacity-90">
              Найти пользователей рядом с вами
            </div>
          </div>
        </button>
      )}

      {/* Фильтры */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilterCategory(cat.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
              filterCategory === cat.value
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Список продуктов */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Загрузка продуктов...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {products.length === 0 ? '🧊' : '🔍'}
          </div>
          <h3 className="font-bold text-xl mb-2">
            {products.length === 0 ? 'Холодильник пуст' : 'Продукты не найдены'}
          </h3>
          <p className="text-secondary mb-6">
            {products.length === 0
              ? 'Добавьте продукты, чтобы начать отслеживание'
              : 'Попробуйте изменить фильтр категорий'}
          </p>
          {products.length === 0 && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Добавить продукт
              </Button>
              <Button variant="secondary" onClick={() => setIsScannerOpen(true)}>
                <Scan className="w-5 h-5 mr-2" />
                Сканировать чек
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProductClick}
            />
          ))}
        </div>
      )}

      {/* Модалки */}
      <ProductScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        onAdd={editingProduct ? handleUpdateProduct : handleAddProduct}
        initialData={editingProduct}
      />

      <RecipeGeneratorModal
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
        products={products}
      />

      <ShareProductsModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        products={products}
      />

      {/* Уведомления о входящих запросах */}
      <ShareRequestsList
        requests={shareRequests}
        onAccept={handleAcceptShareRequest}
        onDecline={handleDeclineShareRequest}
      />

      {/* Модалка подтверждения удаления */}
      <ConfirmationModal
        isOpen={!!deleteProductId}
        onClose={() => setDeleteProductId(null)}
        onConfirm={confirmDeleteProduct}
        title="Удалить продукт?"
        message="Вы уверены, что хотите удалить этот продукт из холодильника?"
        confirmText="Удалить"
        cancelText="Отмена"
        variant="danger"
      />
    </div>
  );
};

export default Fridge;
