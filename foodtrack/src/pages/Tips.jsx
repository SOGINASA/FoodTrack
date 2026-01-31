import React, { useState, useEffect } from 'react';
import TipCard from '../components/tips/TipCard';
import Loader from '../components/common/Loader';
import { Lightbulb, Filter, Search } from 'lucide-react';
import { tipsAPI } from '../services/api';

const Tips = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [tips, setTips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем советы с бэка при монтировании и изменении фильтров
  useEffect(() => {
    const fetchTips = async () => {
      setIsLoading(true);
      try {
        const params = {};
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedPriority !== 'all') params.priority = selectedPriority;
        if (searchQuery) params.search = searchQuery;

        const response = await tipsAPI.getAll(params);
        setTips(response.data.tips || []);
      } catch (error) {
        console.error('Ошибка загрузки советов:', error);
        setTips([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Создаём задержку чтобы не перегружать API при быстрых изменениях
    const timer = setTimeout(fetchTips, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedPriority, searchQuery]);

  const categories = [
    { value: 'all', label: 'Все советы' },
    { value: 'calories', label: 'Калории' },
    { value: 'protein', label: 'Белки' },
    { value: 'carbs', label: 'Углеводы' },
    { value: 'fats', label: 'Жиры' },
    { value: 'lifestyle', label: 'Образ жизни' },
    { value: 'motivation', label: 'Мотивация' },
  ];

  const priorities = [
    { value: 'all', label: 'Все приоритеты' },
    { value: 'high', label: 'Высокий' },
    { value: 'medium', label: 'Средний' },
    { value: 'low', label: 'Низкий' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <Lightbulb className="w-8 h-8" />
        <h1 className="text-3xl lg:text-4xl font-bold">Советы</h1>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск советов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none"
          >
            {priorities.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-2">
          Найдено {tips.length} персонализированных советов
        </h3>
        <p className="text-secondary text-sm">
          Советы основаны на ваших текущих показателях и целях
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {tips.map(tip => (
          <TipCard
            key={tip.id}
            title={tip.title}
            description={tip.description}
            icon={tip.icon}
            priority={tip.priority}
            category={tip.category}
          />
        ))}
      </div>

      {tips.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-bold text-xl mb-2">Советы не найдены</h3>
          <p className="text-secondary">
            Попробуйте изменить фильтры или поисковый запрос
          </p>
        </div>
      )}
    </div>
  );
};

export default Tips;
