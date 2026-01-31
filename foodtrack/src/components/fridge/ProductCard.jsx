import React from 'react';
import { Calendar, Trash2, Edit2, AlertTriangle } from 'lucide-react';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const getCategoryEmoji = (category) => {
    const emojis = {
      dairy: '🥛',
      meat: '🍖',
      fish: '🐟',
      vegetables: '🥗',
      fruits: '🍎',
      bakery: '🍞',
      frozen: '❄️',
      canned: '🥫',
      other: '📦',
    };
    return emojis[category] || '📦';
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getExpiryStatus = (daysUntilExpiry) => {
    if (daysUntilExpiry === null) {
      return { color: 'gray', text: 'Без срока', bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
    }

    if (daysUntilExpiry < 0) {
      return { color: 'red', text: 'Просрочен', bgColor: 'bg-red-100', textColor: 'text-red-700' };
    }

    if (daysUntilExpiry === 0) {
      return { color: 'orange', text: 'Истекает сегодня', bgColor: 'bg-orange-100', textColor: 'text-orange-700' };
    }

    if (daysUntilExpiry === 1) {
      return { color: 'orange', text: 'Истекает завтра', bgColor: 'bg-orange-100', textColor: 'text-orange-700' };
    }

    if (daysUntilExpiry <= 3) {
      return { color: 'yellow', text: `${daysUntilExpiry} дня`, bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' };
    }

    if (daysUntilExpiry <= 7) {
      return { color: 'yellow', text: `${daysUntilExpiry} дней`, bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' };
    }

    return { color: 'green', text: `${daysUntilExpiry} дней`, bgColor: 'bg-green-100', textColor: 'text-green-700' };
  };

  const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate);
  const expiryStatus = getExpiryStatus(daysUntilExpiry);
  const isExpiring = daysUntilExpiry !== null && daysUntilExpiry <= 3;

  return (
    <div className={`relative bg-white border-2 rounded-2xl p-4 hover:shadow-md transition-all ${
      isExpiring ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'
    }`}>
      {/* Индикатор просрочки */}
      {isExpiring && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-orange-500 text-white rounded-full p-1.5 shadow-lg">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Иконка категории */}
        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
          {getCategoryEmoji(product.category)}
        </div>

        {/* Информация о продукте */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base mb-1 truncate">{product.name}</h3>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span className="font-semibold">
              {product.quantity} {product.unit}
            </span>
          </div>

          {/* Срок годности */}
          {product.expiryDate && (
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {new Date(product.expiryDate).toLocaleDateString('ru-RU')}
              </span>
            </div>
          )}

          {/* Статус срока годности */}
          <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${expiryStatus.bgColor} ${expiryStatus.textColor}`}>
            {expiryStatus.text}
          </div>

          {/* Заметки */}
          {product.notes && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {product.notes}
            </p>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Редактировать"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Удалить"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
