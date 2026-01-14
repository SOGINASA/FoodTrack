from models import db, User, Meal, MealIngredient, UserGoals, WeightEntry
from datetime import datetime, date, timedelta
import json
import random


def seed_all():
    """Заполнение БД тестовыми данными для FoodTrack"""
    print("Заполнение базы данных...")

    # === Пользователи ===
    users_data = [
        {
            'email': 'demo@foodtrack.app',
            'password': 'demo123',
            'full_name': 'Демо Пользователь',
            'user_type': 'user'
        },
        {
            'email': 'admin@foodtrack.app',
            'password': 'admin123',
            'full_name': 'Администратор',
            'user_type': 'admin'
        }
    ]

    users = []
    for user_data in users_data:
        user = User(
            email=user_data['email'],
            full_name=user_data['full_name'],
            user_type=user_data['user_type'],
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow() - timedelta(days=30),
            last_login=datetime.utcnow()
        )
        user.set_password(user_data['password'])
        db.session.add(user)
        users.append(user)

    db.session.flush()
    print(f"  Создано пользователей: {len(users)}")

    # === Цели пользователей ===
    demo_user = users[0]

    goals = UserGoals(
        user_id=demo_user.id,
        calories_goal=2500,
        protein_goal=150,
        carbs_goal=200,
        fats_goal=70,
        target_weight=75.0,
        activity_level='moderate',
        goal_type='maintain'
    )
    db.session.add(goals)
    print("  Созданы цели пользователя")

    # === История веса ===
    weight_data = []
    start_weight = 82.0
    for i in range(30):
        day = date.today() - timedelta(days=29 - i)
        # Небольшое случайное изменение веса
        weight = start_weight - (i * 0.15) + random.uniform(-0.3, 0.3)
        weight_data.append({
            'weight': round(weight, 1),
            'date': day
        })

    for wd in weight_data:
        entry = WeightEntry(
            user_id=demo_user.id,
            weight=wd['weight'],
            date=wd['date']
        )
        db.session.add(entry)
    print(f"  Создано записей веса: {len(weight_data)}")

    # === Приёмы пищи ===
    meals_templates = [
        # Завтраки
        {
            'name': 'Овсяная каша с бананом',
            'type': 'breakfast',
            'calories': 320,
            'protein': 12,
            'carbs': 58,
            'fats': 6,
            'tags': ['Завтрак', 'Здоровое', 'Углеводы'],
            'health_score': 85,
            'ingredients': [
                {'name': 'Овсяные хлопья', 'amount': '80г', 'calories': 240},
                {'name': 'Банан', 'amount': '1 шт', 'calories': 80}
            ]
        },
        {
            'name': 'Яичница с тостом',
            'type': 'breakfast',
            'calories': 380,
            'protein': 22,
            'carbs': 28,
            'fats': 20,
            'tags': ['Завтрак', 'Белок'],
            'health_score': 75,
            'ingredients': [
                {'name': 'Яйца', 'amount': '2 шт', 'calories': 180},
                {'name': 'Хлеб', 'amount': '2 ломтика', 'calories': 150},
                {'name': 'Масло', 'amount': '10г', 'calories': 50}
            ]
        },
        {
            'name': 'Греческий йогурт с ягодами',
            'type': 'breakfast',
            'calories': 180,
            'protein': 15,
            'carbs': 20,
            'fats': 5,
            'tags': ['Завтрак', 'Белок', 'ПП'],
            'health_score': 90,
            'ingredients': [
                {'name': 'Греческий йогурт', 'amount': '200г', 'calories': 130},
                {'name': 'Ягоды', 'amount': '50г', 'calories': 30},
                {'name': 'Мёд', 'amount': '10г', 'calories': 20}
            ]
        },
        # Обеды
        {
            'name': 'Куриная грудка с рисом',
            'type': 'lunch',
            'calories': 520,
            'protein': 45,
            'carbs': 62,
            'fats': 8,
            'tags': ['Обед', 'Белок', 'ПП'],
            'health_score': 88,
            'ingredients': [
                {'name': 'Куриная грудка', 'amount': '200г', 'calories': 330},
                {'name': 'Рис', 'amount': '100г', 'calories': 130},
                {'name': 'Овощи', 'amount': '100г', 'calories': 40},
                {'name': 'Оливковое масло', 'amount': '5мл', 'calories': 20}
            ]
        },
        {
            'name': 'Салат Цезарь',
            'type': 'lunch',
            'calories': 420,
            'protein': 28,
            'carbs': 22,
            'fats': 26,
            'tags': ['Обед', 'Салат'],
            'health_score': 72,
            'ingredients': [
                {'name': 'Курица', 'amount': '150г', 'calories': 250},
                {'name': 'Салат Романо', 'amount': '100г', 'calories': 20},
                {'name': 'Пармезан', 'amount': '30г', 'calories': 120},
                {'name': 'Соус Цезарь', 'amount': '30мл', 'calories': 30}
            ]
        },
        {
            'name': 'Борщ с говядиной',
            'type': 'lunch',
            'calories': 350,
            'protein': 25,
            'carbs': 32,
            'fats': 14,
            'tags': ['Обед', 'Суп', 'Традиционное'],
            'health_score': 80,
            'ingredients': [
                {'name': 'Говядина', 'amount': '100г', 'calories': 200},
                {'name': 'Свёкла', 'amount': '80г', 'calories': 35},
                {'name': 'Капуста', 'amount': '80г', 'calories': 20},
                {'name': 'Картофель', 'amount': '100г', 'calories': 80},
                {'name': 'Сметана', 'amount': '20г', 'calories': 15}
            ]
        },
        # Ужины
        {
            'name': 'Лосось на гриле с овощами',
            'type': 'dinner',
            'calories': 480,
            'protein': 42,
            'carbs': 18,
            'fats': 28,
            'tags': ['Ужин', 'Рыба', 'ПП', 'Омега-3'],
            'health_score': 92,
            'ingredients': [
                {'name': 'Лосось', 'amount': '200г', 'calories': 400},
                {'name': 'Брокколи', 'amount': '100г', 'calories': 35},
                {'name': 'Спаржа', 'amount': '80г', 'calories': 20},
                {'name': 'Лимон', 'amount': '1/4 шт', 'calories': 5},
                {'name': 'Оливковое масло', 'amount': '5мл', 'calories': 20}
            ]
        },
        {
            'name': 'Паста Болоньезе',
            'type': 'dinner',
            'calories': 620,
            'protein': 32,
            'carbs': 72,
            'fats': 22,
            'tags': ['Ужин', 'Паста', 'Итальянская'],
            'health_score': 65,
            'ingredients': [
                {'name': 'Паста', 'amount': '100г', 'calories': 350},
                {'name': 'Фарш говяжий', 'amount': '120г', 'calories': 200},
                {'name': 'Томатный соус', 'amount': '80г', 'calories': 40},
                {'name': 'Пармезан', 'amount': '20г', 'calories': 30}
            ]
        },
        {
            'name': 'Стейк с картофелем',
            'type': 'dinner',
            'calories': 680,
            'protein': 48,
            'carbs': 42,
            'fats': 35,
            'tags': ['Ужин', 'Мясо', 'Белок'],
            'health_score': 70,
            'ingredients': [
                {'name': 'Стейк рибай', 'amount': '200г', 'calories': 500},
                {'name': 'Картофель', 'amount': '150г', 'calories': 130},
                {'name': 'Масло', 'amount': '20г', 'calories': 50}
            ]
        },
        # Перекусы
        {
            'name': 'Яблоко',
            'type': 'snack',
            'calories': 80,
            'protein': 0,
            'carbs': 21,
            'fats': 0,
            'tags': ['Перекус', 'Фрукт', 'Здоровое'],
            'health_score': 95,
            'ingredients': [
                {'name': 'Яблоко', 'amount': '1 шт', 'calories': 80}
            ]
        },
        {
            'name': 'Протеиновый батончик',
            'type': 'snack',
            'calories': 220,
            'protein': 20,
            'carbs': 22,
            'fats': 8,
            'tags': ['Перекус', 'Белок', 'Спортпит'],
            'health_score': 70,
            'ingredients': [
                {'name': 'Протеиновый батончик', 'amount': '60г', 'calories': 220}
            ]
        },
        {
            'name': 'Орехи микс',
            'type': 'snack',
            'calories': 290,
            'protein': 8,
            'carbs': 12,
            'fats': 26,
            'tags': ['Перекус', 'Орехи', 'Полезные жиры'],
            'health_score': 85,
            'ingredients': [
                {'name': 'Миндаль', 'amount': '20г', 'calories': 120},
                {'name': 'Грецкий орех', 'amount': '20г', 'calories': 130},
                {'name': 'Кешью', 'amount': '10г', 'calories': 40}
            ]
        },
        {
            'name': 'Кофе с молоком',
            'type': 'snack',
            'calories': 45,
            'protein': 2,
            'carbs': 5,
            'fats': 2,
            'tags': ['Напиток'],
            'health_score': 60,
            'ingredients': [
                {'name': 'Кофе', 'amount': '200мл', 'calories': 5},
                {'name': 'Молоко', 'amount': '50мл', 'calories': 40}
            ]
        }
    ]

    # Создаём приёмы пищи за последние 14 дней
    meals_count = 0
    for days_ago in range(14):
        meal_date = date.today() - timedelta(days=days_ago)

        # 3-5 приёмов пищи в день
        daily_meals = random.sample(meals_templates, random.randint(3, 5))

        times_by_type = {
            'breakfast': ['07:30', '08:00', '08:30', '09:00'],
            'lunch': ['12:30', '13:00', '13:30', '14:00'],
            'dinner': ['18:30', '19:00', '19:30', '20:00'],
            'snack': ['10:30', '11:00', '15:30', '16:00', '16:30']
        }

        for meal_template in daily_meals:
            meal_time = random.choice(times_by_type.get(meal_template['type'], ['12:00']))

            meal = Meal(
                user_id=demo_user.id,
                name=meal_template['name'],
                meal_type=meal_template['type'],
                meal_date=meal_date,
                meal_time=meal_time,
                calories=meal_template['calories'],
                protein=meal_template['protein'],
                carbs=meal_template['carbs'],
                fats=meal_template['fats'],
                portions=1,
                ai_confidence=random.randint(85, 98),
                health_score=meal_template['health_score'],
                tags=json.dumps(meal_template['tags'])
            )
            db.session.add(meal)
            db.session.flush()

            # Добавляем ингредиенты
            for ing_data in meal_template.get('ingredients', []):
                ingredient = MealIngredient(
                    meal_id=meal.id,
                    name=ing_data['name'],
                    amount=ing_data['amount'],
                    calories=ing_data['calories']
                )
                db.session.add(ingredient)

            meals_count += 1

    print(f"  Создано приёмов пищи: {meals_count}")

    db.session.commit()
    print("База данных успешно заполнена!")


if __name__ == "__main__":
    from app import app
    with app.app_context():
        seed_all()