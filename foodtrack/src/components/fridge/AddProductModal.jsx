import React, { useState } from 'react';
import { X, Calendar, Package, Hash } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const AddProductModal = ({ isOpen, onClose, onAdd, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    quantity: initialData?.quantity || 1,
    unit: initialData?.unit || 'шт',
    expiryDate: initialData?.expiryDate || '',
    category: initialData?.category || 'other',
    notes: initialData?.notes || '',
  });

  const units = [
    { value: 'шт', label: 'шт' },
    { value: 'кг', label: 'кг' },
    { value: 'г', label: 'г' },
    { value: 'л', label: 'л' },
    { value: 'мл', label: 'мл' },
    { value: 'упак', label: 'упак' },
  ];

  const categories = [
    { value: 'dairy', label: 'Молочное', emoji: '🥛' },
    { value: 'meat', label: 'Мясо', emoji: '🍖' },
    { value: 'fish', label: 'Рыба', emoji: '🐟' },
    { value: 'vegetables', label: 'Овощи', emoji: '🥗' },
    { value: 'fruits', label: 'Фрукты', emoji: '🍎' },
    { value: 'bakery', label: 'Хлеб', emoji: '🍞' },
    { value: 'frozen', label: 'Замороженное', emoji: '❄️' },
    { value: 'canned', label: 'Консервы', emoji: '🥫' },
    { value: 'other', label: 'Другое', emoji: '📦' },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Введите название продукта');
      return;
    }

    // Валидация срока годности
    if (formData.expiryDate) {
      const expiryDate = new Date(formData.expiryDate);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      if (isNaN(expiryDate.getTime())) {
        alert('Некорректная дата срока годности');
        return;
      }

      if (expiryDate < todayDate) {
        alert('Срок годности не может быть в прошлом');
        return;
      }
    }

    onAdd(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      quantity: 1,
      unit: 'шт',
      expiryDate: '',
      category: 'other',
      notes: '',
    });
    onClose();
  };

  // Определяем минимальную дату (сегодня)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" showCloseButton={false}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            {initialData ? 'Редактировать продукт' : 'Добавить продукт'}
          </h2>
          <button type="button" onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Название продукта */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Название продукта *
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Например: Молоко 3.2%"
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
              required
            />
          </div>
        </div>

        {/* Количество и единицы */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Количество
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseFloat(e.target.value) || 1)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Единица
            </label>
            <select
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            >
              {units.map(unit => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Категория */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Категория
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleChange('category', cat.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  formData.category === cat.value
                    ? 'bg-black text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="text-xs font-semibold">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Срок годности */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Срок годности
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              min={today}
              value={formData.expiryDate}
              onChange={(e) => handleChange('expiryDate', e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Оставьте пустым, если продукт не имеет срока годности
          </p>
        </div>

        {/* Заметки */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Заметки (необязательно)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Дополнительная информация о продукте"
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none resize-none"
          />
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {initialData ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProductModal;
