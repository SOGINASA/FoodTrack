import React, { useState, useEffect } from 'react';
import RecipeCard from '../components/recipes/RecipeCard';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { ChefHat, Search, Filter, Clock, Flame, Calendar, Check } from 'lucide-react';
import { mealPlansAPI } from '../services/api';

const Recipes = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Состояния для добавления в план питанияs
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddingToPlan, setIsAddingToPlan] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Функция добавления рецепта в план питания
  const handleAddToMealPlan = async () => {
    if (!selectedRecipe) return;

    setIsAddingToPlan(true);
    try {
      await mealPlansAPI.create({
        recipeId: selectedRecipe.id,
        name: selectedRecipe.name,
        image: selectedRecipe.image,
        date: selectedDate,
        category: selectedRecipe.category,
        calories: selectedRecipe.calories,
        protein: selectedRecipe.protein,
        carbs: selectedRecipe.carbs,
        fats: selectedRecipe.fats,
        time: selectedRecipe.time,
        difficulty: selectedRecipe.difficulty,
        ingredients: selectedRecipe.ingredients,
        steps: selectedRecipe.steps,
        tags: selectedRecipe.tags,
      });

      setAddSuccess(true);
      setTimeout(() => {
        setAddSuccess(false);
        setShowDatePicker(false);
      }, 1500);
    } catch (error) {
      console.error('Ошибка добавления в план:', error);
      alert('Не удалось добавить рецепт в план питания');
    } finally {
      setIsAddingToPlan(false);
    }
  };

  // Генерация дат на 7 дней вперёд
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : dayNames[date.getDay()],
        dayNumber: date.getDate(),
        month: date.toLocaleString('ru', { month: 'short' }),
      });
    }
    return days;
  };

  const [allRecipes, setAllRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await recipesAPI.getAll();
        setAllRecipes(response.data.recipes);
      } catch (error) {
        console.error('Ошибка загрузки рецептов:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  // Фильтрация рецептов
  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || recipe.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const categories = [
    { value: 'all', label: 'Все рецепты', emoji: '🍽️' },
    { value: 'breakfast', label: 'Завтраки', emoji: '🌅' },
    { value: 'lunch', label: 'Обеды', emoji: '🍱' },
    { value: 'dinner', label: 'Ужины', emoji: '🌙' },
    { value: 'snack', label: 'Перекусы', emoji: '🥗' },
  ];

  const difficulties = [
    { value: 'all', label: 'Все уровни' },
    { value: 'easy', label: 'Легко' },
    { value: 'medium', label: 'Средне' },
    { value: 'hard', label: 'Сложно' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-4xl mb-4">🍳</div>
          <p className="text-secondary">Загрузка рецептов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8" />
          <h1 className="text-3xl lg:text-4xl font-bold">Рецепты</h1>
        </div>

        {/* Кнопка Холодильник для мобильных */}
        <button
          onClick={() => navigate('/fridge')}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <Refrigerator className="w-5 h-5" />
          <span className="text-sm">Холодильник</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск рецептов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-black outline-none"
          >
            {difficulties.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-2">
          Найдено {filteredRecipes.length} рецептов
        </h3>
        <p className="text-secondary text-sm">
          Все рецепты адаптированы для правильного питания
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onClick={() => setSelectedRecipe(recipe)}
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-bold text-xl mb-2">Рецепты не найдены</h3>
          <p className="text-secondary">
            Попробуйте изменить фильтры или поисковый запрос
          </p>
        </div>
      )}

      {selectedRecipe && (
        <Modal
          isOpen={!!selectedRecipe}
          onClose={() => {
            setSelectedRecipe(null);
            setShowDatePicker(false);
            setAddSuccess(false);
          }}
          size="lg"
          showCloseButton={true}
        >
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden h-64">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">{selectedRecipe.name}</h2>
              <div className="flex flex-wrap gap-2">
                {selectedRecipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
  <div className="text-center p-3 bg-gray-50 rounded-xl">
    <Clock className="w-5 h-5 mx-auto mb-1 text-gray-600" />
    <div className="text-sm text-secondary">Время</div>
    <div className="font-bold">{selectedRecipe.time} мин</div>
  </div>

  <div className="text-center p-3 bg-gray-50 rounded-xl">
    <Flame className="w-5 h-5 mx-auto mb-1 text-orange-600" />
    <div className="text-sm text-secondary">Калории</div>
    <div className="font-bold">{selectedRecipe.calories}</div>
  </div>

  <div className="text-center p-3 bg-gray-50 rounded-xl">
    <div className="text-lg mb-1">🍗</div>
    <div className="text-sm text-secondary">Белки</div>
    <div className="font-bold text-[#FF6B6B]">{selectedRecipe.protein}г</div>
  </div>

  <div className="text-center p-3 bg-gray-50 rounded-xl">
    <div className="text-lg mb-1">🥖</div>
    <div className="text-sm text-secondary">Углеводы</div>
    <div className="font-bold text-[#FFB84D]">{selectedRecipe.carbs}г</div>
  </div>

  <div className="text-center p-3 bg-gray-50 rounded-xl">
    <div className="text-lg mb-1">🧈</div>
    <div className="text-sm text-secondary">Жиры</div>
    <div className="font-bold text-[#4D9FFF]">{selectedRecipe.fats}г</div>
  </div>
</div>


            <div>
              <h3 className="font-bold text-lg mb-3">Ингредиенты</h3>
              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Приготовление</h3>
              <ol className="space-y-3">
                {selectedRecipe.steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {!showDatePicker ? (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setShowDatePicker(true)}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Добавить в план питания
              </Button>
            ) : (
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-bold text-center">Выберите дату</h4>

                <div className="grid grid-cols-7 gap-2">
                  {getNextDays().map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        selectedDate === day.date
                          ? 'bg-black text-white'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-xs opacity-70">{day.dayName}</div>
                      <div className="font-bold">{day.dayNumber}</div>
                      <div className="text-xs opacity-70">{day.month}</div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setShowDatePicker(false)}
                  >
                    Отмена
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={handleAddToMealPlan}
                    disabled={isAddingToPlan}
                  >
                    {isAddingToPlan ? (
                      'Добавление...'
                    ) : addSuccess ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Добавлено!
                      </>
                    ) : (
                      'Добавить'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Recipes;
