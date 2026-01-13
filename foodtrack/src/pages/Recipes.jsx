import React, { useState } from 'react';
import RecipeCard from '../components/recipes/RecipeCard';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { ChefHat, Search, Filter } from 'lucide-react';

const Recipes = () => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const mockRecipes = [
    {
      id: 1,
      name: 'Куриная грудка с овощами',
      cookTime: 30,
      calories: 420,
      protein: 45,
      carbs: 28,
      fats: 12,
      difficulty: 'easy',
      tags: ['ПП', 'Высокобелковое', 'Обед'],
      image: null,
      ingredients: ['Куриная грудка 200г', 'Брокколи 150г', 'Морковь 100г', 'Оливковое масло 1 ст.л.', 'Специи по вкусу'],
      instructions: [
        'Нарежьте куриную грудку на кусочки',
        'Разогрейте сковороду с маслом',
        'Обжарьте курицу до золотистой корочки',
        'Добавьте нарезанные овощи',
        'Тушите под крышкой 15 минут',
        'Добавьте специи и подавайте'
      ]
    },
    {
      id: 2,
      name: 'Овсяноблин с творогом',
      cookTime: 10,
      calories: 280,
      protein: 22,
      carbs: 32,
      fats: 8,
      difficulty: 'easy',
      tags: ['ПП', 'Завтрак', 'Быстро'],
      image: null,
      ingredients: ['Овсяные хлопья 40г', 'Яйцо 2 шт', 'Творог 100г', 'Молоко 50мл', 'Соль по вкусу'],
      instructions: [
        'Смешайте овсянку, яйца и молоко',
        'Дайте настояться 5 минут',
        'Вылейте на разогретую сковороду',
        'Жарьте с двух сторон',
        'Выложите творог на одну половину',
        'Сложите пополам и подавайте'
      ]
    },
    {
      id: 3,
      name: 'Лосось с киноа и шпинатом',
      cookTime: 35,
      calories: 580,
      protein: 42,
      carbs: 45,
      fats: 22,
      difficulty: 'medium',
      tags: ['ПП', 'Омега-3', 'Ужин'],
      image: null,
      ingredients: ['Лосось 180г', 'Киноа 80г', 'Шпинат 100г', 'Лимон 1/2 шт', 'Чеснок 2 зубчика'],
      instructions: [
        'Отварите киноа в подсоленной воде',
        'Запеките лосось с лимоном в духовке 20 минут',
        'Обжарьте шпинат с чесноком',
        'Подавайте лосось с киноа и шпинатом'
      ]
    },
    {
      id: 4,
      name: 'Греческий салат с курицей',
      cookTime: 20,
      calories: 380,
      protein: 35,
      carbs: 18,
      fats: 20,
      difficulty: 'easy',
      tags: ['ПП', 'Салат', 'Обед'],
      image: null,
      ingredients: ['Куриная грудка 150г', 'Помидоры 150г', 'Огурцы 100г', 'Фета 50г', 'Оливки 30г', 'Листья салата', 'Оливковое масло'],
      instructions: [
        'Отварите или запеките куриную грудку',
        'Нарежьте все овощи кубиками',
        'Добавьте нарезанную курицу',
        'Раскрошите фету',
        'Заправьте оливковым маслом'
      ]
    },
    {
      id: 5,
      name: 'Протеиновые панкейки',
      cookTime: 15,
      calories: 320,
      protein: 28,
      carbs: 35,
      fats: 8,
      difficulty: 'easy',
      tags: ['ПП', 'Завтрак', 'Высокобелковое'],
      image: null,
      ingredients: ['Овсяная мука 50г', 'Протеин 30г', 'Яйцо 2 шт', 'Банан 1 шт', 'Разрыхлитель 1 ч.л.'],
      instructions: [
        'Разомните банан вилкой',
        'Смешайте все ингредиенты',
        'Жарьте на антипригарной сковороде',
        'Подавайте с ягодами или мёдом'
      ]
    },
    {
      id: 6,
      name: 'Чечевичный суп',
      cookTime: 40,
      calories: 290,
      protein: 18,
      carbs: 45,
      fats: 5,
      difficulty: 'easy',
      tags: ['ПП', 'Веган', 'Обед'],
      image: null,
      ingredients: ['Красная чечевица 150г', 'Морковь 1 шт', 'Лук 1 шт', 'Помидоры 200г', 'Специи'],
      instructions: [
        'Обжарьте лук и морковь',
        'Добавьте промытую чечевицу',
        'Влейте воду (1 литр)',
        'Варите 25 минут',
        'Добавьте помидоры и специи',
        'Варите ещё 10 минут'
      ]
    }
  ];

  const categories = [
    { value: 'all', label: 'Все рецепты' },
    { value: 'breakfast', label: 'Завтрак' },
    { value: 'lunch', label: 'Обед' },
    { value: 'dinner', label: 'Ужин' },
    { value: 'snack', label: 'Перекус' },
  ];

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterCategory === 'all') return matchesSearch;
    
    return matchesSearch && recipe.tags.some(tag => 
      tag.toLowerCase().includes(filterCategory.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center gap-3">
        <ChefHat className="w-8 h-8" />
        <h1 className="text-3xl lg:text-4xl font-bold">Рецепты ПП</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск рецептов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-12 pr-8 py-3 bg-gray-100 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none appearance-none cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <p className="text-secondary text-lg">Рецепты не найдены</p>
        </div>
      )}

      <Modal
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        title={selectedRecipe?.name}
        size="lg"
      >
        {selectedRecipe && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{selectedRecipe.cookTime}</div>
                <div className="text-sm text-secondary">минут</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{selectedRecipe.calories}</div>
                <div className="text-sm text-secondary">ккал</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{selectedRecipe.protein}г</div>
                <div className="text-sm text-secondary">белки</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{selectedRecipe.difficulty === 'easy' ? '🟢' : selectedRecipe.difficulty === 'medium' ? '🟡' : '🔴'}</div>
                <div className="text-sm text-secondary">сложность</div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Ингредиенты</h3>
              <ul className="space-y-2">
                {selectedRecipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                    <span>{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Приготовление</h3>
              <ol className="space-y-3">
                {selectedRecipe.instructions.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Button variant="primary" className="w-full" onClick={() => setSelectedRecipe(null)}>
              Закрыть
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Recipes;