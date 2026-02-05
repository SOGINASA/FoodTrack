import math
from datetime import datetime, date, timedelta, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.push_service import create_and_push_notification
from models import db, User, FridgeProduct, ProductShareRequest
import json

fridge_bp = Blueprint('fridge', __name__)


# ==================== CRUD продуктов ====================

@fridge_bp.route('get', methods=['GET'])
@jwt_required()
def get_products():
    """Получить все продукты в холодильнике текущего пользователя"""
    user_id = int(get_jwt_identity())

    products = FridgeProduct.query.filter_by(user_id=user_id) \
        .order_by(FridgeProduct.created_at.desc()).all()

    return jsonify([p.to_dict() for p in products])


@fridge_bp.route('post', methods=['POST'])
@jwt_required()
def add_product():
    """Добавить продукт в холодильник"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data or not data.get('name'):
        return jsonify({'error': 'Название продукта обязательно'}), 400

    expiry_date = None
    if data.get('expiryDate'):
        try:
            expiry_date = date.fromisoformat(data['expiryDate'])
        except ValueError:
            return jsonify({'error': 'Неверный формат даты'}), 400

    product = FridgeProduct(
        user_id=user_id,
        name=data['name'].strip(),
        quantity=float(data.get('quantity', 1)),
        unit=data.get('unit', 'шт'),
        category=data.get('category', 'other'),
        expiry_date=expiry_date,
        notes=data.get('notes', '').strip() or None,
    )

    db.session.add(product)
    db.session.commit()

    return jsonify(product.to_dict()), 201


@fridge_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    """Обновить продукт в холодильнике"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    product = FridgeProduct.query.get(product_id)
    if not product:
        return jsonify({'error': 'Продукт не найден'}), 404
    if product.user_id != user_id:
        return jsonify({'error': 'Нет доступа'}), 403

    if data.get('name'):
        product.name = data['name'].strip()
    if 'quantity' in data:
        product.quantity = float(data['quantity'])
    if 'unit' in data:
        product.unit = data['unit']
    if 'category' in data:
        product.category = data['category']
    if 'expiryDate' in data:
        if data['expiryDate']:
            try:
                product.expiry_date = date.fromisoformat(data['expiryDate'])
            except ValueError:
                return jsonify({'error': 'Неверный формат даты'}), 400
        else:
            product.expiry_date = None
    if 'notes' in data:
        product.notes = data['notes'].strip() or None

    db.session.commit()

    return jsonify(product.to_dict())


@fridge_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    """Удалить продукт из холодильника"""
    user_id = int(get_jwt_identity())

    product = FridgeProduct.query.get(product_id)
    if not product:
        return jsonify({'error': 'Продукт не найден'}), 404
    if product.user_id != user_id:
        return jsonify({'error': 'Нет доступа'}), 403

    db.session.delete(product)
    db.session.commit()

    return jsonify({'message': 'Продукт удалён'})


@fridge_bp.route('/expiring-soon', methods=['GET'])
@jwt_required()
def get_expiring_soon():
    """Получить продукты с истекающим сроком годности"""
    user_id = int(get_jwt_identity())
    days = int(request.args.get('days', 7))

    deadline = datetime.now(timezone.utc).date() + timedelta(days=days)

    products = FridgeProduct.query.filter(
        FridgeProduct.user_id == user_id,
        FridgeProduct.expiry_date != None,
        FridgeProduct.expiry_date <= deadline,
        FridgeProduct.expiry_date >= datetime.now(timezone.utc).date(),
    ).order_by(FridgeProduct.expiry_date).all()

    return jsonify([p.to_dict() for p in products])


# ==================== Геолокация и nearby ====================

def haversine(lat1, lon1, lat2, lon2):
    """Расстояние между двумя точками на сфере (в метрах)"""
    R = 6371000  # радиус Земли в метрах
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)

    a = math.sin(dphi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


@fridge_bp.route('/update-location', methods=['POST'])
@jwt_required()
def update_location():
    """Обновить геолокацию пользователя"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    lat = data.get('lat')
    lng = data.get('lng')

    if lat is None or lng is None:
        return jsonify({'error': 'lat и lng обязательны'}), 400

    user = User.query.get(user_id)
    user.latitude = float(lat)
    user.longitude = float(lng)
    user.location_updated_at = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify({'message': 'Геолокация обновлена'})


@fridge_bp.route('/nearby-users', methods=['GET'])
@jwt_required()
def get_nearby_users():
    """Получить пользователей в заданном радиусе (по умолчанию 1 км)"""
    user_id = int(get_jwt_identity())
    radius = float(request.args.get('radius', 1000))  # метры
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)

    if lat is None or lng is None:
        return jsonify({'error': 'Передайте lat и lng'}), 400

    # Обновляем свою геолокацию
    current_user = User.query.get(user_id)
    current_user.latitude = lat
    current_user.longitude = lng
    current_user.location_updated_at = datetime.now(timezone.utc)
    db.session.commit()

    # Грубый bbox-фильтр (~0.01° ≈ 1.1 км)
    delta = radius / 111000  # переводим метры в градусы (грубо)
    candidates = User.query.filter(
        User.id != user_id,
        User.is_active == True,
        User.latitude != None,
        User.longitude != None,
        User.latitude.between(lat - delta, lat + delta),
        User.longitude.between(lng - delta, lng + delta),
    ).all()

    nearby = []
    for u in candidates:
        dist = haversine(lat, lng, u.latitude, u.longitude)
        if dist <= radius:
            nearby.append({
                'id': u.id,
                'name': u.full_name or u.nickname or 'Пользователь',
                'location': {
                    'lat': u.latitude,
                    'lng': u.longitude,
                },
                'distance': round(dist),
            })

    nearby.sort(key=lambda x: x['distance'])
    return jsonify(nearby)


# ==================== Sharing продуктов ====================

@fridge_bp.route('/share/send', methods=['POST'])
@jwt_required()
def send_share_request():
    """Отправить запрос на передачу продуктов"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    recipient_id = data.get('recipientId')
    product_ids = data.get('productIds', [])
    sender_location = data.get('senderLocation')

    if not recipient_id:
        return jsonify({'error': 'recipientId обязателен'}), 400
    if not product_ids:
        return jsonify({'error': 'Выберите хотя бы один продукт'}), 400

    recipient_id_int = int(recipient_id)

    if recipient_id_int == user_id:
        return jsonify({'error': 'Нельзя отправить запрос самому себе'}), 400

    recipient = User.query.get(recipient_id_int)
    if not recipient or not recipient.is_active:
        return jsonify({'error': 'Получатель не найден'}), 404

    # Собираем данные о выбранных продуктах
    products = FridgeProduct.query.filter(
        FridgeProduct.id.in_(product_ids),
        FridgeProduct.user_id == user_id,
    ).all()

    if not products:
        return jsonify({'error': 'Продукты не найдены'}), 404

    sender = User.query.get(user_id)
    sender_name = sender.full_name or sender.nickname or 'Пользователь'

    products_data = [
        {'id': p.id, 'name': p.name, 'quantity': p.quantity, 'unit': p.unit}
        for p in products
    ]

    share_req = ProductShareRequest(
        sender_id=user_id,
        recipient_id=recipient_id_int,
        products_json=json.dumps(products_data, ensure_ascii=False),
        sender_lat=sender_location.get('lat') if sender_location else None,
        sender_lng=sender_location.get('lng') if sender_location else None,
    )

    db.session.add(share_req)
    db.session.commit()

    try:
        product_names = ', '.join(p['name'] for p in products_data[:3])
        if len(products_data) > 3:
            product_names += f' и ещё {len(products_data) - 3}'
        create_and_push_notification(
            user_id=recipient_id_int,
            title='Запрос на передачу продуктов',
            body=f'{sender_name} хочет передать вам: {product_names}',
            category='fridge',
            related_type='share_request',
            related_id=share_req.id,
        )
    except Exception as e:
        print(f"[Notification error] fridge share to user {recipient_id}: {e}")

    return jsonify(share_req.to_dict()), 201


@fridge_bp.route('/share/requests', methods=['GET'])
@jwt_required()
def get_share_requests():
    """Получить входящие запросы на получение продуктов"""
    user_id = int(get_jwt_identity())

    requests_list = ProductShareRequest.query.filter_by(
        recipient_id=user_id,
        status='pending',
    ).order_by(ProductShareRequest.created_at.desc()).all()

    return jsonify([r.to_dict() for r in requests_list])


@fridge_bp.route('/share/accept/<int:request_id>', methods=['POST'])
@jwt_required()
def accept_share_request(request_id):
    """Принять запрос — продукты добавляются в холодильник получателя"""
    user_id = int(get_jwt_identity())

    share_req = ProductShareRequest.query.get(request_id)
    if not share_req:
        return jsonify({'error': 'Запрос не найден'}), 404
    if share_req.recipient_id != user_id:
        return jsonify({'error': 'Нет доступа'}), 403
    if share_req.status != 'pending':
        return jsonify({'error': 'Запрос уже обработан'}), 400

    share_req.status = 'accepted'

    # Добавляем продукты в холодильник получателя
    products_data = json.loads(share_req.products_json) if share_req.products_json else []
    new_products = [
        FridgeProduct(
            user_id=user_id,
            name=p['name'],
            quantity=float(p.get('quantity', 1)),
            unit=p.get('unit', 'шт'),
            category='other',
        )
        for p in products_data
    ]
    db.session.add_all(new_products)

    # Удаляем продукты из холодильника отправителя
    original_ids = [p['id'] for p in products_data if 'id' in p]
    if original_ids:
        FridgeProduct.query.filter(
            FridgeProduct.id.in_(original_ids),
            FridgeProduct.user_id == share_req.sender_id,
        ).delete(synchronize_session=False)

    db.session.commit()

    return jsonify(share_req.to_dict())


@fridge_bp.route('/share/reject/<int:request_id>', methods=['POST'])
@jwt_required()
def reject_share_request(request_id):
    """Отклонить запрос на получение продуктов"""
    user_id = int(get_jwt_identity())

    share_req = ProductShareRequest.query.get(request_id)
    if not share_req:
        return jsonify({'error': 'Запрос не найден'}), 404
    if share_req.recipient_id != user_id:
        return jsonify({'error': 'Нет доступа'}), 403
    if share_req.status != 'pending':
        return jsonify({'error': 'Запрос уже обработан'}), 400

    share_req.status = 'rejected'
    db.session.commit()

    return jsonify(share_req.to_dict())
