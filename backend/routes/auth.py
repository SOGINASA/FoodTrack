from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import db, User, UserGoals
from datetime import datetime, timedelta, timezone
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


def validate_nickname(nickname):
    """Валидация никнейма: 3-20 символов, буквы, цифры, точки, подчёркивания, дефисы"""
    pattern = r'^[a-zA-Z0-9._-]{3,20}$'
    return bool(re.match(pattern, nickname))


def is_email(identifier):
    """Проверяет, является ли identifier email-ом"""
    return '@' in identifier and '.' in identifier

@auth_bp.route('/register', methods=['POST'])
def register():
    """Регистрация пользователя по email или nickname"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Данные не предоставлены'}), 400

    # Поля (email или nickname - хотя бы одно обязательно)
    email = data.get('email', '').strip().lower() if data.get('email') else None
    nickname = data.get('nickname', '').strip() if data.get('nickname') else None
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip() if data.get('full_name') else ''

    # Поддержка identifier (определяем email это или nickname)
    identifier = data.get('identifier', '').strip() if data.get('identifier') else None
    if identifier and not email and not nickname:
        if is_email(identifier):
            email = identifier.lower()
        else:
            nickname = identifier

    # Валидация - нужен хотя бы email или nickname
    if not email and not nickname:
        return jsonify({'error': 'Укажите email или nickname'}), 400

    if not password:
        return jsonify({'error': 'Пароль обязателен'}), 400

    # Валидация email (если указан)
    if email and not validate_email(email):
        return jsonify({'error': 'Неверный формат email'}), 400

    # Валидация nickname (если указан)
    if nickname and not validate_nickname(nickname):
        return jsonify({'error': 'Nickname должен содержать 3-20 символов (буквы, цифры, точки, подчёркивания, дефисы)'}), 400

    # Валидация пароля (минимум 4 символа как на фронте)
    if len(password) < 4:
        return jsonify({'error': 'Пароль должен содержать минимум 4 символа'}), 400

    # Проверка уникальности email
    if email and User.query.filter_by(email=email).first():
        return jsonify({'error': 'Пользователь с таким email уже существует'}), 400

    # Проверка уникальности nickname
    if nickname and User.query.filter(db.func.lower(User.nickname) == nickname.lower()).first():
        return jsonify({'error': 'Пользователь с таким nickname уже существует'}), 400

    try:
        # === СОЗДАЁМ пользователя ===
        user = User(
            email=email,
            nickname=nickname,
            full_name=full_name or nickname or email.split('@')[0] if email else nickname,
            user_type='user',
            is_active=True,
            is_verified=False,
            last_login=datetime.now(timezone.utc)
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
                'nickname': user.nickname,
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
    """Вход пользователя по email, nickname или identifier"""
    data = request.get_json()

    if not data or not data.get('password'):
        return jsonify({'error': 'Заполните все поля'}), 400

    password = data.get('password', '')

    # Поддержка identifier (email или nickname) или отдельных полей
    identifier = data.get('identifier', '').strip().lower() if data.get('identifier') else ''
    email = data.get('email', '').strip().lower() if data.get('email') else ''
    nickname = data.get('nickname', '').strip().lower() if data.get('nickname') else ''

    user = None

    # Если передан identifier - определяем, это email или nickname
    if identifier:
        if is_email(identifier):
            user = User.query.filter_by(email=identifier, is_active=True).first()
        else:
            user = User.query.filter(
                db.func.lower(User.nickname) == identifier,
                User.is_active == True
            ).first()
    # Если передан email напрямую
    elif email:
        user = User.query.filter_by(email=email, is_active=True).first()
    # Если передан nickname напрямую
    elif nickname:
        user = User.query.filter(
            db.func.lower(User.nickname) == nickname,
            User.is_active == True
        ).first()
    else:
        return jsonify({'error': 'Укажите email, nickname или identifier'}), 400

    if not user or not user.check_password(password):
        return jsonify({'error': 'Неверные данные для входа'}), 401

    try:
        # Обновляем время последнего входа
        user.last_login = datetime.now(timezone.utc)
        db.session.commit()

        # Создаем токены
        access_token = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24),
            additional_claims={
                'user_type': user.user_type,
                'email': user.email,
                'nickname': user.nickname,
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
                'nickname': user.nickname,
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

        if 'nickname' in data and data['nickname']:
            new_nickname = data['nickname'].strip()
            if not validate_nickname(new_nickname):
                return jsonify({'error': 'Nickname должен содержать 3-20 символов (буквы, цифры, точки, подчёркивания, дефисы)'}), 400
            # Проверка уникальности (исключая текущего пользователя)
            existing = User.query.filter(
                db.func.lower(User.nickname) == new_nickname.lower(),
                User.id != user.id
            ).first()
            if existing:
                return jsonify({'error': 'Этот nickname уже занят'}), 400
            user.nickname = new_nickname

        # Поля онбординга / физических параметров
        if 'gender' in data:
            user.gender = data['gender']
        if 'birth_year' in data:
            user.birth_year = int(data['birth_year']) if data['birth_year'] else None
        if 'height_cm' in data:
            user.height_cm = int(data['height_cm']) if data['height_cm'] else None
        if 'weight_kg' in data:
            user.weight_kg = float(data['weight_kg']) if data['weight_kg'] else None
        if 'target_weight_kg' in data:
            user.target_weight_kg = float(data['target_weight_kg']) if data['target_weight_kg'] else None
        if 'workouts_per_week' in data:
            user.workouts_per_week = int(data['workouts_per_week']) if data['workouts_per_week'] is not None else 0
        if 'diet' in data:
            user.diet = data['diet']
        if 'diet_notes' in data:
            user.diet_notes = data['diet_notes']
        if 'meals_per_day' in data:
            user.meals_per_day = int(data['meals_per_day']) if data['meals_per_day'] else 3
        if 'health_flags' in data:
            import json
            user.health_flags = json.dumps(data['health_flags']) if data['health_flags'] else None
        if 'health_notes' in data:
            user.health_notes = data['health_notes']

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


@auth_bp.route('/onboarding', methods=['POST'])
@jwt_required()
def complete_onboarding():
    """Сохранение данных онбординга"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)

        if not user or not user.is_active:
            return jsonify({'error': 'Пользователь не найден'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Данные не предоставлены'}), 400

        # Обновляем поля профиля из онбординга
        if 'gender' in data:
            user.gender = data['gender']
        if 'birth_year' in data:
            user.birth_year = int(data['birth_year']) if data['birth_year'] else None
        if 'height_cm' in data:
            user.height_cm = int(data['height_cm']) if data['height_cm'] else None
        if 'weight_kg' in data:
            user.weight_kg = float(data['weight_kg']) if data['weight_kg'] else None
        if 'target_weight_kg' in data:
            user.target_weight_kg = float(data['target_weight_kg']) if data['target_weight_kg'] else None
        if 'workouts_per_week' in data:
            user.workouts_per_week = int(data['workouts_per_week']) if data['workouts_per_week'] else 0
        if 'diet' in data:
            user.diet = data['diet']
        if 'diet_notes' in data:
            user.diet_notes = data['diet_notes']
        if 'meals_per_day' in data:
            user.meals_per_day = int(data['meals_per_day']) if data['meals_per_day'] else 3
        if 'health_flags' in data:
            import json
            user.health_flags = json.dumps(data['health_flags']) if data['health_flags'] else None
        if 'health_notes' in data:
            user.health_notes = data['health_notes']

        # Помечаем онбординг как завершённый
        user.onboarding_completed = True

        db.session.commit()

        return jsonify({
            'message': 'Онбординг завершён',
            'data': {
                'user': user.to_dict(include_sensitive=True)
            }
        })

    except Exception as e:
        db.session.rollback()
        print(f"Ошибка сохранения онбординга: {e}")
        return jsonify({'error': 'Ошибка при сохранении данных'}), 500

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
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
        
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
    
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.now(timezone.utc):
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