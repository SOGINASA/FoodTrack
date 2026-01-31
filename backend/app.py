from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from config import Config, DATABASE_DIR
from models import db, User, UserGoals
from seed_data import seed_all
from flask_jwt_extended.exceptions import JWTExtendedException
from werkzeug.exceptions import HTTPException
import os

# Инициализация расширений
migrate = Migrate()
jwt = JWTManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, supports_credentials=True, origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://food-track-beta.vercel.app"
    ])

    # Создаём папку для БД, если её нет
    os.makedirs(DATABASE_DIR, exist_ok=True)

    # Инициализация расширений
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Инициализация БД и заполнение данными при первом запуске
    with app.app_context():
        db.create_all()
        # Проверяем, есть ли уже данные в БД
        if User.query.first() is None:
            try:
                seed_all()
            except Exception as e:
                # Игнорируем ошибки если данные уже добавлены другим worker процессом
                if 'UNIQUE constraint failed' in str(e):
                    print(f"[INFO] Данные уже были добавлены другим процессом")
                    db.session.rollback()
                else:
                    raise

    # Импорт всех блюпринтов
    from routes import auth_bp
    from routes.meals import meals_bp
    from routes.goals import goals_bp
    from routes.analytics import analytics_bp
    from routes.progress import progress_bp
    from routes.groups import groups_bp
    from routes.meal_plans import meal_plans_bp
    from routes.recipes import recipes_bp
    from routes.tips import tips_bp

    # Регистрация всех блюпринтов
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(meals_bp, url_prefix='/api/meals')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(meal_plans_bp, url_prefix='/api/meal-plans')
    app.register_blueprint(recipes_bp, url_prefix='/api/recipes')
    app.register_blueprint(tips_bp, url_prefix='/api/tips')

    # Главная страница API
    @app.route('/api')
    def api_info():
        return jsonify({
            'message': 'FoodTrack API is alive',
            'version': '1.0.0',
            'description': 'API для трекинга питания FoodTrack',
            'endpoints': {
                'auth': '/api/auth - авторизация и регистрация',
                'meals': '/api/meals - управление приёмами пищи',
                'goals': '/api/goals - цели пользователя и трекинг веса',
                'analytics': '/api/analytics - статистика и аналитика',
                'progress': '/api/progress - отслеживание прогресса и изменения веса',
                'groups': '/api/groups - управление группами и социальные функции',
                'meal_plans': '/api/meal-plans - планы питания и рецепты',
                'recipes': '/api/recipes - каталог рецептов',
            }
        })

    return app


app = create_app()


# Обработчики ошибок
@app.errorhandler(422)
def handle_unprocessable_entity(err):
    return jsonify({'error': 'Validation error', 'message': str(err)}), 422


@app.errorhandler(JWTExtendedException)
def handle_jwt_error(e):
    return jsonify({'error': 'JWT Error', 'message': str(e)}), 401


@app.errorhandler(HTTPException)
def handle_http_exception(e):
    return jsonify({'error': e.code, 'message': e.description}), e.code


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Токен истек'}), 401


@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Недействительный токен'}), 401


@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({'error': 'Требуется авторизация'}), 401


# CLI команды
@app.cli.command()
def init_db():
    """Инициализация базы данных с тестовыми данными"""
    print("Инициализация базы данных...")
    db.create_all()
    seed_all()
    print("База данных инициализирована!")


@app.cli.command()
def create_admin():
    """Создать администратора"""
    email = input("Email администратора: ")
    password = input("Пароль: ")
    full_name = input("Полное имя: ")

    if User.query.filter_by(email=email).first():
        print("Пользователь с таким email уже существует")
        return

    admin = User(full_name=full_name, email=email, user_type='admin', is_verified=True)
    admin.set_password(password)

    # Создаём цели по умолчанию
    goals = UserGoals(user_id=admin.id)

    db.session.add(admin)
    db.session.flush()
    goals.user_id = admin.id
    db.session.add(goals)
    db.session.commit()

    print(f"Администратор {email} создан")


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5252)