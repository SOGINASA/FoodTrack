"""
Общие фикстуры для тестирования FoodTrack backend.
"""
import sys
import os
import json
import pytest
from datetime import datetime, date, timedelta

# Добавляем backend в sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token
from models import db as _db
from models import (
    User, UserGoals, Meal, MealIngredient, WeightEntry,
    Measurement, ProgressPhoto, Group, GroupMember, GroupPost,
    PostComment, PostLike, ForumTopic, ForumReply, Friendship,
    FridgeProduct, ProductShareRequest, MealPlan, Recipe, AuditLog
)


def create_test_app():
    """Создать Flask-приложение для тестов (без seed_data)."""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'test-secret'
    app.config['JWT_SECRET_KEY'] = 'test-jwt-secret'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=1)
    app.config['WTF_CSRF_ENABLED'] = False

    _db.init_app(app)
    JWTManager(app)

    from routes.auth import auth_bp
    from routes.oauth import oauth_bp
    from routes.meals import meals_bp
    from routes.goals import goals_bp
    from routes.analytics import analytics_bp
    from routes.progress import progress_bp
    from routes.groups import groups_bp
    from routes.meal_plans import meal_plans_bp
    from routes.recipes import recipes_bp
    from routes.friends import friends_bp
    from routes.fridge import fridge_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(oauth_bp, url_prefix='/api/auth/oauth')
    app.register_blueprint(meals_bp, url_prefix='/api/meals')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(meal_plans_bp, url_prefix='/api/meal-plans')
    app.register_blueprint(recipes_bp, url_prefix='/api/recipes')
    app.register_blueprint(friends_bp, url_prefix='/api/friends')
    app.register_blueprint(fridge_bp, url_prefix='/api/fridge')

    return app


@pytest.fixture(scope='session')
def app():
    """Приложение Flask для всей сессии тестов."""
    app = create_test_app()
    yield app


@pytest.fixture(autouse=True)
def setup_db(app):
    """Создаёт и очищает БД перед каждым тестом.

    Все фикстуры и тесты работают внутри этого app_context.
    """
    with app.app_context():
        _db.create_all()
        yield
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    """Flask test client."""
    return app.test_client()


@pytest.fixture
def create_user():
    """Фабрика для создания пользователей (работает внутри setup_db context)."""
    def _create(email=None, nickname=None, password='test1234',
                full_name='Test User', **kwargs):
        user = User(
            email=email,
            nickname=nickname,
            full_name=full_name,
            is_active=True,
            is_verified=False,
            **kwargs
        )
        user.set_password(password)
        _db.session.add(user)
        _db.session.flush()
        goals = UserGoals(user_id=user.id)
        _db.session.add(goals)
        _db.session.commit()
        return user

    return _create


@pytest.fixture
def user1(create_user):
    """Первый тестовый пользователь."""
    return create_user(email='user1@test.com', nickname='user1', full_name='User One')


@pytest.fixture
def user2(create_user):
    """Второй тестовый пользователь."""
    return create_user(email='user2@test.com', nickname='user2', full_name='User Two')


@pytest.fixture
def auth_headers(user1):
    """Заголовки авторизации для user1."""
    token = create_access_token(identity=str(user1.id))
    return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}


@pytest.fixture
def auth_headers_user2(user2):
    """Заголовки авторизации для user2."""
    token = create_access_token(identity=str(user2.id))
    return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}


@pytest.fixture
def refresh_headers(user1):
    """Заголовки с refresh-токеном для user1."""
    token = create_refresh_token(identity=str(user1.id))
    return {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}


@pytest.fixture
def sample_meal(user1):
    """Пример приёма пищи."""
    meal = Meal(
        user_id=user1.id,
        name='Овсянка',
        meal_type='breakfast',
        meal_date=date.today(),
        meal_time='08:00',
        calories=350,
        protein=12.0,
        carbs=60.0,
        fats=8.0,
        portions=1,
    )
    _db.session.add(meal)
    _db.session.commit()
    return meal


@pytest.fixture
def sample_group(user1):
    """Пример группы."""
    group = Group(
        name='Test Group',
        description='A test group',
        emoji='💪',
        is_public=True,
        owner_id=user1.id,
    )
    _db.session.add(group)
    _db.session.flush()
    member = GroupMember(
        group_id=group.id,
        user_id=user1.id,
        role='owner',
    )
    _db.session.add(member)
    _db.session.commit()
    return group


@pytest.fixture
def sample_recipe():
    """Пример рецепта в каталоге."""
    recipe = Recipe(
        name='Греческий салат',
        image='https://example.com/salad.jpg',
        time=15,
        calories=250,
        protein=8.0,
        carbs=12.0,
        fats=18.0,
        difficulty='easy',
        category='lunch',
        tags=json.dumps(['салат', 'овощи']),
        ingredients=json.dumps(['огурцы', 'помидоры', 'фета']),
        steps=json.dumps(['Нарезать овощи', 'Добавить фету', 'Заправить маслом']),
    )
    _db.session.add(recipe)
    _db.session.commit()
    return recipe
