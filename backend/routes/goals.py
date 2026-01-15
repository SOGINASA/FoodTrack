from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, UserGoals, WeightEntry
from datetime import datetime, date, timedelta

goals_bp = Blueprint('goals', __name__)


@goals_bp.route('', methods=['GET'])
@jwt_required()
def get_goals():
    """Получить цели пользователя"""
    try:
        user_id = int(get_jwt_identity())
        goals = UserGoals.query.filter_by(user_id=user_id).first()

        if not goals:
            # Создаём цели по умолчанию
            goals = UserGoals(user_id=user_id)
            db.session.add(goals)
            db.session.commit()

        return jsonify({'goals': goals.to_dict()})

    except Exception as e:
        print(f"Ошибка получения целей: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500


@goals_bp.route('', methods=['PUT'])
@jwt_required()
def update_goals():
    """Обновить цели пользователя"""
    try:
        user_id = int(get_jwt_identity())
        goals = UserGoals.query.filter_by(user_id=user_id).first()

        if not goals:
            goals = UserGoals(user_id=user_id)
            db.session.add(goals)

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Данные не предоставлены'}), 400

        # Обновляем поля
        if 'calories_goal' in data:
            goals.calories_goal = data['calories_goal']
        if 'protein_goal' in data:
            goals.protein_goal = data['protein_goal']
        if 'carbs_goal' in data:
            goals.carbs_goal = data['carbs_goal']
        if 'fats_goal' in data:
            goals.fats_goal = data['fats_goal']
        if 'target_weight' in data:
            goals.target_weight = data['target_weight']
        if 'activity_level' in data:
            goals.activity_level = data['activity_level']
        if 'goal_type' in data:
            goals.goal_type = data['goal_type']
        if 'diet_type' in data:
            goals.diet_type = data['diet_type']

        db.session.commit()

        return jsonify({
            'message': 'Цели обновлены',
            'goals': goals.to_dict()
        })

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка обновления целей: {e}")
        return jsonify({'error': 'Ошибка при обновлении'}), 500


# === Трекинг веса ===

@goals_bp.route('/weight', methods=['GET'])
@jwt_required()
def get_weight_history():
    """Получить историю веса"""
    try:
        user_id = int(get_jwt_identity())

        # Параметры фильтрации
        days = request.args.get('days', 30, type=int)
        start_date = date.today() - timedelta(days=days)

        entries = WeightEntry.query.filter(
            WeightEntry.user_id == user_id,
            WeightEntry.date >= start_date
        ).order_by(WeightEntry.date.desc()).all()

        # Статистика
        if entries:
            weights = [e.weight for e in entries]
            stats = {
                'current': weights[0],
                'min': min(weights),
                'max': max(weights),
                'avg': round(sum(weights) / len(weights), 1),
                'change': round(weights[0] - weights[-1], 1) if len(weights) > 1 else 0
            }
        else:
            stats = None

        return jsonify({
            'entries': [e.to_dict() for e in entries],
            'stats': stats,
            'count': len(entries)
        })

    except Exception as e:
        print(f"Ошибка получения истории веса: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500


@goals_bp.route('/weight', methods=['POST'])
@jwt_required()
def add_weight():
    """Добавить запись веса"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data or not data.get('weight'):
            return jsonify({'error': 'Вес обязателен'}), 400

        entry_date = data.get('date', date.today().isoformat())
        if isinstance(entry_date, str):
            entry_date = datetime.strptime(entry_date, '%Y-%m-%d').date()

        # Проверяем, есть ли уже запись на эту дату
        existing = WeightEntry.query.filter_by(
            user_id=user_id,
            date=entry_date
        ).first()

        if existing:
            # Обновляем существующую запись
            existing.weight = data['weight']
            existing.notes = data.get('notes')
            entry = existing
        else:
            # Создаём новую
            entry = WeightEntry(
                user_id=user_id,
                weight=data['weight'],
                date=entry_date,
                notes=data.get('notes')
            )
            db.session.add(entry)

        db.session.commit()

        return jsonify({
            'message': 'Вес сохранён',
            'entry': entry.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка добавления веса: {e}")
        return jsonify({'error': 'Ошибка при сохранении'}), 500


@goals_bp.route('/weight/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_weight(entry_id):
    """Удалить запись веса"""
    try:
        user_id = int(get_jwt_identity())
        entry = WeightEntry.query.filter_by(id=entry_id, user_id=user_id).first()

        if not entry:
            return jsonify({'error': 'Запись не найдена'}), 404

        db.session.delete(entry)
        db.session.commit()

        return jsonify({'message': 'Запись удалена'})

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка удаления записи веса: {e}")
        return jsonify({'error': 'Ошибка при удалении'}), 500