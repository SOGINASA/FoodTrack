from models import db, User, Meal, MealIngredient, UserGoals, WeightEntry, Measurement, ProgressPhoto
from datetime import datetime, date, timedelta
import json
import random


def seed_all():
    """Заполнение БД тестовыми данными для FoodTrack"""
    print("Заполнение базы данных...")

    # === Пользователи ===
    users_data = [
        {
            'email': 'user@example.com',
            'nickname': 'demo_user',
            'password': 'user123',
            'full_name': 'Демо Пользователь',
            'user_type': 'user',
            'gender': 'male',
            'birth_year': 1995,
            'height_cm': 180,
            'weight_kg': 82.0,
            'target_weight_kg': 75.0,
            'workouts_per_week': 3,
            'diet': 'none',
            'diet_notes': None,
            'meals_per_day': 4,
            'health_flags': json.dumps([]),
            'health_notes': None,
            'onboarding_completed': True
        },
        {
            'email': 'admin@example.com',
            'nickname': 'admin',
            'password': 'admin123',
            'full_name': 'Администратор',
            'user_type': 'admin',
            'gender': 'male',
            'birth_year': 1990,
            'height_cm': 175,
            'weight_kg': 78.0,
            'target_weight_kg': 78.0,
            'workouts_per_week': 4,
            'diet': 'none',
            'diet_notes': None,
            'meals_per_day': 3,
            'health_flags': json.dumps([]),
            'health_notes': None,
            'onboarding_completed': True
        },
        {
            'email': 'anna@example.com',
            'nickname': 'anna_fit',
            'password': 'anna123',
            'full_name': 'Анна Иванова',
            'user_type': 'user',
            'gender': 'female',
            'birth_year': 1998,
            'height_cm': 165,
            'weight_kg': 62.0,
            'target_weight_kg': 58.0,
            'workouts_per_week': 5,
            'diet': 'vegetarian',
            'diet_notes': 'Без мяса, но ем рыбу иногда',
            'meals_per_day': 5,
            'health_flags': json.dumps(['lactose_intolerant']),
            'health_notes': 'Непереносимость лактозы',
            'onboarding_completed': True
        },
        {
            'email': 'peter@example.com',
            'nickname': 'peter_bulk',
            'password': 'peter123',
            'full_name': 'Пётр Сидоров',
            'user_type': 'user',
            'gender': 'male',
            'birth_year': 2000,
            'height_cm': 185,
            'weight_kg': 75.0,
            'target_weight_kg': 85.0,
            'workouts_per_week': 6,
            'diet': 'none',
            'diet_notes': 'Набор массы',
            'meals_per_day': 6,
            'health_flags': json.dumps([]),
            'health_notes': None,
            'onboarding_completed': True
        },
        {
            'email': 'maria@example.com',
            'nickname': 'maria_keto',
            'password': 'maria123',
            'full_name': 'Мария Козлова',
            'user_type': 'user',
            'gender': 'female',
            'birth_year': 1992,
            'height_cm': 168,
            'weight_kg': 70.0,
            'target_weight_kg': 62.0,
            'workouts_per_week': 2,
            'diet': 'keto',
            'diet_notes': 'Строгое кето, до 20г углеводов в день',
            'meals_per_day': 3,
            'health_flags': json.dumps(['diabetes']),
            'health_notes': 'Диабет 2 типа, контролирую углеводы',
            'onboarding_completed': True
        }
    ]

    users = []
    for user_data in users_data:
        user = User(
            email=user_data['email'],
            nickname=user_data['nickname'],
            full_name=user_data['full_name'],
            user_type=user_data['user_type'],
            is_active=True,
            is_verified=True,
            created_at=datetime.utcnow() - timedelta(days=random.randint(30, 90)),
            last_login=datetime.utcnow() - timedelta(hours=random.randint(0, 48)),
            gender=user_data['gender'],
            birth_year=user_data['birth_year'],
            height_cm=user_data['height_cm'],
            weight_kg=user_data['weight_kg'],
            target_weight_kg=user_data['target_weight_kg'],
            workouts_per_week=user_data['workouts_per_week'],
            diet=user_data['diet'],
            diet_notes=user_data['diet_notes'],
            meals_per_day=user_data['meals_per_day'],
            health_flags=user_data['health_flags'],
            health_notes=user_data['health_notes'],
            onboarding_completed=user_data['onboarding_completed']
        )
        user.set_password(user_data['password'])
        db.session.add(user)
        users.append(user)

    db.session.flush()
    print(f"  Создано пользователей: {len(users)}")

    # === Цели пользователей ===
    goals_data = [
        # demo_user - поддержание веса
        {
            'calories_goal': 2500,
            'protein_goal': 150,
            'carbs_goal': 250,
            'fats_goal': 85,
            'target_weight': 75.0,
            'activity_level': 'moderate',
            'goal_type': 'lose',
            'diet_type': 'balanced'
        },
        # admin
        {
            'calories_goal': 2300,
            'protein_goal': 140,
            'carbs_goal': 230,
            'fats_goal': 75,
            'target_weight': 78.0,
            'activity_level': 'active',
            'goal_type': 'maintain',
            'diet_type': 'balanced'
        },
        # anna_fit - похудение, вегетарианка
        {
            'calories_goal': 1600,
            'protein_goal': 100,
            'carbs_goal': 160,
            'fats_goal': 55,
            'target_weight': 58.0,
            'activity_level': 'very_active',
            'goal_type': 'lose',
            'diet_type': 'vegetarian'
        },
        # peter_bulk - набор массы
        {
            'calories_goal': 3200,
            'protein_goal': 200,
            'carbs_goal': 380,
            'fats_goal': 100,
            'target_weight': 85.0,
            'activity_level': 'very_active',
            'goal_type': 'gain',
            'diet_type': 'high_protein'
        },
        # maria_keto - кето диета
        {
            'calories_goal': 1800,
            'protein_goal': 110,
            'carbs_goal': 25,
            'fats_goal': 140,
            'target_weight': 62.0,
            'activity_level': 'light',
            'goal_type': 'lose',
            'diet_type': 'keto'
        }
    ]

    for i, user in enumerate(users):
        goals = UserGoals(
            user_id=user.id,
            **goals_data[i]
        )
        db.session.add(goals)
    print(f"  Созданы цели для {len(users)} пользователей")

    # === История веса для каждого пользователя ===
    weight_configs = [
        {'start': 82.0, 'trend': -0.15, 'variance': 0.3},   # demo_user - худеет
        {'start': 78.0, 'trend': 0.0, 'variance': 0.2},      # admin - стабильно
        {'start': 64.0, 'trend': -0.08, 'variance': 0.25},   # anna - медленно худеет
        {'start': 73.0, 'trend': 0.1, 'variance': 0.35},     # peter - набирает
        {'start': 72.0, 'trend': -0.12, 'variance': 0.4}     # maria - худеет на кето
    ]

    total_weight_entries = 0
    for i, user in enumerate(users):
        config = weight_configs[i]
        for day_offset in range(30):
            day = date.today() - timedelta(days=29 - day_offset)
            weight = config['start'] - (day_offset * config['trend']) + random.uniform(-config['variance'], config['variance'])
            entry = WeightEntry(
                user_id=user.id,
                weight=round(weight, 1),
                date=day,
                notes=random.choice([None, None, None, 'После тренировки', 'Утром натощак', 'Вечером'])
            )
            db.session.add(entry)
            total_weight_entries += 1

    print(f"  Создано записей веса: {total_weight_entries}")

    # === Шаблоны приёмов пищи ===
    meals_templates = {
        'regular': [
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
                'ai_advice': 'Отличный источник медленных углеводов для энергии на весь день',
                'ingredients': [
                    {'name': 'Овсяные хлопья', 'amount': '80г', 'calories': 240, 'protein': 10, 'carbs': 50, 'fats': 5},
                    {'name': 'Банан', 'amount': '1 шт', 'calories': 80, 'protein': 2, 'carbs': 8, 'fats': 1}
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
                'ai_advice': 'Хороший баланс белков и углеводов',
                'ingredients': [
                    {'name': 'Яйца', 'amount': '2 шт', 'calories': 180, 'protein': 14, 'carbs': 1, 'fats': 12},
                    {'name': 'Хлеб', 'amount': '2 ломтика', 'calories': 150, 'protein': 5, 'carbs': 25, 'fats': 3},
                    {'name': 'Масло', 'amount': '10г', 'calories': 50, 'protein': 0, 'carbs': 0, 'fats': 5}
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
                'ai_advice': 'Превосходный источник пробиотиков и белка',
                'ingredients': [
                    {'name': 'Греческий йогурт', 'amount': '200г', 'calories': 130, 'protein': 12, 'carbs': 8, 'fats': 4},
                    {'name': 'Ягоды', 'amount': '50г', 'calories': 30, 'protein': 1, 'carbs': 7, 'fats': 0},
                    {'name': 'Мёд', 'amount': '10г', 'calories': 20, 'protein': 0, 'carbs': 5, 'fats': 0}
                ]
            },
            {
                'name': 'Творог с фруктами',
                'type': 'breakfast',
                'calories': 250,
                'protein': 28,
                'carbs': 22,
                'fats': 6,
                'tags': ['Завтрак', 'Белок', 'ПП'],
                'health_score': 88,
                'ai_advice': 'Отличный выбор для насыщения белком с утра',
                'ingredients': [
                    {'name': 'Творог 5%', 'amount': '200г', 'calories': 200, 'protein': 26, 'carbs': 6, 'fats': 5},
                    {'name': 'Яблоко', 'amount': '1 шт', 'calories': 50, 'protein': 0, 'carbs': 12, 'fats': 0}
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
                'ai_advice': 'Классическое блюдо для набора мышечной массы',
                'ingredients': [
                    {'name': 'Куриная грудка', 'amount': '200г', 'calories': 330, 'protein': 40, 'carbs': 0, 'fats': 5},
                    {'name': 'Рис', 'amount': '100г', 'calories': 130, 'protein': 3, 'carbs': 58, 'fats': 1},
                    {'name': 'Овощи', 'amount': '100г', 'calories': 40, 'protein': 2, 'carbs': 4, 'fats': 0},
                    {'name': 'Оливковое масло', 'amount': '5мл', 'calories': 20, 'protein': 0, 'carbs': 0, 'fats': 2}
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
                'ai_advice': 'Вкусно, но соус добавляет лишние калории',
                'ingredients': [
                    {'name': 'Курица', 'amount': '150г', 'calories': 250, 'protein': 25, 'carbs': 0, 'fats': 8},
                    {'name': 'Салат Романо', 'amount': '100г', 'calories': 20, 'protein': 1, 'carbs': 3, 'fats': 0},
                    {'name': 'Пармезан', 'amount': '30г', 'calories': 120, 'protein': 2, 'carbs': 1, 'fats': 10},
                    {'name': 'Соус Цезарь', 'amount': '30мл', 'calories': 30, 'protein': 0, 'carbs': 2, 'fats': 8}
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
                'ai_advice': 'Богат витаминами и клетчаткой',
                'ingredients': [
                    {'name': 'Говядина', 'amount': '100г', 'calories': 200, 'protein': 20, 'carbs': 0, 'fats': 10},
                    {'name': 'Свёкла', 'amount': '80г', 'calories': 35, 'protein': 1, 'carbs': 8, 'fats': 0},
                    {'name': 'Капуста', 'amount': '80г', 'calories': 20, 'protein': 1, 'carbs': 4, 'fats': 0},
                    {'name': 'Картофель', 'amount': '100г', 'calories': 80, 'protein': 2, 'carbs': 18, 'fats': 0},
                    {'name': 'Сметана', 'amount': '20г', 'calories': 15, 'protein': 1, 'carbs': 2, 'fats': 4}
                ]
            },
            {
                'name': 'Гречка с котлетой',
                'type': 'lunch',
                'calories': 480,
                'protein': 32,
                'carbs': 52,
                'fats': 18,
                'tags': ['Обед', 'Традиционное'],
                'health_score': 78,
                'ai_advice': 'Сытное и питательное блюдо',
                'ingredients': [
                    {'name': 'Гречка', 'amount': '100г', 'calories': 130, 'protein': 5, 'carbs': 50, 'fats': 1},
                    {'name': 'Котлета куриная', 'amount': '150г', 'calories': 300, 'protein': 25, 'carbs': 2, 'fats': 15},
                    {'name': 'Огурец', 'amount': '100г', 'calories': 15, 'protein': 1, 'carbs': 0, 'fats': 0},
                    {'name': 'Помидор', 'amount': '100г', 'calories': 35, 'protein': 1, 'carbs': 0, 'fats': 2}
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
                'ai_advice': 'Превосходный источник омега-3 жирных кислот',
                'ingredients': [
                    {'name': 'Лосось', 'amount': '200г', 'calories': 400, 'protein': 38, 'carbs': 0, 'fats': 25},
                    {'name': 'Брокколи', 'amount': '100г', 'calories': 35, 'protein': 3, 'carbs': 6, 'fats': 0},
                    {'name': 'Спаржа', 'amount': '80г', 'calories': 20, 'protein': 1, 'carbs': 4, 'fats': 0},
                    {'name': 'Лимон', 'amount': '1/4 шт', 'calories': 5, 'protein': 0, 'carbs': 2, 'fats': 0},
                    {'name': 'Оливковое масло', 'amount': '5мл', 'calories': 20, 'protein': 0, 'carbs': 0, 'fats': 3}
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
                'ai_advice': 'Много углеводов - лучше есть после тренировки',
                'ingredients': [
                    {'name': 'Паста', 'amount': '100г', 'calories': 350, 'protein': 10, 'carbs': 68, 'fats': 2},
                    {'name': 'Фарш говяжий', 'amount': '120г', 'calories': 200, 'protein': 18, 'carbs': 0, 'fats': 12},
                    {'name': 'Томатный соус', 'amount': '80г', 'calories': 40, 'protein': 2, 'carbs': 4, 'fats': 0},
                    {'name': 'Пармезан', 'amount': '20г', 'calories': 30, 'protein': 2, 'carbs': 0, 'fats': 8}
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
                'ai_advice': 'Много белка, но высокая калорийность',
                'ingredients': [
                    {'name': 'Стейк рибай', 'amount': '200г', 'calories': 500, 'protein': 42, 'carbs': 0, 'fats': 30},
                    {'name': 'Картофель', 'amount': '150г', 'calories': 130, 'protein': 4, 'carbs': 40, 'fats': 0},
                    {'name': 'Масло', 'amount': '20г', 'calories': 50, 'protein': 0, 'carbs': 0, 'fats': 5}
                ]
            },
            {
                'name': 'Куриные котлеты с овощами',
                'type': 'dinner',
                'calories': 380,
                'protein': 35,
                'carbs': 20,
                'fats': 18,
                'tags': ['Ужин', 'Белок', 'ПП'],
                'health_score': 82,
                'ai_advice': 'Лёгкий ужин с высоким содержанием белка',
                'ingredients': [
                    {'name': 'Куриные котлеты', 'amount': '200г', 'calories': 300, 'protein': 32, 'carbs': 5, 'fats': 15},
                    {'name': 'Овощи на пару', 'amount': '150г', 'calories': 50, 'protein': 2, 'carbs': 10, 'fats': 0},
                    {'name': 'Сметана', 'amount': '30г', 'calories': 30, 'protein': 1, 'carbs': 5, 'fats': 3}
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
                'ai_advice': 'Отличный низкокалорийный перекус',
                'ingredients': [
                    {'name': 'Яблоко', 'amount': '1 шт', 'calories': 80, 'protein': 0, 'carbs': 21, 'fats': 0}
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
                'ai_advice': 'Удобный источник белка после тренировки',
                'ingredients': [
                    {'name': 'Протеиновый батончик', 'amount': '60г', 'calories': 220, 'protein': 20, 'carbs': 22, 'fats': 8}
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
                'ai_advice': 'Полезные жиры, но следите за порцией',
                'ingredients': [
                    {'name': 'Миндаль', 'amount': '20г', 'calories': 120, 'protein': 4, 'carbs': 4, 'fats': 10},
                    {'name': 'Грецкий орех', 'amount': '20г', 'calories': 130, 'protein': 3, 'carbs': 4, 'fats': 12},
                    {'name': 'Кешью', 'amount': '10г', 'calories': 40, 'protein': 1, 'carbs': 4, 'fats': 4}
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
                'ai_advice': 'Небольшое количество калорий',
                'ingredients': [
                    {'name': 'Кофе', 'amount': '200мл', 'calories': 5, 'protein': 0, 'carbs': 0, 'fats': 0},
                    {'name': 'Молоко', 'amount': '50мл', 'calories': 40, 'protein': 2, 'carbs': 5, 'fats': 2}
                ]
            },
            {
                'name': 'Банан',
                'type': 'snack',
                'calories': 105,
                'protein': 1,
                'carbs': 27,
                'fats': 0,
                'tags': ['Перекус', 'Фрукт', 'Энергия'],
                'health_score': 88,
                'ai_advice': 'Быстрый источник энергии перед тренировкой',
                'ingredients': [
                    {'name': 'Банан', 'amount': '1 шт', 'calories': 105, 'protein': 1, 'carbs': 27, 'fats': 0}
                ]
            }
        ],
        'vegetarian': [
            {
                'name': 'Тофу с овощами',
                'type': 'lunch',
                'calories': 320,
                'protein': 22,
                'carbs': 18,
                'fats': 18,
                'tags': ['Обед', 'Вегетарианское', 'Белок'],
                'health_score': 88,
                'ai_advice': 'Отличный растительный источник белка',
                'ingredients': [
                    {'name': 'Тофу', 'amount': '200г', 'calories': 180, 'protein': 18, 'carbs': 4, 'fats': 10},
                    {'name': 'Овощи', 'amount': '200г', 'calories': 80, 'protein': 4, 'carbs': 12, 'fats': 0},
                    {'name': 'Соевый соус', 'amount': '20мл', 'calories': 20, 'protein': 0, 'carbs': 2, 'fats': 0},
                    {'name': 'Кунжутное масло', 'amount': '10мл', 'calories': 40, 'protein': 0, 'carbs': 0, 'fats': 8}
                ]
            },
            {
                'name': 'Чечевичный суп',
                'type': 'lunch',
                'calories': 280,
                'protein': 18,
                'carbs': 42,
                'fats': 5,
                'tags': ['Обед', 'Суп', 'Вегетарианское'],
                'health_score': 90,
                'ai_advice': 'Богат белком и клетчаткой',
                'ingredients': [
                    {'name': 'Чечевица', 'amount': '100г', 'calories': 200, 'protein': 15, 'carbs': 35, 'fats': 1},
                    {'name': 'Морковь', 'amount': '50г', 'calories': 20, 'protein': 1, 'carbs': 4, 'fats': 0},
                    {'name': 'Лук', 'amount': '50г', 'calories': 20, 'protein': 1, 'carbs': 3, 'fats': 0},
                    {'name': 'Оливковое масло', 'amount': '10мл', 'calories': 40, 'protein': 0, 'carbs': 0, 'fats': 4}
                ]
            },
            {
                'name': 'Овощное рагу',
                'type': 'dinner',
                'calories': 220,
                'protein': 8,
                'carbs': 35,
                'fats': 6,
                'tags': ['Ужин', 'Вегетарианское', 'Овощи'],
                'health_score': 92,
                'ai_advice': 'Лёгкий и питательный ужин',
                'ingredients': [
                    {'name': 'Кабачок', 'amount': '150г', 'calories': 30, 'protein': 2, 'carbs': 5, 'fats': 0},
                    {'name': 'Баклажан', 'amount': '100г', 'calories': 25, 'protein': 1, 'carbs': 5, 'fats': 0},
                    {'name': 'Перец', 'amount': '100г', 'calories': 30, 'protein': 1, 'carbs': 6, 'fats': 0},
                    {'name': 'Томаты', 'amount': '150г', 'calories': 30, 'protein': 2, 'carbs': 6, 'fats': 0},
                    {'name': 'Оливковое масло', 'amount': '15мл', 'calories': 60, 'protein': 0, 'carbs': 0, 'fats': 6},
                    {'name': 'Нут', 'amount': '50г', 'calories': 45, 'protein': 2, 'carbs': 8, 'fats': 0}
                ]
            }
        ],
        'keto': [
            {
                'name': 'Яйца с беконом и авокадо',
                'type': 'breakfast',
                'calories': 550,
                'protein': 28,
                'carbs': 6,
                'fats': 48,
                'tags': ['Завтрак', 'Кето', 'Жиры'],
                'health_score': 75,
                'ai_advice': 'Идеальный кето-завтрак с минимумом углеводов',
                'ingredients': [
                    {'name': 'Яйца', 'amount': '3 шт', 'calories': 270, 'protein': 21, 'carbs': 1, 'fats': 18},
                    {'name': 'Бекон', 'amount': '50г', 'calories': 180, 'protein': 5, 'carbs': 0, 'fats': 18},
                    {'name': 'Авокадо', 'amount': '1/2 шт', 'calories': 100, 'protein': 2, 'carbs': 5, 'fats': 12}
                ]
            },
            {
                'name': 'Стейк с салатом',
                'type': 'lunch',
                'calories': 620,
                'protein': 50,
                'carbs': 8,
                'fats': 45,
                'tags': ['Обед', 'Кето', 'Мясо'],
                'health_score': 78,
                'ai_advice': 'Отличное соотношение белков и жиров для кето',
                'ingredients': [
                    {'name': 'Стейк', 'amount': '250г', 'calories': 500, 'protein': 45, 'carbs': 0, 'fats': 35},
                    {'name': 'Листья салата', 'amount': '100г', 'calories': 20, 'protein': 2, 'carbs': 3, 'fats': 0},
                    {'name': 'Оливковое масло', 'amount': '20мл', 'calories': 80, 'protein': 0, 'carbs': 0, 'fats': 8},
                    {'name': 'Сыр', 'amount': '30г', 'calories': 20, 'protein': 3, 'carbs': 5, 'fats': 2}
                ]
            },
            {
                'name': 'Лосось с брокколи',
                'type': 'dinner',
                'calories': 520,
                'protein': 40,
                'carbs': 8,
                'fats': 38,
                'tags': ['Ужин', 'Кето', 'Рыба', 'Омега-3'],
                'health_score': 90,
                'ai_advice': 'Полезные жиры из рыбы + минимум углеводов',
                'ingredients': [
                    {'name': 'Лосось', 'amount': '200г', 'calories': 400, 'protein': 38, 'carbs': 0, 'fats': 25},
                    {'name': 'Брокколи', 'amount': '150г', 'calories': 50, 'protein': 4, 'carbs': 8, 'fats': 0},
                    {'name': 'Сливочное масло', 'amount': '20г', 'calories': 70, 'protein': 0, 'carbs': 0, 'fats': 8}
                ]
            },
            {
                'name': 'Сыр и орехи',
                'type': 'snack',
                'calories': 350,
                'protein': 15,
                'carbs': 4,
                'fats': 32,
                'tags': ['Перекус', 'Кето', 'Жиры'],
                'health_score': 72,
                'ai_advice': 'Кето-френдли перекус',
                'ingredients': [
                    {'name': 'Сыр чеддер', 'amount': '50г', 'calories': 200, 'protein': 12, 'carbs': 1, 'fats': 17},
                    {'name': 'Миндаль', 'amount': '30г', 'calories': 150, 'protein': 3, 'carbs': 3, 'fats': 15}
                ]
            }
        ],
        'high_protein': [
            {
                'name': 'Протеиновый завтрак',
                'type': 'breakfast',
                'calories': 550,
                'protein': 50,
                'carbs': 40,
                'fats': 18,
                'tags': ['Завтрак', 'Белок', 'Набор массы'],
                'health_score': 82,
                'ai_advice': 'Максимум белка для роста мышц',
                'ingredients': [
                    {'name': 'Яйца', 'amount': '4 шт', 'calories': 280, 'protein': 28, 'carbs': 2, 'fats': 18},
                    {'name': 'Овсянка', 'amount': '80г', 'calories': 240, 'protein': 10, 'carbs': 38, 'fats': 5},
                    {'name': 'Протеин', 'amount': '30г', 'calories': 30, 'protein': 12, 'carbs': 0, 'fats': 0}
                ]
            },
            {
                'name': 'Двойная куриная грудка',
                'type': 'lunch',
                'calories': 680,
                'protein': 75,
                'carbs': 55,
                'fats': 12,
                'tags': ['Обед', 'Белок', 'Набор массы'],
                'health_score': 85,
                'ai_advice': 'Много белка для восстановления после тренировки',
                'ingredients': [
                    {'name': 'Куриная грудка', 'amount': '350г', 'calories': 500, 'protein': 70, 'carbs': 0, 'fats': 8},
                    {'name': 'Рис', 'amount': '120г', 'calories': 150, 'protein': 4, 'carbs': 50, 'fats': 1},
                    {'name': 'Овощи', 'amount': '100г', 'calories': 30, 'protein': 1, 'carbs': 5, 'fats': 0}
                ]
            },
            {
                'name': 'Говядина с гречкой',
                'type': 'dinner',
                'calories': 720,
                'protein': 60,
                'carbs': 65,
                'fats': 25,
                'tags': ['Ужин', 'Белок', 'Набор массы'],
                'health_score': 80,
                'ai_advice': 'Сытный ужин для набора массы',
                'ingredients': [
                    {'name': 'Говядина', 'amount': '250г', 'calories': 450, 'protein': 50, 'carbs': 0, 'fats': 22},
                    {'name': 'Гречка', 'amount': '150г', 'calories': 200, 'protein': 8, 'carbs': 60, 'fats': 2},
                    {'name': 'Овощи', 'amount': '100г', 'calories': 40, 'protein': 2, 'carbs': 5, 'fats': 1},
                    {'name': 'Соус', 'amount': '30г', 'calories': 30, 'protein': 0, 'carbs': 0, 'fats': 0}
                ]
            },
            {
                'name': 'Протеиновый коктейль',
                'type': 'snack',
                'calories': 280,
                'protein': 35,
                'carbs': 20,
                'fats': 6,
                'tags': ['Перекус', 'Белок', 'Спортпит'],
                'health_score': 75,
                'ai_advice': 'Быстрый белок после тренировки',
                'ingredients': [
                    {'name': 'Протеин', 'amount': '40г', 'calories': 160, 'protein': 32, 'carbs': 4, 'fats': 2},
                    {'name': 'Молоко', 'amount': '300мл', 'calories': 120, 'protein': 3, 'carbs': 16, 'fats': 4}
                ]
            }
        ]
    }

    # Время приёмов пищи по типам
    times_by_type = {
        'breakfast': ['07:30', '08:00', '08:30', '09:00'],
        'lunch': ['12:30', '13:00', '13:30', '14:00'],
        'dinner': ['18:30', '19:00', '19:30', '20:00'],
        'snack': ['10:30', '11:00', '15:30', '16:00', '16:30', '17:00']
    }

    # Конфигурация диет для пользователей
    user_diets = {
        0: 'regular',           # demo_user
        1: 'regular',           # admin
        2: 'vegetarian',        # anna (вегетарианка)
        3: 'high_protein',      # peter (набор массы)
        4: 'keto'               # maria (кето)
    }

    # Создаём приёмы пищи для каждого пользователя
    total_meals = 0
    for user_idx, user in enumerate(users):
        diet_type = user_diets[user_idx]

        # Получаем шаблоны для диеты пользователя
        diet_templates = meals_templates.get(diet_type, []) + meals_templates['regular']

        for days_ago in range(14):
            meal_date = date.today() - timedelta(days=days_ago)

            # Определяем количество приёмов пищи
            meals_count_today = user.meals_per_day or random.randint(3, 5)

            # Выбираем случайные блюда с учётом типов (минимум завтрак, обед, ужин)
            breakfasts = [m for m in diet_templates if m['type'] == 'breakfast']
            lunches = [m for m in diet_templates if m['type'] == 'lunch']
            dinners = [m for m in diet_templates if m['type'] == 'dinner']
            snacks = [m for m in diet_templates if m['type'] == 'snack']

            daily_meals = []
            if breakfasts:
                daily_meals.append(random.choice(breakfasts))
            if lunches:
                daily_meals.append(random.choice(lunches))
            if dinners:
                daily_meals.append(random.choice(dinners))

            # Добавляем перекусы если нужно больше приёмов пищи
            while len(daily_meals) < meals_count_today and snacks:
                daily_meals.append(random.choice(snacks))

            for meal_template in daily_meals:
                meal_time = random.choice(times_by_type.get(meal_template['type'], ['12:00']))

                meal = Meal(
                    user_id=user.id,
                    name=meal_template['name'],
                    meal_type=meal_template['type'],
                    meal_date=meal_date,
                    meal_time=meal_time,
                    calories=meal_template['calories'],
                    protein=meal_template['protein'],
                    carbs=meal_template['carbs'],
                    fats=meal_template['fats'],
                    portions=random.choice([0.5, 1, 1, 1, 1.5]),
                    ai_confidence=random.randint(85, 98),
                    health_score=meal_template['health_score'],
                    ai_advice=meal_template.get('ai_advice'),
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
                        calories=ing_data.get('calories', 0),
                        protein=ing_data.get('protein', 0),
                        carbs=ing_data.get('carbs', 0),
                        fats=ing_data.get('fats', 0)
                    )
                    db.session.add(ingredient)

                total_meals += 1

    print(f"  Создано приёмов пищи: {total_meals}")

    # === Замеры тела ===
    measurement_configs = [
        # demo_user - худеет
        {'chest_start': 102, 'waist_start': 92, 'hips_start': 100, 'biceps_start': 36, 'trend': -0.3},
        # admin - стабильно
        {'chest_start': 100, 'waist_start': 85, 'hips_start': 98, 'biceps_start': 38, 'trend': 0},
        # anna - худеет
        {'chest_start': 90, 'waist_start': 72, 'hips_start': 98, 'biceps_start': 28, 'trend': -0.2},
        # peter - набирает массу
        {'chest_start': 105, 'waist_start': 82, 'hips_start': 96, 'biceps_start': 38, 'trend': 0.4},
        # maria - худеет на кето
        {'chest_start': 95, 'waist_start': 78, 'hips_start': 102, 'biceps_start': 30, 'trend': -0.25},
    ]

    total_measurements = 0
    for i, user in enumerate(users):
        config = measurement_configs[i]
        # Создаём замеры раз в неделю за последние 8 недель
        for week in range(8):
            day = date.today() - timedelta(days=week * 7)
            measurement = Measurement(
                user_id=user.id,
                date=day,
                chest=round(config['chest_start'] + week * config['trend'] + random.uniform(-0.5, 0.5), 1),
                waist=round(config['waist_start'] + week * config['trend'] + random.uniform(-0.5, 0.5), 1),
                hips=round(config['hips_start'] + week * config['trend'] * 0.5 + random.uniform(-0.3, 0.3), 1),
                biceps=round(config['biceps_start'] + week * config['trend'] * 0.2 + random.uniform(-0.2, 0.2), 1),
                thigh=round(55 + random.uniform(-1, 1), 1),
                neck=round(38 + random.uniform(-0.5, 0.5), 1),
                notes=random.choice([None, None, 'Утром', 'После тренировки'])
            )
            db.session.add(measurement)
            total_measurements += 1

    print(f"  Создано замеров: {total_measurements}")

    # === Фото прогресса ===
    photo_urls = [
        'https://placehold.co/400x600/e2e8f0/475569?text=Progress+Photo',
        'https://placehold.co/400x600/dbeafe/1e40af?text=Front+View',
        'https://placehold.co/400x600/dcfce7/166534?text=Side+View',
        'https://placehold.co/400x600/fef3c7/92400e?text=Back+View',
    ]
    categories = ['front', 'side', 'back']

    total_photos = 0
    for i, user in enumerate(users[:3]):  # Фото только для первых 3 пользователей
        # Создаём 2-4 фото на пользователя
        num_photos = random.randint(2, 4)
        for j in range(num_photos):
            day = date.today() - timedelta(days=j * 14)  # Каждые 2 недели
            photo = ProgressPhoto(
                user_id=user.id,
                date=day,
                image_url=random.choice(photo_urls),
                category=random.choice(categories),
                notes=random.choice([None, 'Прогресс', 'До тренировки', 'После месяца'])
            )
            db.session.add(photo)
            total_photos += 1

    print(f"  Создано фото прогресса: {total_photos}")

    db.session.commit()
    print("База данных успешно заполнена!")


def clear_all():
    """Очистка всех данных из БД"""
    print("Очистка базы данных...")
    ProgressPhoto.query.delete()
    Measurement.query.delete()
    MealIngredient.query.delete()
    Meal.query.delete()
    WeightEntry.query.delete()
    UserGoals.query.delete()
    User.query.delete()
    db.session.commit()
    print("База данных очищена!")


if __name__ == "__main__":
    from app import app
    with app.app_context():
        clear_all()
        seed_all()
