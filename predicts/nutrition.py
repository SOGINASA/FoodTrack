import requests
import os
from typing import Dict, Optional
from dotenv import load_dotenv

# Загружаем переменные окружения из .env файла
load_dotenv('.env')

# Получаем API ключ из переменной окружения
SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY', '')


def get_nutrition_info(food_name: str) -> Optional[Dict]:
    """
    Получает информацию о калорийности и питательных веществах блюда через Spoonacular API

    Args:
        food_name: Название блюда/продукта

    Returns:
        Dict с информацией о калориях и питательных веществах или None в случае ошибки
        {
            'calories': float,
            'protein': float,
            'fat': float,
            'carbs': float,
            'title': str
        }
    """
    if not SPOONACULAR_API_KEY:
        return {
            'error': 'API ключ Spoonacular не найден. Добавьте SPOONACULAR_API_KEY в .env файл'
        }

    try:
        # API endpoint для определения питательной ценности
        url = "https://api.spoonacular.com/recipes/guessNutrition"

        params = {
            'title': food_name,
            'apiKey': SPOONACULAR_API_KEY
        }

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()

        # Извлекаем нужную информацию
        result = {
            'title': data.get('title', food_name),
            'calories': data.get('calories', {}).get('value', 0),
            'protein': data.get('protein', {}).get('value', 0),
            'fat': data.get('fat', {}).get('value', 0),
            'carbs': data.get('carbs', {}).get('value', 0),
            'calories_unit': data.get('calories', {}).get('unit', 'kcal'),
            'protein_unit': data.get('protein', {}).get('unit', 'g'),
            'fat_unit': data.get('fat', {}).get('unit', 'g'),
            'carbs_unit': data.get('carbs', {}).get('unit', 'g')
        }

        return result

    except requests.exceptions.RequestException as e:
        return {
            'error': f'Ошибка при запросе к API: {str(e)}'
        }
    except Exception as e:
        return {
            'error': f'Неизвестная ошибка: {str(e)}'
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
    test_food = "chicken alfredo"
    nutrition = get_nutrition_info(test_food)
    print(format_nutrition_info(nutrition))
