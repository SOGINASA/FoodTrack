"""
Тесты аутентификации: регистрация, вход, смена пароля, онбординг, деактивация.
"""
import json
import pytest
from models import db, User, UserGoals


# ==================== Регистрация ====================

class TestRegister:

    def test_register_by_email(self, client):
        resp = client.post('/api/auth/register', json={
            'email': 'new@test.com',
            'password': 'pass1234',
            'full_name': 'New User',
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert 'access_token' in data
        assert 'refresh_token' in data
        assert data['user']['email'] == 'new@test.com'

    def test_register_by_nickname(self, client):
        resp = client.post('/api/auth/register', json={
            'nickname': 'newuser',
            'password': 'pass1234',
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data['user']['nickname'] == 'newuser'

    def test_register_by_identifier_email(self, client):
        resp = client.post('/api/auth/register', json={
            'identifier': 'ident@test.com',
            'password': 'pass1234',
        })
        assert resp.status_code == 201
        assert resp.get_json()['user']['email'] == 'ident@test.com'

    def test_register_by_identifier_nickname(self, client):
        resp = client.post('/api/auth/register', json={
            'identifier': 'identnick',
            'password': 'pass1234',
        })
        assert resp.status_code == 201
        assert resp.get_json()['user']['nickname'] == 'identnick'

    def test_register_creates_default_goals(self, client, app):
        client.post('/api/auth/register', json={
            'email': 'goals@test.com',
            'password': 'pass1234',
        })
        with app.app_context():
            user = User.query.filter_by(email='goals@test.com').first()
            goals = UserGoals.query.filter_by(user_id=user.id).first()
            assert goals is not None
            assert goals.calories_goal == 2500

    def test_register_no_data(self, client):
        resp = client.post('/api/auth/register',
                           data='', content_type='application/json')
        assert resp.status_code == 400

    def test_register_no_email_no_nickname(self, client):
        resp = client.post('/api/auth/register', json={'password': 'pass1234'})
        assert resp.status_code == 400

    def test_register_no_password(self, client):
        resp = client.post('/api/auth/register', json={'email': 'a@b.com'})
        assert resp.status_code == 400

    def test_register_invalid_email(self, client):
        resp = client.post('/api/auth/register', json={
            'email': 'notanemail',
            'password': 'pass1234',
        })
        assert resp.status_code == 400

    def test_register_invalid_nickname(self, client):
        resp = client.post('/api/auth/register', json={
            'nickname': 'ab',  # < 3 символов
            'password': 'pass1234',
        })
        assert resp.status_code == 400

    def test_register_short_password(self, client):
        resp = client.post('/api/auth/register', json={
            'email': 'short@test.com',
            'password': '123',
        })
        assert resp.status_code == 400

    def test_register_duplicate_email(self, client, user1):
        resp = client.post('/api/auth/register', json={
            'email': 'user1@test.com',
            'password': 'pass1234',
        })
        assert resp.status_code == 400
        assert 'уже существует' in resp.get_json()['error']

    def test_register_duplicate_nickname(self, client, user1):
        resp = client.post('/api/auth/register', json={
            'nickname': 'user1',
            'password': 'pass1234',
        })
        assert resp.status_code == 400
        assert 'уже существует' in resp.get_json()['error']


# ==================== Логин ====================

class TestLogin:

    def test_login_by_email(self, client, user1):
        resp = client.post('/api/auth/login', json={
            'email': 'user1@test.com',
            'password': 'test1234',
        })
        assert resp.status_code == 200
        data = resp.get_json()
        assert 'access_token' in data
        assert data['user']['email'] == 'user1@test.com'

    def test_login_by_nickname(self, client, user1):
        resp = client.post('/api/auth/login', json={
            'nickname': 'user1',
            'password': 'test1234',
        })
        assert resp.status_code == 200

    def test_login_by_identifier_email(self, client, user1):
        resp = client.post('/api/auth/login', json={
            'identifier': 'user1@test.com',
            'password': 'test1234',
        })
        assert resp.status_code == 200

    def test_login_by_identifier_nickname(self, client, user1):
        resp = client.post('/api/auth/login', json={
            'identifier': 'user1',
            'password': 'test1234',
        })
        assert resp.status_code == 200

    def test_login_wrong_password(self, client, user1):
        resp = client.post('/api/auth/login', json={
            'email': 'user1@test.com',
            'password': 'wrongpass',
        })
        assert resp.status_code == 401

    def test_login_nonexistent_user(self, client):
        resp = client.post('/api/auth/login', json={
            'email': 'nobody@test.com',
            'password': 'pass1234',
        })
        assert resp.status_code == 401

    def test_login_no_password(self, client):
        resp = client.post('/api/auth/login', json={
            'email': 'user1@test.com',
        })
        assert resp.status_code == 400

    def test_login_no_identifier(self, client):
        resp = client.post('/api/auth/login', json={
            'password': 'pass1234',
        })
        assert resp.status_code == 400

    def test_login_inactive_user(self, client, app, user1):
        with app.app_context():
            user1.is_active = False
            db.session.commit()

        resp = client.post('/api/auth/login', json={
            'email': 'user1@test.com',
            'password': 'test1234',
        })
        assert resp.status_code == 401


# ==================== Token refresh ====================

class TestTokenRefresh:

    def test_refresh_token(self, client, refresh_headers):
        resp = client.post('/api/auth/refresh', headers=refresh_headers)
        assert resp.status_code == 200
        assert 'access_token' in resp.get_json()

    def test_refresh_without_token(self, client):
        resp = client.post('/api/auth/refresh')
        assert resp.status_code == 401


# ==================== /me ====================

class TestGetCurrentUser:

    def test_get_current_user(self, client, auth_headers):
        resp = client.get('/api/auth/me', headers=auth_headers)
        assert resp.status_code == 200
        user = resp.get_json()['data']['user']
        assert user['email'] == 'user1@test.com'

    def test_get_current_user_no_auth(self, client):
        resp = client.get('/api/auth/me')
        assert resp.status_code == 401


# ==================== Обновление профиля ====================

class TestUpdateProfile:

    def test_update_full_name(self, client, auth_headers):
        resp = client.put('/api/auth/profile', headers=auth_headers, json={
            'full_name': 'Updated Name',
        })
        assert resp.status_code == 200
        assert resp.get_json()['data']['user']['full_name'] == 'Updated Name'

    def test_update_nickname(self, client, auth_headers):
        resp = client.put('/api/auth/profile', headers=auth_headers, json={
            'nickname': 'newnick',
        })
        assert resp.status_code == 200
        assert resp.get_json()['data']['user']['nickname'] == 'newnick'

    def test_update_nickname_duplicate(self, client, auth_headers, user2):
        resp = client.put('/api/auth/profile', headers=auth_headers, json={
            'nickname': 'user2',
        })
        assert resp.status_code == 400

    def test_update_nickname_invalid(self, client, auth_headers):
        resp = client.put('/api/auth/profile', headers=auth_headers, json={
            'nickname': 'ab',
        })
        assert resp.status_code == 400

    def test_update_physical_params(self, client, auth_headers):
        resp = client.put('/api/auth/profile', headers=auth_headers, json={
            'gender': 'male',
            'birth_year': 1995,
            'height_cm': 180,
            'weight_kg': 75.5,
            'target_weight_kg': 70.0,
            'workouts_per_week': 3,
            'diet': 'keto',
            'meals_per_day': 4,
        })
        assert resp.status_code == 200
        user = resp.get_json()['data']['user']
        assert user['gender'] == 'male'
        assert user['height_cm'] == 180
        assert user['weight_kg'] == 75.5

    def test_update_profile_no_data(self, client, auth_headers):
        resp = client.put('/api/auth/profile', headers=auth_headers,
                          data='', content_type='application/json')
        assert resp.status_code == 400


# ==================== Онбординг ====================

class TestOnboarding:

    def test_complete_onboarding(self, client, auth_headers, app, user1):
        resp = client.post('/api/auth/onboarding', headers=auth_headers, json={
            'gender': 'female',
            'birth_year': 2000,
            'height_cm': 165,
            'weight_kg': 55.0,
            'diet': 'vegetarian',
        })
        assert resp.status_code == 200
        user = resp.get_json()['data']['user']
        assert user['onboarding_completed'] is True
        assert user['gender'] == 'female'


# ==================== Смена пароля ====================

class TestChangePassword:

    def test_change_password(self, client, auth_headers):
        resp = client.post('/api/auth/change-password', headers=auth_headers, json={
            'current_password': 'test1234',
            'new_password': 'newpass123',
        })
        assert resp.status_code == 200

        # Проверяем вход с новым паролем
        resp2 = client.post('/api/auth/login', json={
            'email': 'user1@test.com',
            'password': 'newpass123',
        })
        assert resp2.status_code == 200

    def test_change_password_wrong_current(self, client, auth_headers):
        resp = client.post('/api/auth/change-password', headers=auth_headers, json={
            'current_password': 'wrongpass',
            'new_password': 'newpass123',
        })
        assert resp.status_code == 400

    def test_change_password_too_short(self, client, auth_headers):
        resp = client.post('/api/auth/change-password', headers=auth_headers, json={
            'current_password': 'test1234',
            'new_password': '12345',
        })
        assert resp.status_code == 400

    def test_change_password_missing_fields(self, client, auth_headers):
        resp = client.post('/api/auth/change-password', headers=auth_headers, json={})
        assert resp.status_code == 400


# ==================== Сброс пароля ====================

class TestResetPassword:

    def test_forgot_password_existing_user(self, client, user1):
        resp = client.post('/api/auth/forgot-password', json={
            'email': 'user1@test.com',
        })
        assert resp.status_code == 200

    def test_forgot_password_nonexistent(self, client):
        resp = client.post('/api/auth/forgot-password', json={
            'email': 'nobody@test.com',
        })
        # Не выдаёт ошибку из соображений безопасности
        assert resp.status_code == 200

    def test_reset_password_with_valid_token(self, client, app, user1):
        # Устанавливаем токен сброса
        with app.app_context():
            from datetime import timedelta
            user = User.query.get(user1.id)
            user.reset_token = 'valid-token-123'
            user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()

        resp = client.post('/api/auth/reset-password', json={
            'token': 'valid-token-123',
            'password': 'newpassword',
        })
        assert resp.status_code == 200

    def test_reset_password_expired_token(self, client, app, user1):
        with app.app_context():
            user = User.query.get(user1.id)
            user.reset_token = 'expired-token'
            user.reset_token_expires = datetime.utcnow() - timedelta(hours=1)
            db.session.commit()

        resp = client.post('/api/auth/reset-password', json={
            'token': 'expired-token',
            'password': 'newpassword',
        })
        assert resp.status_code == 400

    def test_reset_password_invalid_token(self, client):
        resp = client.post('/api/auth/reset-password', json={
            'token': 'nonexistent',
            'password': 'newpassword',
        })
        assert resp.status_code == 400


# ==================== Верификация email ====================

class TestVerifyEmail:

    def test_verify_email(self, client, app, user1):
        with app.app_context():
            user = User.query.get(user1.id)
            user.verification_token = 'verify-token'
            db.session.commit()

        resp = client.post('/api/auth/verify-email', json={
            'token': 'verify-token',
        })
        assert resp.status_code == 200

    def test_verify_email_invalid_token(self, client):
        resp = client.post('/api/auth/verify-email', json={
            'token': 'invalid',
        })
        assert resp.status_code == 400


# ==================== Деактивация / удаление ====================

class TestDeactivation:

    def test_deactivate_account(self, client, auth_headers, app, user1):
        resp = client.post('/api/auth/deactivate', headers=auth_headers, json={
            'password': 'test1234',
        })
        assert resp.status_code == 200

        with app.app_context():
            user = User.query.get(user1.id)
            assert user.is_active is False

    def test_deactivate_wrong_password(self, client, auth_headers):
        resp = client.post('/api/auth/deactivate', headers=auth_headers, json={
            'password': 'wrongpass',
        })
        assert resp.status_code == 400

    def test_delete_account(self, client, auth_headers, app, user1):
        resp = client.delete('/api/auth/deactivate', headers=auth_headers)
        assert resp.status_code == 200

        with app.app_context():
            assert User.query.get(user1.id) is None
