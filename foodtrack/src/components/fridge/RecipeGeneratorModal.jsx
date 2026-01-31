import React, { useState } from 'react';
import { ChefHat, Sparkles, Loader } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const RecipeGeneratorModal = ({ isOpen, onClose, products }) => {
  const [preferences, setPreferences] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Здесь будет вызов API для генерации рецептов
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Временные данные для теста
      const mockRecipes = [
        {
          id: 1,
          name: 'Куриный салат с овощами',
          ingredients: products.slice(0, 3).map(p => p.name),
          time: 20,
          difficulty: 'easy'
        },
        {
          id: 2,
          name: 'Омлет с помидорами',
          ingredients: products.slice(0, 2).map(p => p.name),
          time: 15,
          difficulty: 'easy'
        }
      ];

      setGeneratedRecipes(mockRecipes);
    } catch (error) {
      console.error('Ошибка генерации рецептов:', error);
      alert('Не удалось создать рецепты. Попробуйте ещё раз.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setPreferences('');
    setGeneratedRecipes([]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Создать рецепты</h2>
            <p className="text-sm text-gray-600">
              На основе {products.length} {products.length === 1 ? 'продукта' : 'продуктов'}
            </p>
          </div>
        </div>

        {!generatedRecipes.length ? (
          <>
            {/* Список продуктов */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2">Используем продукты:</h3>
              <div className="flex flex-wrap gap-2">
                {products.slice(0, 10).map(product => (
                  <span
                    key={product.id}
                    className="px-3 py-1 bg-white rounded-full text-sm font-medium"
                  >
                    {product.name}
                  </span>
                ))}
                {products.length > 10 && (
                  <span className="px-3 py-1 bg-gray-200 rounded-full text-sm font-medium text-gray-600">
                    +{products.length - 10} ещё
                  </span>
                )}
              </div>
            </div>

            {/* Поле для пожеланий */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Ваши пожелания (необязательно)
              </label>
              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Например: хочу что-то лёгкое, без мяса, на завтрак..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-base focus:ring-2 focus:ring-black outline-none resize-none"
              />
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleClose}
                disabled={isGenerating}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Создаём...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Создать рецепты
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Результаты генерации */}
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Рецепты готовы! 🎉</h3>
              {generatedRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                >
                  <h4 className="font-bold mb-2">{recipe.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>⏱️ {recipe.time} мин</span>
                    <span>
                      {recipe.difficulty === 'easy' && '✅ Легко'}
                      {recipe.difficulty === 'medium' && '⚡ Средне'}
                      {recipe.difficulty === 'hard' && '🔥 Сложно'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {recipe.ingredients.map((ing, idx) => (
                      <span key={idx} className="text-xs bg-white px-2 py-1 rounded-full">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button variant="primary" className="w-full" onClick={handleClose}>
              Отлично!
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default RecipeGeneratorModal;
