from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from models import db, Notification, NotificationPreference, PushSubscription
from services.push_service import create_and_push_notification

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('/get', methods=['GET'])
@jwt_required()
def get_notifications():
    """Получить историю уведомлений (с пагинацией)"""
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    query = Notification.query.filter_by(user_id=user_id) \
        .order_by(Notification.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'notifications': [n.to_dict() for n in pagination.items],
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
        'hasMore': pagination.has_next,
    })


@notifications_bp.route('/unread-count', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Количество непрочитанных уведомлений"""
    user_id = int(get_jwt_identity())
    count = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    return jsonify({'count': count})


@notifications_bp.route('/read/<int:notification_id>', methods=['POST'])
@jwt_required()
def mark_as_read(notification_id):
    """Отметить уведомление прочитанным"""
    user_id = int(get_jwt_identity())
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()

    if not notification:
        return jsonify({'error': 'Уведомление не найдено'}), 404

    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({'message': 'Отмечено прочитанным'})


@notifications_bp.route('/read-all', methods=['POST'])
@jwt_required()
def mark_all_as_read():
    """Отметить все уведомления прочитанными"""
    user_id = int(get_jwt_identity())
    now = datetime.now(timezone.utc)

    Notification.query.filter_by(user_id=user_id, is_read=False).update({
        'is_read': True,
        'read_at': now,
    })
    db.session.commit()

    return jsonify({'message': 'Все уведомления прочитаны'})


@notifications_bp.route('/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    """Удалить уведомление"""
    user_id = int(get_jwt_identity())
    notification = Notification.query.filter_by(id=notification_id, user_id=user_id).first()

    if not notification:
        return jsonify({'error': 'Уведомление не найдено'}), 404

    db.session.delete(notification)
    db.session.commit()

    return jsonify({'message': 'Уведомление удалено'})


@notifications_bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_preferences():
    """Получить настройки уведомлений"""
    user_id = int(get_jwt_identity())
    prefs = NotificationPreference.query.filter_by(user_id=user_id).first()

    if not prefs:
        prefs = NotificationPreference(user_id=user_id)
        db.session.add(prefs)
        db.session.commit()

    return jsonify({'preferences': prefs.to_dict()})


@notifications_bp.route('/preferences', methods=['PUT'])
@jwt_required()
def save_preferences():
    """Сохранить настройки уведомлений"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    prefs = NotificationPreference.query.filter_by(user_id=user_id).first()
    if not prefs:
        prefs = NotificationPreference(user_id=user_id)
        db.session.add(prefs)

    if 'mealReminders' in data:
        prefs.meal_reminders = data['mealReminders']
    if 'waterReminders' in data:
        prefs.water_reminders = data['waterReminders']
    if 'progressUpdates' in data:
        prefs.progress_updates = data['progressUpdates']
    if 'groupActivity' in data:
        prefs.group_activity = data['groupActivity']
    if 'weeklyReports' in data:
        prefs.weekly_reports = data['weeklyReports']
    if 'breakfastTime' in data:
        prefs.breakfast_time = data['breakfastTime']
    if 'lunchTime' in data:
        prefs.lunch_time = data['lunchTime']
    if 'dinnerTime' in data:
        prefs.dinner_time = data['dinnerTime']
    if 'pushEnabled' in data:
        prefs.push_enabled = data['pushEnabled']

    db.session.commit()

    return jsonify({'message': 'Настройки сохранены', 'preferences': prefs.to_dict()})


@notifications_bp.route('/subscribe', methods=['POST'])
@jwt_required()
def subscribe_push():
    """Сохранить push-подписку браузера"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    endpoint = data.get('endpoint')
    keys = data.get('keys', {})
    p256dh = keys.get('p256dh')
    auth = keys.get('auth')

    if not all([endpoint, p256dh, auth]):
        return jsonify({'error': 'Неполные данные подписки'}), 400

    existing = PushSubscription.query.filter_by(endpoint=endpoint).first()
    if existing:
        existing.user_id = user_id
        existing.p256dh_key = p256dh
        existing.auth_key = auth
        existing.user_agent = request.headers.get('User-Agent', '')
    else:
        sub = PushSubscription(
            user_id=user_id,
            endpoint=endpoint,
            p256dh_key=p256dh,
            auth_key=auth,
            user_agent=request.headers.get('User-Agent', ''),
        )
        db.session.add(sub)

    prefs = NotificationPreference.query.filter_by(user_id=user_id).first()
    if not prefs:
        prefs = NotificationPreference(user_id=user_id, push_enabled=True)
        db.session.add(prefs)
    else:
        prefs.push_enabled = True

    db.session.commit()
    return jsonify({'message': 'Подписка сохранена'}), 201


@notifications_bp.route('/unsubscribe', methods=['DELETE'])
@jwt_required()
def unsubscribe_push():
    """Удалить push-подписку текущего устройства"""
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    endpoint = data.get('endpoint')

    if endpoint:
        PushSubscription.query.filter_by(user_id=user_id, endpoint=endpoint).delete()
    else:
        PushSubscription.query.filter_by(user_id=user_id).delete()

    remaining = PushSubscription.query.filter_by(user_id=user_id).count()
    if remaining == 0:
        prefs = NotificationPreference.query.filter_by(user_id=user_id).first()
        if prefs:
            prefs.push_enabled = False

    db.session.commit()
    return jsonify({'message': 'Подписка удалена'})


@notifications_bp.route('/vapid-key', methods=['GET'])
def get_vapid_key():
    """Получить VAPID публичный ключ (без авторизации)"""
    return jsonify({
        'publicKey': current_app.config['VAPID_PUBLIC_KEY']
    })


@notifications_bp.route('/test', methods=['POST'])
@jwt_required()
def send_test_notification():
    """Отправить тестовое уведомление (для отладки)"""
    user_id = int(get_jwt_identity())

    # Диагностика
    prefs = NotificationPreference.query.filter_by(user_id=user_id).first()
    subs = PushSubscription.query.filter_by(user_id=user_id).all()
    vapid_set = bool(current_app.config.get('VAPID_PRIVATE_KEY'))

    notification = create_and_push_notification(
        user_id=user_id,
        title='Тестовое уведомление',
        body='Push-уведомления работают!',
        category='system',
    )

    return jsonify({
        'message': 'Тестовое уведомление отправлено',
        'notification': notification.to_dict(),
        'debug': {
            'vapid_configured': vapid_set,
            'push_enabled': prefs.push_enabled if prefs else False,
            'subscriptions_count': len(subs),
            'is_pushed': notification.is_pushed,
        },
    })
