from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Friendship
from sqlalchemy import or_, and_

friends_bp = Blueprint('friends', __name__)


@friends_bp.route('/request', methods=['POST'])
@jwt_required()
def send_friend_request():
    """Отправить запрос в друзья"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get('userId'):
        return jsonify({'error': 'ID пользователя обязателен'}), 400

    addressee_id = int(data['userId'])

    # Нельзя добавить самого себя
    if user_id == addressee_id:
        return jsonify({'error': 'Нельзя отправить запрос самому себе'}), 400

    # Проверяем, существует ли адресат
    addressee = User.query.get(addressee_id)
    if not addressee or not addressee.is_active:
        return jsonify({'error': 'Пользователь не найден'}), 404

    # Проверяем существующие запросы в обе стороны
    existing = Friendship.query.filter(
        or_(
            and_(Friendship.requester_id == user_id, Friendship.addressee_id == addressee_id),
            and_(Friendship.requester_id == addressee_id, Friendship.addressee_id == user_id)
        )
    ).first()

    if existing:
        if existing.status == 'accepted':
            return jsonify({'error': 'Вы уже друзья'}), 400
        if existing.status == 'pending':
            # Если встречный запрос — автоматически принимаем
            if existing.requester_id == addressee_id:
                existing.status = 'accepted'
                db.session.commit()
                return jsonify(existing.to_dict())
            return jsonify({'error': 'Запрос уже отправлен'}), 400
        if existing.status == 'rejected':
            # Разрешаем повторный запрос после отклонения
            existing.requester_id = user_id
            existing.addressee_id = addressee_id
            existing.status = 'pending'
            db.session.commit()
            return jsonify(existing.to_dict()), 201
        if existing.status == 'blocked':
            return jsonify({'error': 'Невозможно отправить запрос'}), 400

    friendship = Friendship(
        requester_id=user_id,
        addressee_id=addressee_id,
        status='pending'
    )
    db.session.add(friendship)
    db.session.commit()

    return jsonify(friendship.to_dict()), 201


@friends_bp.route('/accept/<int:friendship_id>', methods=['POST'])
@jwt_required()
def accept_friend_request(friendship_id):
    """Принять запрос в друзья"""
    user_id = int(get_jwt_identity())

    friendship = Friendship.query.get(friendship_id)
    if not friendship:
        return jsonify({'error': 'Запрос не найден'}), 404

    # Только адресат может принять запрос
    if friendship.addressee_id != user_id:
        return jsonify({'error': 'Нет прав для принятия запроса'}), 403

    if friendship.status != 'pending':
        return jsonify({'error': 'Запрос уже обработан'}), 400

    friendship.status = 'accepted'
    db.session.commit()

    return jsonify(friendship.to_dict())


@friends_bp.route('/reject/<int:friendship_id>', methods=['POST'])
@jwt_required()
def reject_friend_request(friendship_id):
    """Отклонить запрос в друзья"""
    user_id = int(get_jwt_identity())

    friendship = Friendship.query.get(friendship_id)
    if not friendship:
        return jsonify({'error': 'Запрос не найден'}), 404

    # Только адресат может отклонить запрос
    if friendship.addressee_id != user_id:
        return jsonify({'error': 'Нет прав для отклонения запроса'}), 403

    if friendship.status != 'pending':
        return jsonify({'error': 'Запрос уже обработан'}), 400

    friendship.status = 'rejected'
    db.session.commit()

    return jsonify(friendship.to_dict())


@friends_bp.route('/<int:friendship_id>', methods=['DELETE'])
@jwt_required()
def remove_friend(friendship_id):
    """Удалить друга или отменить запрос"""
    user_id = int(get_jwt_identity())

    friendship = Friendship.query.get(friendship_id)
    if not friendship:
        return jsonify({'error': 'Запись не найдена'}), 404

    # Любая из сторон может удалить дружбу или отменить запрос
    if friendship.requester_id != user_id and friendship.addressee_id != user_id:
        return jsonify({'error': 'Нет прав для удаления'}), 403

    db.session.delete(friendship)
    db.session.commit()

    return jsonify({'message': 'Запись удалена'})


@friends_bp.route('get', methods=['GET'])
@jwt_required()
def get_friends():
    """Получить список друзей"""
    user_id = int(get_jwt_identity())

    friendships = Friendship.query.filter(
        or_(
            Friendship.requester_id == user_id,
            Friendship.addressee_id == user_id
        ),
        Friendship.status == 'accepted'
    ).all()

    # Формируем список друзей (другая сторона дружбы)
    friends = []
    for f in friendships:
        friend_user = f.addressee if f.requester_id == user_id else f.requester
        friends.append({
            'friendshipId': f.id,
            'userId': friend_user.id,
            'nickname': friend_user.nickname,
            'fullName': friend_user.full_name,
            'avatar': None,
            'since': f.updated_at.isoformat() if f.updated_at else f.created_at.isoformat(),
        })

    return jsonify(friends)


@friends_bp.route('/requests/incoming', methods=['GET'])
@jwt_required()
def get_incoming_requests():
    """Получить входящие запросы в друзья"""
    user_id = int(get_jwt_identity())

    requests_list = Friendship.query.filter_by(
        addressee_id=user_id,
        status='pending'
    ).order_by(Friendship.created_at.desc()).all()

    return jsonify([r.to_dict() for r in requests_list])


@friends_bp.route('/requests/outgoing', methods=['GET'])
@jwt_required()
def get_outgoing_requests():
    """Получить исходящие запросы в друзья"""
    user_id = int(get_jwt_identity())

    requests_list = Friendship.query.filter_by(
        requester_id=user_id,
        status='pending'
    ).order_by(Friendship.created_at.desc()).all()

    return jsonify([r.to_dict() for r in requests_list])


@friends_bp.route('/search', methods=['GET'])
@jwt_required()
def search_users():
    """Поиск пользователей для добавления в друзья"""
    user_id = int(get_jwt_identity())
    query = request.args.get('q', '').strip()

    if not query or len(query) < 2:
        return jsonify([])

    # Ищем по nickname и full_name
    search_pattern = f'%{query}%'
    users = User.query.filter(
        User.id != user_id,
        User.is_active == True,
        or_(
            User.nickname.ilike(search_pattern),
            User.full_name.ilike(search_pattern)
        )
    ).limit(20).all()

    # Получаем ID пользователей, с которыми уже есть связь
    existing = Friendship.query.filter(
        or_(
            Friendship.requester_id == user_id,
            Friendship.addressee_id == user_id
        ),
        Friendship.status.in_(['pending', 'accepted'])
    ).all()

    connected_ids = set()
    for f in existing:
        if f.requester_id == user_id:
            connected_ids.add(f.addressee_id)
        else:
            connected_ids.add(f.requester_id)

    results = []
    for u in users:
        if u.id not in connected_ids:
            results.append({
                'id': u.id,
                'nickname': u.nickname,
                'fullName': u.full_name,
                'avatar': None,
            })

    return jsonify(results)


@friends_bp.route('/status/<int:target_user_id>', methods=['GET'])
@jwt_required()
def get_friendship_status(target_user_id):
    """Получить статус дружбы с конкретным пользователем"""
    user_id = int(get_jwt_identity())

    if user_id == target_user_id:
        return jsonify({'status': 'self'})

    friendship = Friendship.query.filter(
        or_(
            and_(Friendship.requester_id == user_id, Friendship.addressee_id == target_user_id),
            and_(Friendship.requester_id == target_user_id, Friendship.addressee_id == user_id)
        )
    ).first()

    if not friendship:
        return jsonify({'status': 'none', 'friendshipId': None})

    return jsonify({
        'status': friendship.status,
        'friendshipId': friendship.id,
        'isRequester': friendship.requester_id == user_id,
    })
