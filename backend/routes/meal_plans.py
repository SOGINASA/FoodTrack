from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, MealPlan
from datetime import datetime, timedelta, timezone
from utils.validators import parse_date, parse_date_range
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

meal_plans_bp = Blueprint('meal_plans', __name__)


@meal_plans_bp.route('get', methods=['GET'])
@jwt_required()
def get_meal_plans():
    """Получить план питания пользователя"""
    try:
        user_id = int(get_jwt_identity())

        # Фильтры
        date_str = request.args.get('date')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        meal_type = request.args.get('type')

        logger.info(f"[GET /meal-plans] user_id={user_id}, date={date_str}")

        query = MealPlan.query.filter_by(user_id=user_id)

        if date_str:
            parsed_date, date_error = parse_date(date_str)
            if date_error:
                return jsonify({'error': f'Некорректная дата: {date_error}'}), 400
            if parsed_date:
                query = query.filter(MealPlan.planned_date == parsed_date)
        elif start_date and end_date:
            start_parsed, end_parsed, range_error = parse_date_range(start_date, end_date)
            if range_error:
                return jsonify({'error': range_error}), 400
            if start_parsed and end_parsed:
                query = query.filter(
                    MealPlan.planned_date >= start_parsed,
                    MealPlan.planned_date <= end_parsed
                )

        if meal_type:
            query = query.filter(MealPlan.meal_type == meal_type)

        plans = query.order_by(MealPlan.planned_date.asc(), MealPlan.meal_type).all()

        logger.info(f"[GET /meal-plans] Найдено {len(plans)} записей")

        return jsonify({
            'meal_plans': [plan.to_dict() for plan in plans],
            'count': len(plans)
        })

    except Exception as e:
        logger.error(f"[GET /meal-plans] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка получения данных'}), 500


@meal_plans_bp.route('/<int:plan_id>', methods=['GET'])
@jwt_required()
def get_meal_plan(plan_id):
    """Получить конкретный план питания"""
    try:
        user_id = int(get_jwt_identity())
        plan = MealPlan.query.filter_by(id=plan_id, user_id=user_id).first()

        if not plan:
            return jsonify({'error': 'План не найден'}), 404

        return jsonify({'meal_plan': plan.to_dict()})

    except Exception as e:
        logger.error(f"[GET /meal-plans/{plan_id}] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка получения данных'}), 500


@meal_plans_bp.route('post', methods=['POST'])
@jwt_required()
def create_meal_plan():
    """Добавить рецепт в план питания"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Данные не предоставлены'}), 400

        # Обязательные поля
        if not data.get('recipeId'):
            return jsonify({'error': 'ID рецепта обязателен'}), 400
        if not data.get('name'):
            return jsonify({'error': 'Название рецепта обязательно'}), 400
        if not data.get('date'):
            return jsonify({'error': 'Дата обязательна'}), 400

        planned_date_str = data.get('date')
        planned_date, date_error = parse_date(planned_date_str, required=True, max_days_future=365)
        if date_error:
            return jsonify({'error': f'Некорректная дата: {date_error}'}), 400

        # Определяем тип приёма пищи из категории рецепта
        category = data.get('category', 'snack')
        meal_type_map = {
            'breakfast': 'breakfast',
            'lunch': 'lunch',
            'dinner': 'dinner',
            'snack': 'snack'
        }
        meal_type = data.get('type') or meal_type_map.get(category, 'snack')

        plan = MealPlan(
            user_id=user_id,
            recipe_id=data['recipeId'],
            name=data['name'],
            image_url=data.get('image'),
            meal_type=meal_type,
            planned_date=planned_date,
            calories=data.get('calories', 0),
            protein=data.get('protein', 0),
            carbs=data.get('carbs', 0),
            fats=data.get('fats', 0),
            cooking_time=data.get('time'),
            difficulty=data.get('difficulty'),
            ingredients=json.dumps(data.get('ingredients', [])) if data.get('ingredients') else None,
            steps=json.dumps(data.get('steps', [])) if data.get('steps') else None,
            tags=json.dumps(data.get('tags', [])) if data.get('tags') else None,
        )

        db.session.add(plan)
        db.session.commit()

        logger.info(f"[POST /meal-plans] Создан план: {plan.name} на {plan.planned_date}")

        return jsonify({
            'message': 'Рецепт добавлен в план питания',
            'meal_plan': plan.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"[POST /meal-plans] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка при сохранении'}), 500


@meal_plans_bp.route('/<int:plan_id>', methods=['PUT'])
@jwt_required()
def update_meal_plan(plan_id):
    """Обновить план питания"""
    try:
        user_id = int(get_jwt_identity())
        plan = MealPlan.query.filter_by(id=plan_id, user_id=user_id).first()

        if not plan:
            return jsonify({'error': 'План не найден'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Данные не предоставлены'}), 400

        # Обновляем поля
        if 'date' in data:
            parsed_date, date_error = parse_date(data['date'], max_days_future=365)
            if date_error:
                return jsonify({'error': f'Некорректная дата: {date_error}'}), 400
            if parsed_date:
                plan.planned_date = parsed_date
        if 'type' in data:
            plan.meal_type = data['type']
        if 'isCompleted' in data:
            plan.is_completed = data['isCompleted']

        db.session.commit()

        return jsonify({
            'message': 'План обновлён',
            'meal_plan': plan.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"[PUT /meal-plans/{plan_id}] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка при обновлении'}), 500


@meal_plans_bp.route('/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_meal_plan(plan_id):
    """Удалить план питания"""
    try:
        user_id = int(get_jwt_identity())
        plan = MealPlan.query.filter_by(id=plan_id, user_id=user_id).first()

        if not plan:
            return jsonify({'error': 'План не найден'}), 404

        db.session.delete(plan)
        db.session.commit()

        logger.info(f"[DELETE /meal-plans/{plan_id}] План удалён")

        return jsonify({'message': 'План удалён'})

    except Exception as e:
        db.session.rollback()
        logger.error(f"[DELETE /meal-plans/{plan_id}] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка при удалении'}), 500


@meal_plans_bp.route('/<int:plan_id>/complete', methods=['POST'])
@jwt_required()
def complete_meal_plan(plan_id):
    """Отметить план как выполненный (приготовлено)"""
    try:
        user_id = int(get_jwt_identity())
        plan = MealPlan.query.filter_by(id=plan_id, user_id=user_id).first()

        if not plan:
            return jsonify({'error': 'План не найден'}), 404

        plan.is_completed = not plan.is_completed
        db.session.commit()

        status = 'выполнен' if plan.is_completed else 'не выполнен'
        logger.info(f"[POST /meal-plans/{plan_id}/complete] План {status}")

        return jsonify({
            'message': f'План {status}',
            'meal_plan': plan.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        logger.error(f"[POST /meal-plans/{plan_id}/complete] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка при обновлении'}), 500


@meal_plans_bp.route('/week', methods=['GET'])
@jwt_required()
def get_week_meal_plans():
    """Получить план питания на неделю"""
    try:
        user_id = int(get_jwt_identity())

        # Определяем текущую неделю
        today = datetime.now(timezone.utc).date()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)

        # Можно передать конкретную дату начала недели
        start_date_str = request.args.get('start_date')
        if start_date_str:
            start_of_week, date_error = parse_date(start_date_str)
            if date_error:
                return jsonify({'error': f'Некорректная дата: {date_error}'}), 400
            if start_of_week:
                end_of_week = start_of_week + timedelta(days=6)

        plans = MealPlan.query.filter(
            MealPlan.user_id == user_id,
            MealPlan.planned_date >= start_of_week,
            MealPlan.planned_date <= end_of_week
        ).order_by(MealPlan.planned_date.asc(), MealPlan.meal_type).all()

        # Группируем по дням
        week_plans = {}
        for i in range(7):
            day = start_of_week + timedelta(days=i)
            week_plans[day.isoformat()] = []

        for plan in plans:
            day_key = plan.planned_date.isoformat()
            if day_key in week_plans:
                week_plans[day_key].append(plan.to_dict())

        return jsonify({
            'week_plans': week_plans,
            'start_date': start_of_week.isoformat(),
            'end_date': end_of_week.isoformat(),
            'total_count': len(plans)
        })

    except Exception as e:
        logger.error(f"[GET /meal-plans/week] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка получения данных'}), 500
