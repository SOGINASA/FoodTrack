"""Auth Logger - структурированное логирование операций с аутентификацией"""

import json
import uuid
import traceback
from datetime import datetime, timedelta, timezone
from flask import request
from models import db, AuditLog
from utils.request_helpers import get_request_context, get_client_ip


class AuthLogger:
    """Структурированное логирование для auth операций"""
    
    def __init__(self):
        pass
    
    def log_action(self, user_id=None, action=None, action_type=None, status='success',
                   oauth_provider=None, error_message=None, error_details=None,
                   duration_ms=None, request_context=None):
        """
        Логировать действие в БД
        
        Args:
            user_id: ID пользователя (может быть None)
            action: Тип действия (REGISTER_EMAIL, LOGIN_FAILED, etc.)
            action_type: Категория (auth, profile, oauth, etc.)
            status: 'success' или 'failure'
            oauth_provider: 'google', 'github', 'apple' или None
            error_message: Сообщение об ошибке
            error_details: Полный stacktrace (для failure)
            duration_ms: Длительность операции
            request_context: Контекст запроса (IP, User-Agent, etc.)
        """
        try:
            if request_context is None:
                try:
                    request_context = get_request_context(request)
                except Exception:
                    request_context = {
                        'ip_address': '0.0.0.0',
                        'user_agent': 'Unknown',
                        'device_type': 'Unknown',
                        'browser': 'Unknown',
                        'os': 'Unknown',
                    }
            
            log = AuditLog(
                user_id=user_id,
                action=action,
                action_type=action_type,
                status=status,
                ip_address=request_context.get('ip_address'),
                user_agent=request_context.get('user_agent'),
                device_type=request_context.get('device_type'),
                browser=request_context.get('browser'),
                os=request_context.get('os'),
                oauth_provider=oauth_provider,
                error_code=None,
                error_message=error_message,
                error_details=error_details,
                session_id=self._get_or_create_session_id(),
                request_id=str(uuid.uuid4()),
                duration_ms=duration_ms,
            )
            
            db.session.add(log)
            db.session.commit()
            
            return log.request_id
            
        except Exception as e:
            db.session.rollback()
            print(f"[LOGGER ERROR] Failed to log action: {str(e)}")
            return None
    
    def log_register(self, user, method='email', oauth_provider=None, 
                    success=True, error=None, error_details=None, duration_ms=None):
        """Логирование регистрации"""
        action = 'REGISTER_OAUTH' if method == 'oauth' else 'REGISTER_EMAIL'
        
        return self.log_action(
            user_id=user.id if user else None,
            action=action,
            action_type='auth',
            status='success' if success else 'failure',
            oauth_provider=oauth_provider,
            error_message=error,
            error_details=error_details,
            duration_ms=duration_ms,
            request_context=get_request_context(request)
        )
    
    def log_login(self, user, method='email', oauth_provider=None,
                 success=True, error=None, error_details=None, duration_ms=None):
        """Логирование входа"""
        action = 'LOGIN_OAUTH' if method == 'oauth' else 'LOGIN_EMAIL'
        if not success:
            action = 'LOGIN_FAILED'
        
        return self.log_action(
            user_id=user.id if user else None,
            action=action,
            action_type='auth',
            status='success' if success else 'failure',
            oauth_provider=oauth_provider,
            error_message=error,
            error_details=error_details,
            duration_ms=duration_ms,
            request_context=get_request_context(request)
        )
    
    def log_password_change(self, user, success=True, error=None):
        """Логирование смены пароля"""
        return self.log_action(
            user_id=user.id,
            action='PASSWORD_CHANGE',
            action_type='auth',
            status='success' if success else 'failure',
            error_message=error,
            request_context=get_request_context(request)
        )
    
    def log_oauth_link(self, user, provider, success=True, error=None):
        """Логирование привязки OAuth"""
        action = 'OAUTH_LINK' if success else 'OAUTH_LINK_FAILED'
        
        return self.log_action(
            user_id=user.id,
            action=action,
            action_type='oauth',
            status='success' if success else 'failure',
            oauth_provider=provider,
            error_message=error,
            request_context=get_request_context(request)
        )
    
    def count_failed_attempts(self, ip, minutes=10):
        """Подсчитать неудачные попытки входа с IP за последние N минут"""
        since = datetime.now(timezone.utc) - timedelta(minutes=minutes)
        
        count = AuditLog.query.filter(
            AuditLog.ip_address == ip,
            AuditLog.action == 'LOGIN_FAILED',
            AuditLog.created_at >= since
        ).count()
        
        return count
    
    def is_new_device(self, user, ip, request_obj):
        """Проверить, новое ли устройство для пользователя"""
        device_info = get_request_context(request_obj)
        
        # Ищем успешный логин с этого же браузера/OS/IP
        existing = AuditLog.query.filter(
            AuditLog.user_id == user.id,
            AuditLog.action.in_(['LOGIN_EMAIL', 'LOGIN_OAUTH']),
            AuditLog.status == 'success',
            AuditLog.browser == device_info['browser'],
            AuditLog.os == device_info['os'],
            AuditLog.ip_address == device_info['ip_address']
        ).first()
        
        return existing is None
    
    def _get_or_create_session_id(self):
        """Получить или создать session ID из cookies"""
        try:
            session_id = request.cookies.get('session_id')
            if not session_id:
                session_id = str(uuid.uuid4())
            return session_id
        except Exception:
            return str(uuid.uuid4())


# Глобальный экземпляр для использования во всем приложении
auth_logger = AuthLogger()
