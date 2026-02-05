from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Measurement, ProgressPhoto
from datetime import datetime, timezone

progress_bp = Blueprint('progress', __name__)


# === Замеры тела ===

@progress_bp.route('/measurements', methods=['GET'])
@jwt_required()
def get_measurements():
    """Получить историю замеров"""
    try:
        user_id = int(get_jwt_identity())

        entries = Measurement.query.filter_by(user_id=user_id)\
            .order_by(Measurement.date.desc()).all()

        return jsonify({
            'measurements': [e.to_dict() for e in entries],
            'count': len(entries)
        })

    except Exception as e:
        print(f"Ошибка получения замеров: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500


@progress_bp.route('/measurements', methods=['POST'])
@jwt_required()
def add_measurement():
    """Добавить замеры"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Данные не предоставлены'}), 400

        entry_date = data.get('date', datetime.now(timezone.utc).date().isoformat())
        if isinstance(entry_date, str):
            entry_date = datetime.strptime(entry_date, '%Y-%m-%d').date()

        # Проверяем, есть ли уже запись на эту дату
        existing = Measurement.query.filter_by(
            user_id=user_id,
            date=entry_date
        ).first()

        if existing:
            # Обновляем существующую
            if 'chest' in data:
                existing.chest = data['chest']
            if 'waist' in data:
                existing.waist = data['waist']
            if 'hips' in data:
                existing.hips = data['hips']
            if 'biceps' in data:
                existing.biceps = data['biceps']
            if 'thigh' in data:
                existing.thigh = data['thigh']
            if 'neck' in data:
                existing.neck = data['neck']
            if 'notes' in data:
                existing.notes = data['notes']
            entry = existing
        else:
            # Создаём новую
            entry = Measurement(
                user_id=user_id,
                date=entry_date,
                chest=data.get('chest'),
                waist=data.get('waist'),
                hips=data.get('hips'),
                biceps=data.get('biceps'),
                thigh=data.get('thigh'),
                neck=data.get('neck'),
                notes=data.get('notes')
            )
            db.session.add(entry)

        db.session.commit()

        return jsonify({
            'message': 'Замеры сохранены',
            'measurement': entry.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка добавления замеров: {e}")
        return jsonify({'error': 'Ошибка при сохранении'}), 500


@progress_bp.route('/measurements/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_measurement(entry_id):
    """Удалить запись замеров"""
    try:
        user_id = int(get_jwt_identity())
        entry = Measurement.query.filter_by(id=entry_id, user_id=user_id).first()

        if not entry:
            return jsonify({'error': 'Запись не найдена'}), 404

        db.session.delete(entry)
        db.session.commit()

        return jsonify({'message': 'Запись удалена'})

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка удаления замеров: {e}")
        return jsonify({'error': 'Ошибка при удалении'}), 500


# === Фото прогресса ===

@progress_bp.route('/photos', methods=['GET'])
@jwt_required()
def get_photos():
    """Получить фото прогресса"""
    try:
        user_id = int(get_jwt_identity())

        photos = ProgressPhoto.query.filter_by(user_id=user_id)\
            .order_by(ProgressPhoto.date.desc()).all()

        return jsonify({
            'photos': [p.to_dict() for p in photos],
            'count': len(photos)
        })

    except Exception as e:
        print(f"Ошибка получения фото: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500


@progress_bp.route('/photos', methods=['POST'])
@jwt_required()
def add_photo():
    """Добавить фото прогресса"""
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data or not data.get('image_url'):
            return jsonify({'error': 'URL изображения обязателен'}), 400

        entry_date = data.get('date', datetime.now(timezone.utc).date().isoformat())
        if isinstance(entry_date, str):
            entry_date = datetime.strptime(entry_date, '%Y-%m-%d').date()

        photo = ProgressPhoto(
            user_id=user_id,
            date=entry_date,
            image_url=data['image_url'],
            category=data.get('category', 'front'),
            notes=data.get('notes')
        )
        db.session.add(photo)
        db.session.commit()

        return jsonify({
            'message': 'Фото добавлено',
            'photo': photo.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка добавления фото: {e}")
        return jsonify({'error': 'Ошибка при сохранении'}), 500


@progress_bp.route('/photos/<int:photo_id>', methods=['DELETE'])
@jwt_required()
def delete_photo(photo_id):
    """Удалить фото прогресса"""
    try:
        user_id = int(get_jwt_identity())
        photo = ProgressPhoto.query.filter_by(id=photo_id, user_id=user_id).first()

        if not photo:
            return jsonify({'error': 'Фото не найдено'}), 404

        db.session.delete(photo)
        db.session.commit()

        return jsonify({'message': 'Фото удалено'})

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка удаления фото: {e}")
        return jsonify({'error': 'Ошибка при удалении'}), 500
