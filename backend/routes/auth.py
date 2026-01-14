from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import db, User, UserGoals
from datetime import datetime, timedelta
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    """Валидация email"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone):
    """Валидация номера телефона (Казахстан)"""
    # Убираем все кроме цифр
    clean_phone = re.sub(r'\D', '', phone)
    
    # Казахстанские номера: +7 7XX XXX XXXX или 8 7XX XXX XXXX
    if len(clean_phone) == 11 and clean_phone.startswith('7'):
        return True
    elif len(clean_phone) == 11 and clean_phone.startswith('87'):
        return True
    
    return False

@auth_bp.route('/register', methods=['POST'])
def register():
    """Регистрация пользователя"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Данные не предоставлены'}), 400

    # Обязательные поля
    email = data.get('email', '').strip().lower() if data.get('email') else ''
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip() if data.get('full_name') else ''

    # Валидация обязательных полей
    if not email or not password or not full_name:
        return jsonify({'error': 'Заполните все обязательные поля'}), 400

    # Валидация email
    if not validate_email(email):
        return jsonify({'error': 'Неверный формат email'}), 400
    
    # Валидация пароля
    if len(password) < 6:
        return jsonify({'error': 'Пароль должен содержать минимум 6 символов'}), 400
    
    # Проверка уникальности email
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Пользователь с таким email уже существует'}), 400

    try:
        # === СОЗДАЁМ пользователя ===
        user = User(
            email=email,
            full_name=full_name,
            user_type='user',
            is_active=True,
            is_verified=False,
            last_login=datetime.utcnow()
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()  # чтобы получить user.id
        
        # === Создаём цели по умолчанию ===
        goals = UserGoals(user_id=user.id)
        db.session.add(goals)
     
        # === Токены ===
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24),
            additional_claims={
                'user_type': user.user_type,
                'email': user.email,
                'full_name': user.full_name
            }
        )
        refresh_token = create_refresh_token(identity=str(user.id))

        db.session.commit()

        # === Ответ ===
        user_data = user.to_dict(include_sensitive=True)

        return jsonify({
            'user': user_data,
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка регистрации: {e}")
        return jsonify({'error': 'Ошибка при создании аккаунта'}), 500



@auth_bp.route('/login', methods=['POST'])
def login():
    """Вход пользователя"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Заполните все поля'}), 400
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    user = User.query.filter_by(email=email, is_active=True).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Неверный email или пароль'}), 401
    
    try:
        # Обновляем время последнего входа
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Создаем токены
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24),
            additional_claims={
                'user_type': user.user_type,
                'email': user.email,
                'full_name': user.full_name
            }
        )
        
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'user': user.to_dict(include_sensitive=True),
            'access_token': access_token,
            'refresh_token': refresh_token
        })
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка входа: {e}")
        return jsonify({'error': 'Ошибка при входе'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Обновление токена"""
    try:
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        new_access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24),
            additional_claims={
                'user_type': user.user_type,
                'email': user.email,
                'full_name': user.full_name
            }
        )
        
        return jsonify({
            'access_token': new_access_token,
            'message': 'Токен обновлен'
        })
    
    except Exception as e:
        print(f"Ошибка обновления токена: {e}")
        return jsonify({'error': 'Ошибка обновления токена'}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Получить данные текущего пользователя"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        return jsonify({
            'data': {
                'user': user.to_dict(include_sensitive=True)
            }
        })
    
    except Exception as e:
        print(f"Ошибка получения пользователя: {e}")
        return jsonify({'error': 'Ошибка получения данных пользователя'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Обновление профиля пользователя"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Данные не предоставлены'}), 400

        # Обновляем допустимые поля профиля
        if 'full_name' in data and data['full_name']:
            user.full_name = data['full_name'].strip()

        db.session.commit()
        
        return jsonify({
            'data': {
                'user': user.to_dict(include_sensitive=True)
            }
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка обновления профиля: {e}")
        return jsonify({'error': 'Ошибка при обновлении профиля'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Смена пароля"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user or not user.is_active:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        data = request.get_json()
        if not data or not data.get('current_password') or not data.get('new_password'):
            return jsonify({'error': 'Необходимы текущий и новый пароль'}), 400
        
        # Проверяем текущий пароль
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Неверный текущий пароль'}), 400
        
        # Валидация нового пароля
        if len(data['new_password']) < 6:
            return jsonify({'error': 'Новый пароль должен содержать минимум 6 символов'}), 400
        
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Пароль успешно изменен'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка смены пароля: {e}")
        return jsonify({'error': 'Ошибка при смене пароля'}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Восстановление пароля"""
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({'error': 'Email обязателен'}), 400
    
    user = User.query.filter_by(email=data['email'].lower(), is_active=True).first()
    
    if not user:
        # Не сообщаем о том, что пользователь не найден (безопасность)
        return jsonify({'message': 'Если пользователь с таким email существует, инструкции отправлены на почту'})
    
    try:
        # Генерируем токен сброса
        import secrets
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        
        db.session.commit()
        
        # Здесь должна быть отправка email с токеном сброса
        # TODO: Реализовать отправку email
        
        return jsonify({'message': 'Инструкции отправлены на почту'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка восстановления пароля: {e}")
        return jsonify({'error': 'Ошибка при отправке инструкций'}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Сброс пароля по токену"""
    data = request.get_json()
    
    if not data or not data.get('token') or not data.get('password'):
        return jsonify({'error': 'Токен и новый пароль обязательны'}), 400
    
    user = User.query.filter_by(reset_token=data['token']).first()
    
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        return jsonify({'error': 'Недействительный или истекший токен'}), 400
    
    # Валидация нового пароля
    if len(data['password']) < 6:
        return jsonify({'error': 'Пароль должен содержать минимум 6 символов'}), 400
    
    try:
        user.set_password(data['password'])
        user.reset_token = None
        user.reset_token_expires = None
        
        db.session.commit()
        
        return jsonify({'message': 'Пароль успешно изменен'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка сброса пароля: {e}")
        return jsonify({'error': 'Ошибка при смене пароля'}), 500

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Верификация email"""
    data = request.get_json()
    
    if not data or not data.get('token'):
        return jsonify({'error': 'Токен верификации обязателен'}), 400
    
    user = User.query.filter_by(verification_token=data['token']).first()
    
    if not user:
        return jsonify({'error': 'Недействительный токен верификации'}), 400
    
    try:
        user.is_verified = True
        user.verification_token = None
        
        db.session.commit()
        
        return jsonify({'message': 'Email успешно подтвержден'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка верификации email: {e}")
        return jsonify({'error': 'Ошибка при подтверждении email'}), 500

@auth_bp.route('/deactivate', methods=['POST'])
@jwt_required()
def deactivate_account():
    """Деактивация аккаунта"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        data = request.get_json()
        if not data or not data.get('password'):
            return jsonify({'error': 'Подтверждение паролем обязательно'}), 400
        
        if not user.check_password(data['password']):
            return jsonify({'error': 'Неверный пароль'}), 400
        
        user.is_active = False
        db.session.commit()
        
        return jsonify({'message': 'Аккаунт деактивирован'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка деактивации аккаунта: {e}")
        return jsonify({'error': 'Ошибка при деактивации аккаунта'}), 500
    
    
@auth_bp.route('/deactivate', methods=['DELETE'])
@jwt_required()
def delete_account():
    """Удаление аккаунта"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'Аккаунт удален'})
    
    except Exception as e:
        db.session.rollback()
        print(f"Ошибка удаления аккаунта: {e}")
        return jsonify({'error': 'Ошибка при удалении аккаунта'}), 500