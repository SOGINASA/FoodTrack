import os
from datetime import timedelta

# Получаем путь к директории backend
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_DIR = os.path.join(BACKEND_DIR, 'database')

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Настройки базы данных (абсолютный путь)
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f'sqlite:///{os.path.join(DATABASE_DIR, "database.db")}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Настройки CORS
    CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "https://food-track-beta.vercel.app"]
    
    # Настройки JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # OAuth Google
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 
                                         'https://korolevst.supertest.beast-inside.kz/foodtrack_api/auth/oauth/google/callback')
    
    # OAuth GitHub
    GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID')
    GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET')
    GITHUB_REDIRECT_URI = os.environ.get('GITHUB_REDIRECT_URI',
                                         'https://korolevst.supertest.beast-inside.kz/foodtrack_api/auth/oauth/github/callback')
    
    # OAuth Apple
    APPLE_CLIENT_ID = os.environ.get('APPLE_CLIENT_ID')
    APPLE_TEAM_ID = os.environ.get('APPLE_TEAM_ID')
    APPLE_KEY_ID = os.environ.get('APPLE_KEY_ID')
    APPLE_PRIVATE_KEY = os.environ.get('APPLE_PRIVATE_KEY')
    APPLE_REDIRECT_URI = os.environ.get('APPLE_REDIRECT_URI',
                                        'http://localhost:5252/api/auth/oauth/apple/callback')
    
    # OAuth Settings
    OAUTH_STATE_TTL = 600  # 10 minutes
    OAUTH_PKCE_ENABLED = True
    
    
class DevelopmentConfig(Config):
    """Конфигурация для разработки"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{os.path.join(DATABASE_DIR, "database.db")}'
    
class TestingConfig(Config):
    """Конфигурация для тестирования"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=1)

# Выбор конфигурации по переменной окружения
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Получить текущую конфигурацию"""
    return config[os.environ.get('FLASK_ENV') or 'default']

# Валидация критически важных настроек
def validate_config():
    """Проверить корректность конфигурации"""
    errors = []
    
    if not Config.SECRET_KEY or Config.SECRET_KEY == 'workplus-dev-secret-key-change-in-production':
        if os.environ.get('FLASK_ENV') == 'production':
            errors.append("SECRET_KEY должен быть установлен в продакшене")
    
    if os.environ.get('FLASK_ENV') == 'production':
        required_env_vars = [
            'DATABASE_URL',
            'MAIL_USERNAME',
            'MAIL_PASSWORD',
            'JWT_SECRET_KEY'
        ]
        
        for var in required_env_vars:
            if not os.environ.get(var):
                errors.append(f"Переменная окружения {var} обязательна в продакшене")
    
    if errors:
        print("Ошибки конфигурации:")
        for error in errors:
            print(f"   • {error}")
        return False
    
    print("Конфигурация корректна")
    return True

# Утилита для создания .env файла
def create_env_template():
    """Создать шаблон .env файла"""
    env_template = """# Flask настройки
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here

# База данных
DATABASE_URL=sqlite:///database.db

# Файлы
UPLOAD_FOLDER=uploads

# Логирование
LOG_LEVEL=INFO
LOG_FILE=workplus.log

# API
API_RATE_LIMIT=1000/hour

# Кеширование
CACHE_TYPE=simple
"""
    
    with open('.env.template', 'w', encoding='utf-8') as f:
        f.write(env_template)
    
    print("Создан файл .env.template")
    print("Скопируйте его в .env и заполните своими значениями")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "validate":
        validate_config()
    elif len(sys.argv) > 1 and sys.argv[1] == "create-env":
        create_env_template()
    else:
        print("Использование:")
        print("  python config.py validate     - Проверить конфигурацию")
        print("  python config.py create-env   - Создать шаблон .env файла")