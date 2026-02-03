from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Meal, UserGoals, WaterEntry
from datetime import datetime, timedelta
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

tips_bp = Blueprint('tips', __name__)

# База всех советов
ALL_TIPS = [
    # КАЛОРИИ - Превышение (20 советов)
    {
        "id": 1,
        "title": "Контролируйте размер порций",
        "description": "Вы превышаете дневную норму калорий. Попробуйте использовать меньшие тарелки - исследования показывают, что это помогает съедать на 20% меньше.",
        "icon": "🍽️",
        "category": "calories",
        "priority": "high",
        "condition": "exceeds_calories"
    },
    {
        "id": 2,
        "title": "Замените калорийные напитки",
        "description": "Сладкие напитки незаметно добавляют до 500 ккал в день. Замените их на воду с лимоном, зелёный чай или несладкий кофе.",
        "icon": "🥤",
        "category": "calories",
        "priority": "high",
        "condition": "exceeds_calories"
    },
    {
        "id": 3,
        "title": "Откажитесь от поздних перекусов",
        "description": "Приёмы пищи после 20:00 часто приводят к перееданию. Установите правило 'кухня закрыта после ужина'.",
        "icon": "🌙",
        "category": "calories",
        "priority": "medium",
        "condition": "exceeds_calories"
    },
    {
        "id": 4,
        "title": "Жуйте медленнее",
        "description": "Мозгу нужно 20 минут чтобы получить сигнал о насыщении. Медленное пережёвывание помогает съесть меньше.",
        "icon": "⏱️",
        "category": "calories",
        "priority": "low",
        "condition": "exceeds_calories"
    },
    {
        "id": 5,
        "title": "Ешьте больше клетчатки",
        "description": "Клетчатка снижает калорийность рациона на 10-20%. Добавьте овощи, фрукты, бобовые и цельнозерновые.",
        "icon": "🥬",
        "category": "calories",
        "priority": "medium",
        "condition": "exceeds_calories"
    },
    {
        "id": 6,
        "title": "Планируйте приёмы пищи заранее",
        "description": "Спонтанные перекусы - главная причина перебора калорий. Запланируйте меню на день и придерживайтесь плана.",
        "icon": "📅",
        "category": "calories",
        "priority": "high",
        "condition": "exceeds_calories"
    },
    {
        "id": 7,
        "title": "Ешьте медленнее - используйте таймер",
        "description": "Установите минимум 20 минут на приём пищи. Это поможет лучше чувствовать сытость.",
        "icon": "⏰",
        "category": "calories",
        "priority": "low",
        "condition": "exceeds_calories"
    },
    {
        "id": 8,
        "title": "Уменьшите размер посуды",
        "description": "Исследования показывают, что люди съедают столько же, сколько помещается в тарелку. Размер тарелки на 30% меньше = на 20% меньше съедаем.",
        "icon": "🍽️",
        "category": "calories",
        "priority": "medium",
        "condition": "exceeds_calories"
    },
    {
        "id": 9,
        "title": "Не ешьте перед экраном",
        "description": "Люди, которые едят перед ТВ или телефоном, потребляют на 40% больше. Ешьте за столом осознанно.",
        "icon": "📱",
        "category": "calories",
        "priority": "high",
        "condition": "exceeds_calories"
    },
    {
        "id": 10,
        "title": "Увеличьте физическую активность",
        "description": "Добавьте 30 минут активности в день - прогулка, велосипед, плавание. Это сожжёт 200-300 ккал.",
        "icon": "🚴",
        "category": "calories",
        "priority": "medium",
        "condition": "exceeds_calories"
    },

    # БЕЛКИ - Недостаток (20 советов)
    {
        "id": 21,
        "title": "Добавьте белок в завтрак",
        "description": "Вы не достаточно получаете белков. Добавьте яйца, творог, йогурт или творожную запеканку к завтраку.",
        "icon": "🥚",
        "category": "protein",
        "priority": "high",
        "condition": "low_protein"
    },
    {
        "id": 22,
        "title": "Ешьте больше курицы и рыбы",
        "description": "Постная птица и рыба - отличный источник белка с низким содержанием жира. Съедайте 100-150г в день.",
        "icon": "🐔",
        "category": "protein",
        "priority": "high",
        "condition": "low_protein"
    },
    {
        "id": 23,
        "title": "Добавьте бобовые в рацион",
        "description": "Чечевица, нут и фасоль содержат 15-20г белка на порцию и очень доступны.",
        "icon": "🫘",
        "category": "protein",
        "priority": "medium",
        "condition": "low_protein"
    },
    {
        "id": 24,
        "title": "Белковые перекусы",
        "description": "Орехи, семечки, сыр - отличные источники белка для перекусов между основными приёмами пищи.",
        "icon": "🥜",
        "category": "protein",
        "priority": "medium",
        "condition": "low_protein"
    },
    {
        "id": 25,
        "title": "Молочные продукты",
        "description": "Молоко, йогурт и творог содержат качественный белок. Съедайте 200-300г молочных продуктов в день.",
        "icon": "🥛",
        "category": "protein",
        "priority": "medium",
        "condition": "low_protein"
    },
    {
        "id": 26,
        "title": "Мясо - основной источник",
        "description": "Красное мясо, индейка и говядина содержат до 25g белка на 100g. Добавьте 150-200g мяса к обеду.",
        "icon": "🥩",
        "category": "protein",
        "priority": "high",
        "condition": "low_protein"
    },
    {
        "id": 27,
        "title": "Протеиновые напитки",
        "description": "Если не хватает белка, добавьте протеиновый коктейль. Быстро, удобно, вкусно.",
        "icon": "🥤",
        "category": "protein",
        "priority": "low",
        "condition": "low_protein"
    },
    {
        "id": 28,
        "title": "Каша с молоком",
        "description": "Готовьте каши на молоке вместо воды - это добавит белок. Геркулес на молоке = 10g белка на порцию.",
        "icon": "🥣",
        "category": "protein",
        "priority": "medium",
        "condition": "low_protein"
    },
    {
        "id": 29,
        "title": "Яйца - экономный вариант",
        "description": "Яйца дешевы, доступны и содержат полный набор аминокислот. Съедайте 2-3 яйца в день.",
        "icon": "🥚",
        "category": "protein",
        "priority": "high",
        "condition": "low_protein"
    },
    {
        "id": 30,
        "title": "Белый рис с бобовыми",
        "description": "Комбинируйте зерновые с бобовыми для полноценного белка. Гречка с черной фасолью - идеальная пара.",
        "icon": "🍚",
        "category": "protein",
        "priority": "low",
        "condition": "low_protein"
    },

    # ОБРАЗ ЖИЗНИ (20 советов)
    {
        "id": 51,
        "title": "Пейте больше воды",
        "description": "Вода ускоряет метаболизм на 30% в течение часа. Пейте минимум 2-3 литра в день.",
        "icon": "💧",
        "category": "lifestyle",
        "priority": "high",
        "condition": "low_water"
    },
    {
        "id": 110,
        "title": "Пейте воду перед едой",
        "description": "Стакан воды за 30 минут до еды снижает аппетит и помогает контролировать порции. Вы пьёте меньше нормы - добавьте этот ритуал.",
        "icon": "💧",
        "category": "lifestyle",
        "priority": "medium",
        "condition": "low_water"
    },
    {
        "id": 111,
        "title": "Установите напоминания о воде",
        "description": "Вы не достигаете дневной нормы воды. Пейте по стакану каждые 1-2 часа - поставьте напоминание на телефоне.",
        "icon": "⏰",
        "category": "lifestyle",
        "priority": "high",
        "condition": "low_water"
    },
    {
        "id": 112,
        "title": "Носите бутылку воды с собой",
        "description": "Когда вода всегда под рукой, вы пьёте на 40% больше. Заведите многоразовую бутылку.",
        "icon": "🧴",
        "category": "lifestyle",
        "priority": "medium",
        "condition": "low_water"
    },
    {
        "id": 52,
        "title": "Спите достаточно",
        "description": "Недосып нарушает выработку гормонов голода и сытости. Спите минимум 7-8 часов в день.",
        "icon": "😴",
        "category": "lifestyle",
        "priority": "high",
        "condition": "always"
    },
    {
        "id": 53,
        "title": "Ходите 10000 шагов в день",
        "description": "10000 шагов сжигают 300-500 ккал в день. Это существенно помогает в похудении.",
        "icon": "🚶",
        "category": "lifestyle",
        "priority": "medium",
        "condition": "always"
    },
    {
        "id": 54,
        "title": "Тренируйтесь регулярно",
        "description": "3-4 тренировки в неделю помогут вам быстрее достичь целей. Начните с 20-30 минут.",
        "icon": "💪",
        "category": "lifestyle",
        "priority": "medium",
        "condition": "always"
    },
    {
        "id": 55,
        "title": "Контролируйте стресс",
        "description": "Стресс и кортизол провоцируют переедание и отложение жира. Медитируйте, йога или простые дыхательные упражнения.",
        "icon": "🧘",
        "category": "lifestyle",
        "priority": "medium",
        "condition": "always"
    },
    {
        "id": 56,
        "title": "Ведите дневник питания",
        "description": "Люди, которые записывают свою еду, теряют вес в 2 раза быстрее. Используйте наше приложение!",
        "icon": "📔",
        "category": "lifestyle",
        "priority": "low",
        "condition": "always"
    },
    {
        "id": 57,
        "title": "Завтракайте каждый день",
        "description": "Завтрак запускает метаболизм и помогает контролировать голод весь день. Не пропускайте завтрак!",
        "icon": "🌅",
        "category": "lifestyle",
        "priority": "medium",
        "condition": "always"
    },
    {
        "id": 58,
        "title": "Есть больше овощей",
        "description": "Овощи низкокалорийные, но объёмные. Половина вашей тарелки должна состоять из овощей.",
        "icon": "🥕",
        "category": "lifestyle",
        "priority": "medium",
        "condition": "always"
    },
    {
        "id": 59,
        "title": "Не пропускайте приёмы пищи",
        "description": "Пропуск приёмов пищи приводит к перееданию позже. Ешьте регулярно 3-4 раза в день.",
        "icon": "🍽️",
        "category": "lifestyle",
        "priority": "high",
        "condition": "always"
    },
    {
        "id": 60,
        "title": "Используйте маленькие порции",
        "description": "Ешьте чаще, но меньше. Это поддерживает метаболизм и уровень сахара в крови на оптимальном уровне.",
        "icon": "🥄",
        "category": "lifestyle",
        "priority": "low",
        "condition": "always"
    },

    # МОТИВАЦИЯ (10 советов)
    {
        "id": 101,
        "title": "Вы на правильном пути",
        "description": "Вы уже начали отслеживать свою еду. Это самый важный первый шаг! Поздравляем!",
        "icon": "🎉",
        "category": "motivation",
        "priority": "low",
        "condition": "always"
    },
    {
        "id": 102,
        "title": "Последовательность - ключ успеха",
        "description": "Не совершенство, а последовательность приводит к результатам. Делайте маленькие шаги каждый день.",
        "icon": "📈",
        "category": "motivation",
        "priority": "low",
        "condition": "always"
    },
    {
        "id": 103,
        "title": "Ваши результаты видны",
        "description": "Проверьте вкладку 'Аналитика' - вы уже видите прогресс! Продолжайте в том же духе!",
        "icon": "📊",
        "category": "motivation",
        "priority": "low",
        "condition": "always"
    },
    {
        "id": 104,
        "title": "Отдыхайте между тренировками",
        "description": "Мышцы растут во время отдыха, не во время тренировки. Один выходной день в неделю обязателен.",
        "icon": "😌",
        "category": "motivation",
        "priority": "low",
        "condition": "always"
    },
    {
        "id": 105,
        "title": "Вы контролируете свой выбор",
        "description": "Еда не контролирует вас. Вы решаете что, когда и сколько есть. Вы - хозяин своего тела.",
        "icon": "👑",
        "category": "motivation",
        "priority": "low",
        "condition": "always"
    },
    {
        "id": 106,
        "title": "Каждый день - новая возможность",
        "description": "Вчера неважно. Сегодня вы можете сделать всё правильно. Начните прямо сейчас!",
        "icon": "🌅",
        "category": "motivation",
        "priority": "low",
        "condition": "always"
    },
]


def check_condition(condition, user_stats):
    """Проверяет, применим ли совет к пользователю"""
    if condition == "always":
        return True
    
    if condition == "exceeds_calories":
        return user_stats.get('avg_calories', 0) > user_stats.get('target_calories', 2000)
    
    if condition == "low_protein":
        return user_stats.get('avg_protein', 0) < user_stats.get('target_protein', 150) * 0.8
    
    if condition == "low_water":
        water_goal_liters = user_stats.get('water_goal_ml', 2000) / 1000
        return user_stats.get('water_intake', 0) < water_goal_liters * 0.8
    
    return False


def get_priority(condition, user_stats):
    """Вычисляет приоритет совета"""
    if condition == "exceeds_calories":
        excess = user_stats.get('avg_calories', 0) - user_stats.get('target_calories', 2000)
        if excess > 300:
            return "high"
        elif excess > 100:
            return "medium"
        return "low"
    
    if condition == "low_protein":
        shortage = user_stats.get('target_protein', 150) - user_stats.get('avg_protein', 0)
        if shortage > 30:
            return "high"
        elif shortage > 10:
            return "medium"
        return "low"
    
    if condition == "low_water":
        water_goal_liters = user_stats.get('water_goal_ml', 2000) / 1000
        intake = user_stats.get('water_intake', 0)
        if intake < water_goal_liters * 0.5:
            return "high"
        return "medium"
    
    return "low"


@tips_bp.route('get', methods=['GET'])
@jwt_required()
def get_tips():
    """Получить персонализированные советы для пользователя"""
    try:
        user_id = int(get_jwt_identity())
        
        # Получаем данные пользователя
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        # Получаем цели
        goals = UserGoals.query.filter_by(user_id=user_id).first()
        
        # Получаем приёмы пищи за последние 7 дней
        week_ago = datetime.utcnow().date() - timedelta(days=7)
        meals_week = Meal.query.filter(
            Meal.user_id == user_id,
            Meal.meal_date >= week_ago
        ).all()
        
        # Вычисляем средние значения за неделю
        total_cals = sum(m.calories or 0 for m in meals_week)
        total_protein = sum(m.protein or 0 for m in meals_week)
        total_carbs = sum(m.carbs or 0 for m in meals_week)
        total_fats = sum(m.fats or 0 for m in meals_week)
        
        days_with_meals = len(set(m.meal_date for m in meals_week)) or 1
        
        # Вычисляем реальное потребление воды за последние 7 дней
        water_entries = WaterEntry.query.filter(
            WaterEntry.user_id == user_id,
            WaterEntry.date >= week_ago
        ).all()
        total_water_ml = sum(w.amount_ml for w in water_entries)
        days_with_water = len(set(w.date for w in water_entries)) or 1
        avg_water_ml = total_water_ml / days_with_water
        avg_water_liters = avg_water_ml / 1000

        water_goal_ml = goals.water_goal if goals and goals.water_goal else 2000

        user_stats = {
            'avg_calories': total_cals / days_with_meals,
            'avg_protein': total_protein / days_with_meals,
            'avg_carbs': total_carbs / days_with_meals,
            'avg_fats': total_fats / days_with_meals,
            'target_calories': goals.calories_goal if goals else 2000,
            'target_protein': goals.protein_goal if goals else 150,
            'target_carbs': goals.carbs_goal if goals else 200,
            'target_fats': goals.fats_goal if goals else 70,
            'water_intake': avg_water_liters,
            'water_goal_ml': water_goal_ml,
            'avg_water_ml': avg_water_ml,
        }
        
        # Фильтруем советы по условиям
        relevant_tips = []
        for tip in ALL_TIPS:
            if check_condition(tip['condition'], user_stats):
                tip_copy = tip.copy()
                tip_copy['priority'] = get_priority(tip['condition'], user_stats)
                relevant_tips.append(tip_copy)
        
        # Сортируем по приоритету
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        relevant_tips.sort(key=lambda t: priority_order.get(t['priority'], 2))
        
        # Применяем фильтры из query params
        category = request.args.get('category')
        priority = request.args.get('priority')
        search = request.args.get('search', '').lower()
        
        filtered_tips = relevant_tips
        
        if category and category != 'all':
            filtered_tips = [t for t in filtered_tips if t['category'] == category]
        
        if priority and priority != 'all':
            filtered_tips = [t for t in filtered_tips if t['priority'] == priority]
        
        if search:
            filtered_tips = [t for t in filtered_tips if 
                           search in t['title'].lower() or 
                           search in t['description'].lower()]
        
        logger.info(f"[GET /tips] user_id={user_id}, found {len(filtered_tips)} tips")
        
        return jsonify({
            'tips': filtered_tips,
            'count': len(filtered_tips),
            'user_stats': user_stats
        })
    
    except Exception as e:
        logger.error(f"[GET /tips] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка получения советов'}), 500
