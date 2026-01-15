from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Meal, MealIngredient
from datetime import datetime, date
import json
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

meals_bp = Blueprint('meals', __name__)


@meals_bp.route('', methods=['GET'])
@jwt_required()
def get_meals():
    """Получить приёмы пищи пользователя"""
    try:
        user_id = int(get_jwt_identity())
        
        # Фильтр по дате
        date_str = request.args.get('date')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        meal_type = request.args.get('type')

        logger.info(f"[GET /meals] user_id={user_id}, date={date_str}, meal_type={meal_type}")

        query = Meal.query.filter_by(user_id=user_id)

        if date_str:
            query = query.filter(Meal.meal_date == datetime.strptime(date_str, '%Y-%m-%d').date())
        elif start_date and end_date:
            query = query.filter(
                Meal.meal_date >= datetime.strptime(start_date, '%Y-%m-%d').date(),
                Meal.meal_date <= datetime.strptime(end_date, '%Y-%m-%d').date()
            )

        if meal_type:
            query = query.filter(Meal.meal_type == meal_type)

        meals = query.order_by(Meal.meal_date.desc(), Meal.meal_time.desc()).all()

        logger.info(f"[GET /meals] Найдено {len(meals)} приёмов пищи")

        return jsonify({
            'meals': [meal.to_dict() for meal in meals],
            'count': len(meals)
        })

    except Exception as e:
        logger.error(f"[GET /meals] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка получения данных'}), 500


@meals_bp.route('/<int:meal_id>', methods=['GET'])
@jwt_required()
def get_meal(meal_id):
    """Получить конкретный приём пищи"""
    try:
        user_id = int(get_jwt_identity())
        meal = Meal.query.filter_by(id=meal_id, user_id=user_id).first()

        if not meal:
            return jsonify({'error': 'Приём пищи не найден'}), 404

        return jsonify({'meal': meal.to_dict()})

    except Exception as e:
        print(f"Ошибка получения приёма пищи: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500


@meals_bp.route('', methods=['POST'])
@jwt_required()
def create_meal():
    """Создать новый приём пищи"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Данные не предоставлены'}), 400

        # Обязательные поля
        if not data.get('name'):
            return jsonify({'error': 'Название блюда обязательно'}), 400

        meal_date = data.get('date', date.today().isoformat())
        if isinstance(meal_date, str):
            meal_date = datetime.strptime(meal_date, '%Y-%m-%d').date()

        meal = Meal(
            user_id=user_id,
            name=data['name'],
            meal_type=data.get('type', 'snack'),
            meal_date=meal_date,
            meal_time=data.get('time'),
            calories=data.get('calories', 0),
            protein=data.get('protein', 0),
            carbs=data.get('carbs', 0),
            fats=data.get('fats', 0),
            portions=data.get('portions', 1),
            image_url=data.get('image'),
            ai_confidence=data.get('ai_confidence'),
            health_score=data.get('health_score'),
            ai_advice=data.get('ai_advice'),
            tags=json.dumps(data.get('tags', [])) if data.get('tags') else None
        )

        db.session.add(meal)
        db.session.flush()

        # Добавляем ингредиенты если есть
        ingredients = data.get('ingredients', [])
        for ing_data in ingredients:
            ingredient = MealIngredient(
                meal_id=meal.id,
                name=ing_data.get('name', ''),
                amount=ing_data.get('amount'),
                calories=ing_data.get('calories', 0),
                protein=ing_data.get('protein', 0),
                carbs=ing_data.get('carbs', 0),
                fats=ing_data.get('fats', 0)
            )
            db.session.add(ingredient)

        db.session.commit()

        return jsonify({
            'message': 'Приём пищи добавлен',
            'meal': meal.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка создания приёма пищи: {e}")
        return jsonify({'error': 'Ошибка при сохранении'}), 500


@meals_bp.route('/<int:meal_id>', methods=['PUT'])
@jwt_required()
def update_meal(meal_id):
    """Обновить приём пищи"""
    try:
        user_id = int(get_jwt_identity())
        meal = Meal.query.filter_by(id=meal_id, user_id=user_id).first()

        if not meal:
            return jsonify({'error': 'Приём пищи не найден'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Данные не предоставлены'}), 400

        # Обновляем поля
        if 'name' in data:
            meal.name = data['name']
        if 'type' in data:
            meal.meal_type = data['type']
        if 'date' in data:
            meal.meal_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if 'time' in data:
            meal.meal_time = data['time']
        if 'calories' in data:
            meal.calories = data['calories']
        if 'protein' in data:
            meal.protein = data['protein']
        if 'carbs' in data:
            meal.carbs = data['carbs']
        if 'fats' in data:
            meal.fats = data['fats']
        if 'portions' in data:
            meal.portions = data['portions']
        if 'image' in data:
            meal.image_url = data['image']
        if 'tags' in data:
            meal.tags = json.dumps(data['tags'])

        # Обновляем ингредиенты если переданы
        if 'ingredients' in data:
            # Удаляем старые ингредиенты
            MealIngredient.query.filter_by(meal_id=meal.id).delete()

            # Добавляем новые
            for ing_data in data['ingredients']:
                ingredient = MealIngredient(
                    meal_id=meal.id,
                    name=ing_data.get('name', ''),
                    amount=ing_data.get('amount'),
                    calories=ing_data.get('calories', 0),
                    protein=ing_data.get('protein', 0),
                    carbs=ing_data.get('carbs', 0),
                    fats=ing_data.get('fats', 0)
                )
                db.session.add(ingredient)

        db.session.commit()

        return jsonify({
            'message': 'Приём пищи обновлён',
            'meal': meal.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка обновления приёма пищи: {e}")
        return jsonify({'error': 'Ошибка при обновлении'}), 500


@meals_bp.route('/<int:meal_id>', methods=['DELETE'])
@jwt_required()
def delete_meal(meal_id):
    """Удалить приём пищи"""
    try:
        user_id = int(get_jwt_identity())
        meal = Meal.query.filter_by(id=meal_id, user_id=user_id).first()

        if not meal:
            return jsonify({'error': 'Приём пищи не найден'}), 404

        db.session.delete(meal)
        db.session.commit()

        return jsonify({'message': 'Приём пищи удалён'})

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка удаления приёма пищи: {e}")
        return jsonify({'error': 'Ошибка при удалении'}), 500


@meals_bp.route('/<int:meal_id>/copy', methods=['POST'])
@jwt_required()
def copy_meal(meal_id):
    """Копировать приём пищи"""
    try:
        user_id = int(get_jwt_identity())
        original = Meal.query.filter_by(id=meal_id, user_id=user_id).first()

        if not original:
            return jsonify({'error': 'Приём пищи не найден'}), 404

        data = request.get_json() or {}

        # Создаём копию
        copy = Meal(
            user_id=user_id,
            name=original.name,
            meal_type=data.get('type', original.meal_type),
            meal_date=datetime.strptime(data['date'], '%Y-%m-%d').date() if data.get('date') else date.today(),
            meal_time=data.get('time', original.meal_time),
            calories=original.calories,
            protein=original.protein,
            carbs=original.carbs,
            fats=original.fats,
            portions=original.portions,
            image_url=original.image_url,
            ai_confidence=original.ai_confidence,
            health_score=original.health_score,
            ai_advice=original.ai_advice,
            tags=original.tags
        )

        db.session.add(copy)
        db.session.flush()

        # Копируем ингредиенты
        for ing in original.ingredients:
            new_ing = MealIngredient(
                meal_id=copy.id,
                name=ing.name,
                amount=ing.amount,
                calories=ing.calories,
                protein=ing.protein,
                carbs=ing.carbs,
                fats=ing.fats
            )
            db.session.add(new_ing)

        db.session.commit()

        return jsonify({
            'message': 'Приём пищи скопирован',
            'meal': copy.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка копирования приёма пищи: {e}")
        return jsonify({'error': 'Ошибка при копировании'}), 500


@meals_bp.route('/today', methods=['GET'])
@jwt_required()
def get_today_meals():
    """Получить приёмы пищи за сегодня"""
    try:
        user_id = int(get_jwt_identity())
        today = date.today()

        logger.info(f"[GET /meals/today] user_id={user_id}, date={today}")

        meals = Meal.query.filter_by(
            user_id=user_id,
            meal_date=today
        ).order_by(Meal.meal_time.desc()).all()

        logger.info(f"[GET /meals/today] Найдено {len(meals)} приёмов пищи за сегодня")

        # Подсчёт итогов
        totals = {
            'calories': sum(m.calories for m in meals),
            'protein': sum(m.protein for m in meals),
            'carbs': sum(m.carbs for m in meals),
            'fats': sum(m.fats for m in meals),
            'meals_count': len(meals)
        }

        return jsonify({
            'meals': [meal.to_dict() for meal in meals],
            'totals': totals,
            'date': today.isoformat()
        })

    except Exception as e:
        print(f"Ошибка получения приёмов пищи за сегодня: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500