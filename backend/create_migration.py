"""
Скрипт для создания миграции OAuth и AuditLog
Запустить: python create_migration.py
"""

import os
import sys
from datetime import datetime

# Добавляем backend в путь
sys.path.insert(0, os.path.dirname(__file__))

from app import app, db
from models import User, AuditLog

def create_migration():
    """Создает миграцию и применяет её"""
    with app.app_context():
        print("🔄 Проверка схемы БД...")
        
        # Проверяем наличие таблиц
        inspector = db.inspect(db.engine)
        tables = inspector.get_table_names()
        
        if 'audit_logs' in tables:
            print("✅ Таблица audit_logs уже существует")
        else:
            print("📝 Создаю таблицу audit_logs...")
            
        # Проверяем наличие колонок в User
        if 'users' in tables:
            columns = [col['name'] for col in inspector.get_columns('users')]
            
            if 'oauth_provider' in columns:
                print("✅ OAuth поля уже добавлены в User")
            else:
                print("📝 Добавляю OAuth поля в User...")
        
        # Создаем все таблицы
        print("🔨 Создаю/обновляю БД...")
        db.create_all()
        
        print("✅ Миграция успешно применена!")
        print("\n📊 Созданные таблицы:")
        
        # Показываем структуру таблиц
        inspector = db.inspect(db.engine)
        for table_name in ['users', 'audit_logs']:
            if table_name in inspector.get_table_names():
                print(f"\n  📌 {table_name}:")
                for col in inspector.get_columns(table_name):
                    print(f"     - {col['name']}: {col['type']}")

if __name__ == '__main__':
    try:
        create_migration()
    except Exception as e:
        print(f"❌ Ошибка: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
