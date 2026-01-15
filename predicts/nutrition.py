import os
from typing import Dict, Optional
from dotenv import load_dotenv
from requests_oauthlib import OAuth1Session
from food_name_mapper import map_food_name

# Загружаем переменные окружения из .env файла (относительно текущего скрипта)
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)

# Получаем API ключи из переменной окружения
FATSECRET_CONSUMER_KEY = os.getenv('FATSECRET_CONSUMER_KEY', '')
FATSECRET_CONSUMER_SECRET = os.getenv('FATSECRET_CONSUMER_SECRET', '')


def get_nutrition_info(food_name: str) -> Optional[Dict]:
    """
    Получает информацию о калорийности и питательных веществах блюда через FatSecret API

    Args:
        food_name: Название блюда/продукта (из модели)

    Returns:
        Dict с информацией о калориях и питательных веществах или None в случае ошибки
        {
            'calories': float,
            'protein': float,
            'fat': float,
            'carbs': float,
            'title': str,
            'original_name': str
        }
    """
    if not FATSECRET_CONSUMER_KEY or not FATSECRET_CONSUMER_SECRET:
        return {
            'error': 'FatSecret API ключи не найдены. Добавьте FATSECRET_CONSUMER_KEY и FATSECRET_CONSUMER_SECRET в .env файл'
        }

    # Преобразуем название из модели в понятное для API
    mapped_name = map_food_name(food_name)

    try:
        # Создаем OAuth1 сессию для FatSecret API
        oauth = OAuth1Session(
            FATSECRET_CONSUMER_KEY,
            client_secret=FATSECRET_CONSUMER_SECRET
        )

        # FatSecret использует метод-based интеграцию
        url = "https://platform.fatsecret.com/rest/server.api"

        params = {
            'method': 'foods.search',
            'search_expression': mapped_name,
            'max_results': 1,
            'format': 'json'
        }

        response = oauth.post(url, data=params, timeout=10)
        response.raise_for_status()

        data = response.json()

        # Проверяем, есть ли результаты
        if 'foods' not in data or 'food' not in data['foods']:
            return {
                'error': f'Блюдо "{mapped_name}" не найдено в базе данных FatSecret'
            }

        food = data['foods']['food']
        
        # Парсим информацию из food_description
        # Формат: "Per 100g - Calories: 254kcal | Fat: 20.00g | Carbs: 0.00g | Protein: 17.17g"
        description = food.get('food_description', '')
        
        # Извлекаем калории, жиры, углеводы, белки из описания
        calories = 0
        protein = 0
        fat = 0
        carbs = 0
        
        if description:
            import re
            # Извлекаем значения с использованием regex
            cal_match = re.search(r'Calories:\s*([\d.]+)', description)
            if cal_match:
                calories = float(cal_match.group(1))
            
            fat_match = re.search(r'Fat:\s*([\d.]+)', description)
            if fat_match:
                fat = float(fat_match.group(1))
            
            carbs_match = re.search(r'Carbs:\s*([\d.]+)', description)
            if carbs_match:
                carbs = float(carbs_match.group(1))
            
            protein_match = re.search(r'Protein:\s*([\d.]+)', description)
            if protein_match:
                protein = float(protein_match.group(1))

        # Извлекаем нужную информацию
        result = {
            'title': food.get('food_name', mapped_name),
            'original_name': food_name,  # Сохраняем оригинальное название из модели
            'calories': calories,
            'protein': protein,
            'fat': fat,
            'carbs': carbs,
            'calories_unit': 'kcal',
            'protein_unit': 'g',
            'fat_unit': 'g',
            'carbs_unit': 'g'
        }

        return result

    except Exception as e:
        return {
            'error': f'Ошибка при запросе к API: {str(e)}'
        }


def format_nutrition_info(nutrition_data: Dict) -> str:
    """
    Форматирует информацию о питательных веществах в читаемый текст

    Args:
        nutrition_data: Словарь с данными о питании

    Returns:
        Отформатированная строка с информацией
    """
    if 'error' in nutrition_data:
        return f"❌ {nutrition_data['error']}"

    result = []
    result.append(f"📊 Пищевая ценность: {nutrition_data.get('title', 'N/A')}")
    result.append(f"🔥 Калории: {nutrition_data.get('calories', 0)} {nutrition_data.get('calories_unit', 'kcal')}")
    result.append(f"🥩 Белки: {nutrition_data.get('protein', 0)} {nutrition_data.get('protein_unit', 'g')}")
    result.append(f"🧈 Жиры: {nutrition_data.get('fat', 0)} {nutrition_data.get('fat_unit', 'g')}")
    result.append(f"🍞 Углеводы: {nutrition_data.get('carbs', 0)} {nutrition_data.get('carbs_unit', 'g')}")

    return "\n".join(result)


# Пример использования
if __name__ == "__main__":
    test_food = "hamburger"
    nutrition = get_nutrition_info(test_food)
    print(format_nutrition_info(nutrition))
