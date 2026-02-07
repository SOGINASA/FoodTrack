from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, WaterEntry, UserGoals
from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from utils.validators import parse_date

water_bp = Blueprint('water', __name__)


@water_bp.route('get', methods=['GET'])
@jwt_required()
def get_water():
    """Получить записи воды за указанную дату"""
    try:
        user_id = int(get_jwt_identity())
        date_str = request.args.get('date', datetime.now(timezone.utc).date().isoformat())
        target_date, date_error = parse_date(date_str, max_days_past=365)
        if date_error:
            return jsonify({'error': f'Некорректная дата: {date_error}'}), 400
        if target_date is None:
            target_date = datetime.now(timezone.utc).date()

        entries = WaterEntry.query.filter_by(
            user_id=user_id,
            date=target_date
        ).order_by(WaterEntry.created_at.desc()).all()

        total_ml = sum(e.amount_ml for e in entries)

        goals = UserGoals.query.filter_by(user_id=user_id).first()
        water_goal = goals.water_goal if goals and goals.water_goal else 2000

        return jsonify({
            'entries': [e.to_dict() for e in entries],
            'total_ml': total_ml,
            'goal_ml': water_goal,
            'date': target_date.isoformat()
        })

    except Exception as e:
        print(f"Ошибка получения воды: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500


@water_bp.route('post', methods=['POST'])
@jwt_required()
def add_water():
    """Добавить запись о потреблении воды"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        amount_ml = data.get('amount_ml')
        if not amount_ml or amount_ml <= 0:
            return jsonify({'error': 'Укажите количество воды в мл'}), 400

        date_str = data.get('date', datetime.now(timezone.utc).date().isoformat())
        target_date, date_error = parse_date(date_str, allow_future=False, max_days_past=365)
        if date_error:
            return jsonify({'error': f'Некорректная дата: {date_error}'}), 400
        if target_date is None:
            target_date = datetime.now(timezone.utc).date()

        entry = WaterEntry(
            user_id=user_id,
            amount_ml=amount_ml,
            date=target_date,
            time = (datetime.now() + timedelta(hours=5)).strftime('%H:%M')
        )
        db.session.add(entry)
        db.session.commit()

        # Пересчитываем итого за день
        total_ml = db.session.query(func.sum(WaterEntry.amount_ml)).filter_by(
            user_id=user_id,
            date=target_date
        ).scalar() or 0

        goals = UserGoals.query.filter_by(user_id=user_id).first()
        water_goal = goals.water_goal if goals and goals.water_goal else 2000

        return jsonify({
            'entry': entry.to_dict(),
            'total_ml': total_ml,
            'goal_ml': water_goal
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка добавления воды: {e}")
        return jsonify({'error': 'Ошибка добавления записи'}), 500


@water_bp.route('/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_water(entry_id):
    """Удалить запись о потреблении воды"""
    try:
        user_id = int(get_jwt_identity())

        entry = WaterEntry.query.filter_by(id=entry_id, user_id=user_id).first()
        if not entry:
            return jsonify({'error': 'Запись не найдена'}), 404

        entry_date = entry.date
        db.session.delete(entry)
        db.session.commit()

        # Пересчитываем итого за день
        total_ml = db.session.query(func.sum(WaterEntry.amount_ml)).filter_by(
            user_id=user_id,
            date=entry_date
        ).scalar() or 0

        goals = UserGoals.query.filter_by(user_id=user_id).first()
        water_goal = goals.water_goal if goals and goals.water_goal else 2000

        return jsonify({
            'message': 'Запись удалена',
            'total_ml': total_ml,
            'goal_ml': water_goal
        })

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка удаления записи воды: {e}")
        return jsonify({'error': 'Ошибка удаления записи'}), 500
