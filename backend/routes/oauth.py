"""OAuth Routes - endpoints для OAuth авторизации"""

from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import db, User, UserGoals
from services.oauth_service import get_oauth_service
from services.auth_logger import auth_logger
from datetime import datetime, timedelta
import secrets
import time

oauth_bp = Blueprint('oauth', __name__)

# Store state tokens (в продакшене использовать Redis)
_state_tokens = {}


@oauth_bp.route('/start/<provider>', methods=['GET'])
def oauth_start(provider):
    """Начало OAuth flow - генерируем state и возвращаем redirect URL"""
    try:
        # Проверяем, поддерживается ли провайдер
        if provider not in ['google', 'github']:
            return jsonify({'error': f'Unsupported provider: {provider}'}), 400
        
        # Генерируем state для CSRF защиты
        state = secrets.token_urlsafe(32)
        _state_tokens[state] = {
            'created_at': datetime.utcnow(),
            'ttl': 600  # 10 минут
        }
        
        # Получаем URL авторизации
        auth_url = get_oauth_service().get_authorization_url(provider, state)
        
        return jsonify({
            'redirect_url': auth_url,
            'state': state
        }), 200
        
    except Exception as e:
        print(f"[ERROR] OAuth start error: {str(e)}")
        return jsonify({'error': str(e)}), 400


@oauth_bp.route('/callback/<provider>', methods=['GET'])
def oauth_callback(provider):
    """OAuth callback - обмен кода на токены и создание/вход пользователя"""
    start_time = time.time()
    
    try:
        code = request.args.get('code')
        state = request.args.get('state')
        error = request.args.get('error')
        
        if error:
            return jsonify({'error': f'OAuth error: {error}'}), 400
        
        if not code or not state:
            return jsonify({'error': 'Missing code or state'}), 400
        
        # Проверяем state (отключено для production с несколькими инстансами)
        # if state not in _state_tokens:
        #     return jsonify({'error': 'Invalid or expired state'}), 400
        # 
        # state_data = _state_tokens[state]
        # if (datetime.utcnow() - state_data['created_at']).seconds > state_data['ttl']:
        #     del _state_tokens[state]
        #     return jsonify({'error': 'State token expired'}), 400
        # 
        # del _state_tokens[state]
        
        # Обмениваем код на токены
        token_response = get_oauth_service().exchange_code(provider, code)
        access_token = token_response.get('access_token')
        
        # Получаем информацию о пользователе
        oauth_user = get_oauth_service().get_user_info(provider, access_token)
        
        # Ищем пользователя в БД
        user = User.query.filter(
            User.oauth_provider == provider,
            User.oauth_id == oauth_user['id']
        ).first()
        
        is_new_user = False
        
        if user:
            # Существующий пользователь - логируем вход
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            auth_logger.log_login(
                user=user,
                method='oauth',
                oauth_provider=provider,
                success=True,
                duration_ms=int((time.time() - start_time) * 1000)
            )
        else:
            # Новый пользователь - создаем аккаунт
            name = oauth_user.get('name') or oauth_user.get('login') or ''
            email = oauth_user.get('email') or f"{oauth_user.get('login', oauth_user['id'])}@{provider}.oauth"
            email_part = (email or '').split('@')[0] if email else ''
            
            user = User(
                email=email,
                nickname=(name or email_part or '').replace(' ', '_').lower() or oauth_user['id'],
                full_name=name or email_part or oauth_user['id'],
                oauth_provider=provider,
                oauth_id=oauth_user['id'],
                oauth_access_token=access_token,
                oauth_token_expires=datetime.utcnow() + timedelta(days=365),
                user_type='user',
                is_active=True,
                is_verified=True,  # OAuth провайдеры верифицируют
                email_verified_at=datetime.utcnow(),
                last_login=datetime.utcnow()
            )
            
            # Генерируем уникальный nickname если занят
            base_nickname = user.nickname
            counter = 1
            while User.query.filter(db.func.lower(User.nickname) == user.nickname.lower()).first():
                user.nickname = f"{base_nickname}_{counter}"
                counter += 1
            
            db.session.add(user)
            db.session.flush()
            
            # Создаем цели по умолчанию
            goals = UserGoals(user_id=user.id)
            db.session.add(goals)
            db.session.commit()
            
            is_new_user = True
            
            auth_logger.log_register(
                user=user,
                method='oauth',
                oauth_provider=provider,
                success=True,
                duration_ms=int((time.time() - start_time) * 1000)
            )
        
        # Создаем JWT токены
        access_token_jwt = create_access_token(
            identity=str(user.id),
            expires_delta=timedelta(hours=24),
            additional_claims={
                'user_type': user.user_type,
                'email': user.email,
                'nickname': user.nickname,
                'full_name': user.full_name
            }
        )
        
        refresh_token_jwt = create_refresh_token(identity=str(user.id))
        
        # Перенаправляем на фронтенд с токенами в URL параметрах
        from urllib.parse import urlencode
        import json
        from flask import redirect
        
        # Подготавливаем данные для фронтенда
        callback_params = {
            'access_token': access_token_jwt,
            'refresh_token': refresh_token_jwt,
            'user': json.dumps(user.to_dict(include_sensitive=True)),
            'is_new_user': 'true' if is_new_user else 'false'
        }
        
        frontend_callback_url = f"https://food-track-beta.vercel.app/oauth/callback?{urlencode(callback_params)}"
        
        # Возвращаем редирект на фронтенд
        return redirect(frontend_callback_url), 302
        
    except Exception as e:
        import traceback
        
        auth_logger.log_login(
            user=None,
            method='oauth',
            oauth_provider=provider,
            success=False,
            error=str(e),
            error_details=traceback.format_exc()
        )
        
        print(f"[ERROR] OAuth callback error: {str(e)}")
        return jsonify({'error': 'OAuth callback failed'}), 400


@oauth_bp.route('/link/<provider>', methods=['POST'])
@jwt_required()
def oauth_link(provider):
    """Привязать OAuth провайдера к существующему аккаунту"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        code = data.get('code')
        state = data.get('state')
        
        if not code or not state:
            return jsonify({'error': 'Missing code or state'}), 400
        
        # Проверяем state
        if state not in _state_tokens:
            return jsonify({'error': 'Invalid state'}), 400
        
        del _state_tokens[state]
        
        # Обмениваем код на токены
        token_response = get_oauth_service().exchange_code(provider, code)
        access_token = token_response.get('access_token')
        
        # Получаем информацию о пользователе
        oauth_user = get_oauth_service().get_user_info(provider, access_token)
        
        # Проверяем, не привязан ли этот OAuth ID к другому пользователю
        existing = User.query.filter(
            User.oauth_provider == provider,
            User.oauth_id == oauth_user['id'],
            User.id != user_id
        ).first()
        
        if existing:
            auth_logger.log_oauth_link(user, provider, success=False, 
                                      error="This OAuth account is already linked")
            return jsonify({'error': 'This OAuth account is already linked to another user'}), 400
        
        # Привязываем OAuth к текущему пользователю
        user.oauth_provider = provider
        user.oauth_id = oauth_user['id']
        user.oauth_access_token = access_token
        user.oauth_token_expires = datetime.utcnow() + timedelta(days=365)
        user.oauth_linked_at = datetime.utcnow()
        
        db.session.commit()
        
        auth_logger.log_oauth_link(user, provider, success=True)
        
        return jsonify({
            'message': f'{provider.capitalize()} account linked successfully',
            'oauth_accounts': [{
                'provider': user.oauth_provider,
                'linked_at': user.oauth_linked_at.isoformat() if user.oauth_linked_at else None
            }]
        }), 200
        
    except Exception as e:
        db.session.rollback()
        
        auth_logger.log_oauth_link(user, provider, success=False, error=str(e))
        
        print(f"[ERROR] OAuth link error: {str(e)}")
        return jsonify({'error': 'Failed to link OAuth account'}), 400


@oauth_bp.route('/unlink/<provider>', methods=['DELETE'])
@jwt_required()
def oauth_unlink(provider):
    """Отвязать OAuth провайдера"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.oauth_provider != provider:
            return jsonify({'error': f'This provider is not linked'}), 400
        
        # Проверяем, есть ли пароль (не может удалить OAuth если нет пароля)
        # password_hash должна быть обязательна для всех пользователей
        if not user.password_hash or user.password_hash == 'local':
            return jsonify({'error': 'Cannot unlink OAuth if you don\'t have a password set'}), 400
        
        # Отвязываем
        user.oauth_provider = None
        user.oauth_id = None
        user.oauth_access_token = None
        user.oauth_refresh_token = None
        user.oauth_token_expires = None
        
        db.session.commit()
        
        auth_logger.log_action(
            user_id=user_id,
            action='OAUTH_UNLINK',
            action_type='oauth',
            status='success',
            oauth_provider=provider
        )
        
        return jsonify({'message': f'{provider.capitalize()} account unlinked'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] OAuth unlink error: {str(e)}")
        return jsonify({'error': 'Failed to unlink OAuth account'}), 400


@oauth_bp.route('/accounts', methods=['GET'])
@jwt_required()
def get_oauth_accounts():
    """Получить список привязанных OAuth аккаунтов"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        oauth_accounts = []
        if user.oauth_provider:
            oauth_accounts.append({
                'provider': user.oauth_provider,
                'linked_at': user.oauth_linked_at.isoformat() if user.oauth_linked_at else None,
                'email': user.email
            })
        
        return jsonify({
            'oauth_accounts': oauth_accounts,
            'has_password': user.password_hash and user.password_hash != 'local'
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Get OAuth accounts error: {str(e)}")
        return jsonify({'error': str(e)}), 400
