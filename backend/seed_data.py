from models import (
    db, User, Meal, MealIngredient, UserGoals, WeightEntry, Measurement, ProgressPhoto,
    Group, GroupMember, GroupPost, PostComment, PostLike, ForumTopic, ForumReply, MealPlan,
    Recipe
)
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

    existing_ids = {
        uid for (uid,) in db.session.query(UserGoals.user_id).all()
    }

    created = 0
    for i, user in enumerate(users):
        if user.id in existing_ids:
            continue

        goals = UserGoals(user_id=user.id, **goals_data[i])
        db.session.add(goals)
        created += 1

    print(f"  Созданы цели для {created} пользователей")


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

        # Создаём данные от сегодня до 14 дней в прошлое
        for days_ago in range(-1, 13):  # -1 создаст данные за сегодня и завтра, 0-13 за прошлые дни
            meal_date = date.today() + timedelta(days=days_ago)

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

    # === Группы ===
    groups_data = [
        {
            'name': 'Shred Squad',
            'description': 'Сбрасываем вес вместе! Поддержка, мотивация и здоровые привычки 💪',
            'emoji': '🔥',
            'is_public': True,
        },
        {
            'name': 'Здоровое питание',
            'description': 'Обмен рецептами и советами по правильному питанию',
            'emoji': '🥗',
            'is_public': True,
        },
        {
            'name': 'Марафон 30 дней',
            'description': 'Приватный челлендж на 30 дней. Ежедневные отчёты обязательны!',
            'emoji': '🏃',
            'is_public': False,
        },
    ]

    groups = []
    for i, group_data in enumerate(groups_data):
        owner = users[i % len(users)]
        group = Group(
            name=group_data['name'],
            description=group_data['description'],
            emoji=group_data['emoji'],
            is_public=group_data['is_public'],
            owner_id=owner.id
        )
        db.session.add(group)
        groups.append(group)

    db.session.flush()
    print(f"  Создано групп: {len(groups)}")

    # === Участники групп ===
    total_members = 0
    for group in groups:
        # Владелец автоматически участник
        owner_member = GroupMember(
            group_id=group.id,
            user_id=group.owner_id,
            role='owner'
        )
        db.session.add(owner_member)
        total_members += 1

        # Добавляем других участников
        for user in users:
            if user.id != group.owner_id and random.random() > 0.3:
                member = GroupMember(
                    group_id=group.id,
                    user_id=user.id,
                    role=random.choice(['member', 'member', 'member', 'admin'])
                )
                db.session.add(member)
                total_members += 1

    db.session.flush()
    print(f"  Создано участников групп: {total_members}")

    # === Посты в группах ===
    post_texts = [
        'Сегодня впервые за долгое время уложилась в норму калорий! 🎉',
        'Неделя на правильном питании позади! Минус 2 кг 🔥',
        'Приготовила вкусный низкокалорийный ужин, делюсь рецептом!',
        'Наконец-то достиг своей цели! Спасибо всем за поддержку 💪',
        'Кто-нибудь пробовал интервальное голодание? Какие впечатления?',
        'Утренняя тренировка + правильный завтрак = отличное начало дня!',
    ]

    total_posts = 0
    for group in groups:
        members = GroupMember.query.filter_by(group_id=group.id).all()
        for _ in range(random.randint(3, 8)):
            member = random.choice(members)
            post = GroupPost(
                group_id=group.id,
                user_id=member.user_id,
                text=random.choice(post_texts),
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 72))
            )
            db.session.add(post)
            total_posts += 1

    db.session.flush()
    print(f"  Создано постов: {total_posts}")

    # === Лайки и комментарии ===
    posts = GroupPost.query.all()
    total_likes = 0
    total_comments = 0

    comment_texts = [
        'Отличная работа! Так держать! 💪',
        'Вдохновляешь! 🔥',
        'Супер результат!',
        'Молодец! Продолжай в том же духе!',
        'Класс! Как ты это делаешь?',
    ]

    for post in posts:
        group_members = GroupMember.query.filter_by(group_id=post.group_id).all()

        # Добавляем лайки
        for member in group_members:
            if random.random() > 0.5:
                like = PostLike(post_id=post.id, user_id=member.user_id)
                db.session.add(like)
                total_likes += 1

        # Добавляем комментарии
        for _ in range(random.randint(0, 3)):
            commenter = random.choice(group_members)
            comment = PostComment(
                post_id=post.id,
                user_id=commenter.user_id,
                text=random.choice(comment_texts),
                created_at=datetime.utcnow() - timedelta(hours=random.randint(0, 24))
            )
            db.session.add(comment)
            total_comments += 1

    db.session.flush()
    print(f"  Создано лайков: {total_likes}, комментариев: {total_comments}")

    # === Темы форума ===
    topics_data = [
        {
            'title': 'Как правильно считать калории?',
            'content': 'Привет всем! Подскажите, как вы считаете калории? Используете приложения или вручную? Какой способ точнее?',
            'category': 'question',
            'is_pinned': True,
        },
        {
            'title': 'Рецепт низкокалорийного ужина',
            'content': 'Делюсь своим любимым рецептом!\n\nКуриная грудка с овощами на пару:\n- 200г куриной грудки\n- Брокколи 100г\n- Морковь 50г\n\nВсего 250 ккал!',
            'category': 'recipe',
            'is_pinned': False,
        },
        {
            'title': 'Достиг цели - минус 10 кг!',
            'content': 'Ребята, хочу поделиться радостью! За 3 месяца сбросил 10 кг благодаря правильному питанию и вашей поддержке! 🎉',
            'category': 'achievement',
            'is_pinned': False,
        },
        {
            'title': 'Совет: как не срываться на сладкое',
            'content': 'Делюсь лайфхаком: когда хочется сладкого, съешьте яблоко или выпейте стакан воды с лимоном. Помогает в 90% случаев!',
            'category': 'tip',
            'is_pinned': False,
        },
    ]

    total_topics = 0
    for group in groups:
        members = GroupMember.query.filter_by(group_id=group.id).all()
        for topic_data in random.sample(topics_data, min(len(topics_data), random.randint(2, 4))):
            author = random.choice(members)
            topic = ForumTopic(
                group_id=group.id,
                author_id=author.user_id,
                title=topic_data['title'],
                content=topic_data['content'],
                category=topic_data['category'],
                is_pinned=topic_data['is_pinned'],
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 14)),
                last_activity=datetime.utcnow() - timedelta(hours=random.randint(1, 48))
            )
            db.session.add(topic)
            total_topics += 1

    db.session.flush()
    print(f"  Создано тем форума: {total_topics}")

    # === Ответы в форуме ===
    reply_texts = [
        'Я использую это приложение, очень удобно!',
        'Согласен! Отличный совет!',
        'Спасибо за рецепт, обязательно попробую!',
        'Поздравляю! Отличный результат! 💪',
        'А как долго ты к этому шёл?',
    ]

    topics = ForumTopic.query.all()
    total_replies = 0

    for topic in topics:
        group_members = GroupMember.query.filter_by(group_id=topic.group_id).all()
        for _ in range(random.randint(1, 5)):
            replier = random.choice(group_members)
            reply = ForumReply(
                topic_id=topic.id,
                author_id=replier.user_id,
                content=random.choice(reply_texts),
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
            )
            db.session.add(reply)
            total_replies += 1

    print(f"  Создано ответов в форуме: {total_replies}")

    # === Рецепты ===
    seed_recipes()

    db.session.commit()
    print("База данных успешно заполнена!")


def seed_recipes():
    """Заполнение таблицы рецептов"""
    print("  Заполнение рецептов...")

    recipes_data = [
        # ЗАВТРАКИ (10 рецептов)
        {
            'id': 1,
            'name': 'Овсяноблин с творогом',
            'image': '../../imgs/ovsuanoblin.jpg',
            'time': 10,
            'calories': 280,
            'protein': 22,
            'carbs': 28,
            'fats': 8,
            'difficulty': 'easy',
            'category': 'breakfast',
            'tags': ['ПП', 'Высокобелковое', 'Быстро'],
            'ingredients': [
                '50г овсяных хлопьев',
                '100г творога 5%',
                '2 яйца',
                '50мл молока',
                'Щепотка соли',
                'Подсластитель по вкусу'
            ],
            'steps': [
                'Взбейте яйца с молоком и солью',
                'Добавьте овсяные хлопья, перемешайте',
                'Дайте тесту постоять 5 минут',
                'Вылейте на разогретую сковороду',
                'Жарьте под крышкой 3-4 минуты с каждой стороны',
                'Намажьте творогом, сверните рулетом'
            ]
        },
        {
            'id': 2,
            'name': 'Протеиновые панкейки',
            'image': '../../imgs/proteinovie_pankeiki.jpeg',
            'time': 15,
            'calories': 320,
            'protein': 35,
            'carbs': 30,
            'fats': 6,
            'difficulty': 'easy',
            'category': 'breakfast',
            'tags': ['ПП', 'Высокобелковое', 'Завтрак'],
            'ingredients': [
                '1 банан',
                '2 яйца',
                '30г протеинового порошка',
                '50г овсяной муки',
                '100мл молока',
                'Разрыхлитель 1 ч.л.'
            ],
            'steps': [
                'Разомните банан вилкой',
                'Добавьте яйца и взбейте',
                'Всыпьте протеин, овсяную муку, разрыхлитель',
                'Влейте молоко, перемешайте до однородности',
                'Жарьте небольшие панкейки по 2 минуты с каждой стороны',
                'Подавайте с ягодами или сиропом без сахара'
            ]
        },
        {
            'id': 3,
            'name': 'Яичница со шпинатом и авокадо',
            'image': '../../imgs/Яичница со шпинатом и авокадо.jpg',
            'time': 12,
            'calories': 350,
            'protein': 18,
            'carbs': 12,
            'fats': 26,
            'difficulty': 'easy',
            'category': 'breakfast',
            'tags': ['Кето', 'Низкоуглеводное', 'ПП'],
            'ingredients': [
                '3 яйца',
                '100г шпината',
                '1/2 авокадо',
                '1 ч.л. оливкового масла',
                'Соль, перец',
                'Семена кунжута'
            ],
            'steps': [
                'Обжарьте шпинат на оливковом масле 2 минуты',
                'Разбейте яйца на шпинат',
                'Жарьте под крышкой до готовности белка',
                'Нарежьте авокадо',
                'Выложите яичницу на тарелку',
                'Добавьте авокадо, посыпьте кунжутом'
            ]
        },
        {
            'id': 4,
            'name': 'Греческий йогурт с гранолой',
            'image': '../../imgs/Греческий йогурт с гранолой.jpg',
            'time': 5,
            'calories': 280,
            'protein': 20,
            'carbs': 35,
            'fats': 8,
            'difficulty': 'easy',
            'category': 'breakfast',
            'tags': ['ПП', 'Быстро', 'Завтрак'],
            'ingredients': [
                '200г греческого йогурта',
                '50г гранолы без сахара',
                '100г ягод (черника, клубника)',
                '1 ст.л. мёда',
                '10г миндальных лепестков'
            ],
            'steps': [
                'Выложите йогурт в миску',
                'Сверху насыпьте гранолу',
                'Добавьте свежие ягоды',
                'Полейте мёдом',
                'Посыпьте миндальными лепестками'
            ]
        },
        {
            'id': 5,
            'name': 'Омлет с овощами',
            'image': '../../imgs/Омлет с овощами.webp',
            'time': 15,
            'calories': 240,
            'protein': 20,
            'carbs': 10,
            'fats': 14,
            'difficulty': 'easy',
            'category': 'breakfast',
            'tags': ['ПП', 'Низкоуглеводное', 'Завтрак'],
            'ingredients': [
                '3 яйца',
                '100г помидоров черри',
                '50г болгарского перца',
                '50г шампиньонов',
                '30мл молока',
                'Зелень, соль'
            ],
            'steps': [
                'Нарежьте овощи мелкими кубиками',
                'Обжарьте овощи 3-4 минуты',
                'Взбейте яйца с молоком и солью',
                'Залейте овощи яичной смесью',
                'Готовьте под крышкой 5 минут на медленном огне',
                'Посыпьте зеленью перед подачей'
            ]
        },
        {
            'id': 6,
            'name': 'Творожная запеканка',
            'image': '../../imgs/Творожная запеканка.jfif',
            'time': 45,
            'calories': 220,
            'protein': 18,
            'carbs': 22,
            'fats': 7,
            'difficulty': 'medium',
            'category': 'breakfast',
            'tags': ['ПП', 'Высокобелковое'],
            'ingredients': [
                '400г творога 5%',
                '2 яйца',
                '3 ст.л. овсяной муки',
                '2 ст.л. мёда',
                '1 ч.л. разрыхлителя',
                'Ванилин'
            ],
            'steps': [
                'Разотрите творог с яйцами',
                'Добавьте мёд, ванилин, муку, разрыхлитель',
                'Хорошо перемешайте',
                'Выложите в форму',
                'Запекайте при 180°C 35-40 минут',
                'Остудите перед подачей'
            ]
        },
        {
            'id': 7,
            'name': 'Смузи-боул с ягодами',
            'image': '../../imgs/Смузи-боул с ягодами.jpg',
            'time': 10,
            'calories': 290,
            'protein': 15,
            'carbs': 42,
            'fats': 8,
            'difficulty': 'easy',
            'category': 'breakfast',
            'tags': ['ПП', 'Веганское', 'Быстро'],
            'ingredients': [
                '1 замороженный банан',
                '150г замороженных ягод',
                '100мл миндального молока',
                '1 ст.л. семян чиа',
                '30г гранолы',
                'Свежие ягоды для топпинга'
            ],
            'steps': [
                'Смешайте банан, ягоды и молоко в блендере',
                'Взбейте до кремообразной консистенции',
                'Вылейте в миску',
                'Сверху выложите гранолу',
                'Добавьте свежие ягоды',
                'Посыпьте семенами чиа'
            ]
        },
        {
            'id': 8,
            'name': 'Тосты с авокадо и яйцом пашот',
            'image': '../../imgs/Тосты с авокадо и яйцом пашот.jpg',
            'time': 15,
            'calories': 380,
            'protein': 18,
            'carbs': 32,
            'fats': 22,
            'difficulty': 'medium',
            'category': 'breakfast',
            'tags': ['ПП', 'Завтрак'],
            'ingredients': [
                '2 ломтика цельнозернового хлеба',
                '1 авокадо',
                '2 яйца',
                'Лимонный сок',
                'Соль, перец, хлопья чили',
                'Зелень'
            ],
            'steps': [
                'Подсушите хлеб в тостере',
                'Разомните авокадо с лимонным соком, солью, перцем',
                'Вскипятите воду, создайте воронку',
                'Аккуратно опустите яйца, варите 3 минуты',
                'Намажьте хлеб авокадо',
                'Сверху положите яйцо пашот, посыпьте специями'
            ]
        },
        {
            'id': 9,
            'name': 'Сырники на овсяной муке',
            'image': '../../imgs/Сырники на овсяной муке.jpg',
            'time': 20,
            'calories': 260,
            'protein': 20,
            'carbs': 26,
            'fats': 8,
            'difficulty': 'easy',
            'category': 'breakfast',
            'tags': ['ПП', 'Высокобелковое'],
            'ingredients': [
                '300г творога 5%',
                '1 яйцо',
                '50г овсяной муки',
                '2 ст.л. мёда',
                'Ванилин',
                'Щепотка соли'
            ],
            'steps': [
                'Смешайте творог с яйцом',
                'Добавьте муку, мёд, ванилин, соль',
                'Сформируйте сырники',
                'Обваляйте в овсяной муке',
                'Жарьте на антипригарной сковороде по 3 минуты с каждой стороны',
                'Подавайте с натуральным йогуртом'
            ]
        },
        {
            'id': 10,
            'name': 'Овсянка с яблоком и корицей',
            'image': '../../imgs/Овсянка с яблоком и корицей.jpg',
            'time': 10,
            'calories': 280,
            'protein': 10,
            'carbs': 48,
            'fats': 6,
            'difficulty': 'easy',
            'category': 'breakfast',
            'tags': ['ПП', 'Веганское', 'Быстро'],
            'ingredients': [
                '50г овсяных хлопьев',
                '200мл молока',
                '1 яблоко',
                '1 ч.л. корицы',
                '1 ст.л. мёда',
                'Горсть грецких орехов'
            ],
            'steps': [
                'Залейте овсянку молоком, варите 5 минут',
                'Нарежьте яблоко кубиками',
                'Добавьте яблоко к овсянке за 2 минуты до готовности',
                'Приправьте корицей',
                'Полейте мёдом',
                'Посыпьте измельчёнными орехами'
            ]
        },

        # ОБЕДЫ (15 рецептов)
        {
            'id': 11,
            'name': 'Куриная грудка с овощами гриль',
            'image': '../../imgs/Куриная грудка с овощами гриль.jfif',
            'time': 30,
            'calories': 420,
            'protein': 45,
            'carbs': 28,
            'fats': 12,
            'difficulty': 'easy',
            'category': 'lunch',
            'tags': ['ПП', 'Высокобелковое', 'Низкоуглеводное'],
            'ingredients': [
                '200г куриной грудки',
                '150г брокколи',
                '100г моркови',
                '100г цукини',
                '2 ст.л. оливкового масла',
                'Специи, чеснок'
            ],
            'steps': [
                'Нарежьте курицу и замаринуйте в специях 15 минут',
                'Нарежьте овощи крупными кусками',
                'Обжарьте курицу на гриле по 5 минут с каждой стороны',
                'Отварите брокколи 5 минут',
                'Обжарьте морковь и цукини на гриле',
                'Выложите всё на тарелку, полейте оливковым маслом'
            ]
        },
        {
            'id': 12,
            'name': 'Лосось с киноа и авокадо',
            'image': '../../imgs/Лосось с киноа и авокадо.jfif',
            'time': 25,
            'calories': 520,
            'protein': 38,
            'carbs': 35,
            'fats': 24,
            'difficulty': 'medium',
            'category': 'lunch',
            'tags': ['ПП', 'Высокобелковое', 'Омега-3'],
            'ingredients': [
                '150г лосося',
                '100г киноа',
                '1/2 авокадо',
                'Лимон',
                'Шпинат 50г',
                'Оливковое масло'
            ],
            'steps': [
                'Отварите киноа согласно инструкции',
                'Запеките лосось при 180°C 15 минут',
                'Обжарьте шпинат 2 минуты',
                'Нарежьте авокадо',
                'Выложите киноа, сверху шпинат',
                'Добавьте лосось и авокадо, полейте лимонным соком'
            ]
        },
        {
            'id': 13,
            'name': 'Греческий салат с курицей',
            'image': '../../imgs/Греческий салат с курицей.jpg',
            'time': 20,
            'calories': 380,
            'protein': 35,
            'carbs': 15,
            'fats': 22,
            'difficulty': 'easy',
            'category': 'lunch',
            'tags': ['ПП', 'Высокобелковое', 'Салат'],
            'ingredients': [
                '150г куриной грудки',
                '100г помидоров черри',
                '100г огурцов',
                '50г феты',
                '30г маслин',
                'Оливковое масло, лимон'
            ],
            'steps': [
                'Отварите или запеките курицу',
                'Нарежьте помидоры пополам, огурцы кубиками',
                'Нарежьте курицу',
                'Смешайте овощи, курицу, маслины',
                'Покрошите сверху фету',
                'Заправьте маслом и лимонным соком'
            ]
        },
        {
            'id': 14,
            'name': 'Говядина с бурым рисом',
            'image': '../../imgs/Говядина с бурым рисом.jfif',
            'time': 40,
            'calories': 480,
            'protein': 42,
            'carbs': 45,
            'fats': 14,
            'difficulty': 'medium',
            'category': 'lunch',
            'tags': ['ПП', 'Высокобелковое'],
            'ingredients': [
                '200г говядины',
                '100г бурого риса',
                '1 луковица',
                '2 зубчика чеснока',
                'Соевый соус',
                'Овощи для гарнира'
            ],
            'steps': [
                'Отварите бурый рис 30 минут',
                'Нарежьте говядину тонкими полосками',
                'Обжарьте лук и чеснок',
                'Добавьте говядину, жарьте 7 минут',
                'Влейте соевый соус, тушите 5 минут',
                'Подавайте с рисом и овощами'
            ]
        },
        {
            'id': 15,
            'name': 'Чечевичный суп',
            'image': '../../imgs/Чечевичный суп.webp',
            'time': 35,
            'calories': 320,
            'protein': 18,
            'carbs': 48,
            'fats': 6,
            'difficulty': 'easy',
            'category': 'lunch',
            'tags': ['ПП', 'Веганское', 'Суп'],
            'ingredients': [
                '200г красной чечевицы',
                '1 луковица',
                '2 моркови',
                '2 помидора',
                'Специи (куркума, кумин)',
                '1л овощного бульона'
            ],
            'steps': [
                'Обжарьте лук и тёртую морковь',
                'Добавьте нарезанные помидоры',
                'Всыпьте чечевицу и специи',
                'Залейте бульоном',
                'Варите 25 минут до мягкости чечевицы',
                'Пюрируйте блендером или оставьте кусочками'
            ]
        },
        {
            'id': 16,
            'name': 'Индейка с овощами в духовке',
            'image': '../../imgs/Индейка с овощами в духовке.jpg',
            'time': 45,
            'calories': 380,
            'protein': 40,
            'carbs': 30,
            'fats': 10,
            'difficulty': 'easy',
            'category': 'lunch',
            'tags': ['ПП', 'Высокобелковое'],
            'ingredients': [
                '200г грудки индейки',
                '200г брокколи',
                '150г сладкого картофеля',
                '100г брюссельской капусты',
                'Оливковое масло',
                'Травы, специи'
            ],
            'steps': [
                'Нарежьте индейку и овощи',
                'Выложите на противень',
                'Полейте оливковым маслом, приправьте',
                'Запекайте при 200°C 35 минут',
                'Переверните индейку через 20 минут',
                'Подавайте горячим'
            ]
        },
        {
            'id': 17,
            'name': 'Боул с тунцом и киноа',
            'image': '../../imgs/Боул с тунцом и киноа.jpg',
            'time': 20,
            'calories': 420,
            'protein': 38,
            'carbs': 40,
            'fats': 12,
            'difficulty': 'easy',
            'category': 'lunch',
            'tags': ['ПП', 'Высокобелковое', 'Быстро'],
            'ingredients': [
                '150г консервированного тунца',
                '100г киноа',
                '100г эдамаме',
                '50г кукурузы',
                '1 авокадо',
                'Соевый соус, кунжут'
            ],
            'steps': [
                'Отварите киноа',
                'Отварите эдамаме 5 минут',
                'Слейте жидкость с тунца',
                'Выложите в миску киноа',
                'Добавьте тунец, эдамаме, кукурузу, авокадо',
                'Полейте соевым соусом, посыпьте кунжутом'
            ]
        },
        {
            'id': 18,
            'name': 'Куриный суп с лапшой',
            'image': '../../imgs/Куриный суп с лапшой.jfif',
            'time': 40,
            'calories': 280,
            'protein': 25,
            'carbs': 30,
            'fats': 6,
            'difficulty': 'easy',
            'category': 'lunch',
            'tags': ['ПП', 'Суп', 'Высокобелковое'],
            'ingredients': [
                '150г куриной грудки',
                '100г цельнозерновой лапши',
                '2 моркови',
                '1 луковица',
                'Сельдерей',
                '1.5л куриного бульона'
            ],
            'steps': [
                'Отварите курицу в бульоне 20 минут',
                'Достаньте курицу, нарежьте',
                'В бульон добавьте нарезанные овощи',
                'Варите 10 минут',
                'Добавьте лапшу, варите 7 минут',
                'Верните курицу, прогрейте 2 минуты'
            ]
        },
        {
            'id': 19,
            'name': 'Фаршированные перцы с индейкой',
            'image': '../../imgs/Фаршированные перцы с индейкой.jpg',
            'time': 60,
            'calories': 340,
            'protein': 32,
            'carbs': 35,
            'fats': 8,
            'difficulty': 'medium',
            'category': 'lunch',
            'tags': ['ПП', 'Высокобелковое'],
            'ingredients': [
                '4 болгарских перца',
                '300г фарша индейки',
                '100г бурого риса',
                '1 луковица',
                '200мл томатного соуса',
                'Специи'
            ],
            'steps': [
                'Отварите рис наполовину',
                'Обжарьте фарш с луком',
                'Смешайте фарш с рисом',
                'Срежьте верхушки перцев, удалите семена',
                'Нафаршируйте перцы, залейте томатным соусом',
                'Запекайте под крышкой при 180°C 45 минут'
            ]
        },
        {
            'id': 20,
            'name': 'Рыбные котлеты с овощами',
            'image': '../../imgs/Рыбные котлеты с овощами.jfif',
            'time': 35,
            'calories': 320,
            'protein': 35,
            'carbs': 20,
            'fats': 12,
            'difficulty': 'medium',
            'category': 'lunch',
            'tags': ['ПП', 'Высокобелковое'],
            'ingredients': [
                '300г филе белой рыбы',
                '1 яйцо',
                '2 ст.л. овсяных хлопьев',
                '1 луковица',
                'Зелень',
                'Овощи на гарнир'
            ],
            'steps': [
                'Измельчите рыбу в блендере',
                'Добавьте яйцо, овсянку, лук, зелень',
                'Сформируйте котлеты',
                'Запекайте при 180°C 25 минут',
                'Или жарьте на антипригарной сковороде',
                'Подавайте с овощами на пару'
            ]
        },
        {
            'id': 21,
            'name': 'Цезарь с курицей (ПП версия)',
            'image': '../../imgs/Цезарь с курицей (ПП версия).webp',
            'time': 25,
            'calories': 360,
            'protein': 38,
            'carbs': 20,
            'fats': 16,
            'difficulty': 'easy',
            'category': 'lunch',
            'tags': ['ПП', 'Высокобелковое', 'Салат'],
            'ingredients': [
                '150г куриной грудки',
                'Салат романо',
                '2 ломтика цельнозернового хлеба',
                '30г пармезана',
                'Греческий йогурт для соуса',
                'Чеснок, анчоусы, лимон'
            ],
            'steps': [
                'Запеките курицу',
                'Нарежьте хлеб кубиками, подсушите в духовке',
                'Приготовьте соус из йогурта, чеснока, анчоусов, лимона',
                'Порвите салат руками',
                'Смешайте салат с соусом',
                'Добавьте курицу, сухарики, пармезан'
            ]
        },
        {
            'id': 22,
            'name': 'Ризотто с грибами (диетическое)',
            'image': '../../imgs/Ризотто с грибами (диетическое).jpg',
            'time': 35,
            'calories': 380,
            'protein': 12,
            'carbs': 58,
            'fats': 10,
            'difficulty': 'medium',
            'category': 'lunch',
            'tags': ['ПП', 'Веганское'],
            'ingredients': [
                '150г бурого риса',
                '200г шампиньонов',
                '1 луковица',
                '500мл овощного бульона',
                '30г пармезана',
                'Белое вино (опционально)'
            ],
            'steps': [
                'Обжарьте лук до прозрачности',
                'Добавьте нарезанные грибы, жарьте 5 минут',
                'Всыпьте рис, обжаривайте 2 минуты',
                'Добавляйте бульон по половнику, постоянно помешивая',
                'Готовьте 25-30 минут до мягкости риса',
                'В конце добавьте тёртый пармезан'
            ]
        },
        {
            'id': 23,
            'name': 'Куриное филе с брокколи в азиатском стиле',
            'image': '../../imgs/Куриное филе с брокколи в азиатском стиле.jpg',
            'time': 20,
            'calories': 340,
            'protein': 40,
            'carbs': 22,
            'fats': 10,
            'difficulty': 'easy',
            'category': 'lunch',
            'tags': ['ПП', 'Высокобелковое', 'Быстро'],
            'ingredients': [
                '200г куриного филе',
                '200г брокколи',
                '2 ст.л. соевого соуса',
                '1 ст.л. кунжутного масла',
                'Имбирь, чеснок',
                'Кунжут'
            ],
            'steps': [
                'Нарежьте курицу кубиками',
                'Обжарьте имбирь и чеснок',
                'Добавьте курицу, жарьте 5 минут',
                'Добавьте брокколи и соевый соус',
                'Тушите под крышкой 7 минут',
                'Посыпьте кунжутом перед подачей'
            ]
        },
        {
            'id': 24,
            'name': 'Овощное рагу с нутом',
            'image': '../../imgs/Овощное рагу с нутом.jpg',
            'time': 40,
            'calories': 320,
            'protein': 14,
            'carbs': 52,
            'fats': 8,
            'difficulty': 'easy',
            'category': 'lunch',
            'tags': ['ПП', 'Веганское', 'Суп'],
            'ingredients': [
                '200г нута (варёного)',
                '2 кабачка',
                '2 моркови',
                '1 баклажан',
                '400мл томатов в собственном соку',
                'Специи (паприка, кумин)'
            ],
            'steps': [
                'Нарежьте овощи кубиками',
                'Обжарьте лук и морковь',
                'Добавьте остальные овощи, жарьте 5 минут',
                'Влейте томаты, добавьте нут',
                'Приправьте специями',
                'Тушите 25 минут до мягкости'
            ]
        },
        {
            'id': 25,
            'name': 'Стейк из говядины с запечённым картофелем',
            'image': '../../imgs/Стейк из говядины с запечённым картофелем.jpg',
            'time': 40,
            'calories': 520,
            'protein': 45,
            'carbs': 40,
            'fats': 18,
            'difficulty': 'medium',
            'category': 'lunch',
            'tags': ['Высокобелковое', 'Обед'],
            'ingredients': [
                '200г говяжьего стейка',
                '2 картофелины',
                'Брокколи на гарнир',
                'Оливковое масло',
                'Розмарин, чеснок',
                'Соль, перец'
            ],
            'steps': [
                'Натрите картофель маслом и специями, запекайте 35 минут при 200°C',
                'Посолите стейк за 30 минут до готовки',
                'Разогрейте сковороду до максимума',
                'Жарьте стейк по 3-4 минуты с каждой стороны',
                'Дайте мясу отдохнуть 5 минут',
                'Подавайте с картофелем и брокколи'
            ]
        },

        # УЖИНЫ (15 рецептов)
        {
            'id': 26,
            'name': 'Запечённая рыба с овощами',
            'image': '../../imgs/Запечённая рыба с овощами.jfif',
            'time': 30,
            'calories': 320,
            'protein': 35,
            'carbs': 20,
            'fats': 12,
            'difficulty': 'easy',
            'category': 'dinner',
            'tags': ['ПП', 'Высокобелковое', 'Ужин'],
            'ingredients': [
                '200г филе белой рыбы',
                '150г спаржи',
                '100г помидоров черри',
                '1 лимон',
                'Оливковое масло',
                'Травы'
            ],
            'steps': [
                'Выложите рыбу на фольгу',
                'Разложите вокруг овощи',
                'Полейте маслом, сбрызните лимоном',
                'Посыпьте травами',
                'Заверните в фольгу',
                'Запекайте при 180°C 25 минут'
            ]
        },
        {
            'id': 27,
            'name': 'Куриные котлеты на пару',
            'image': '../../imgs/Куриные котлеты на пару.jfif',
            'time': 30,
            'calories': 280,
            'protein': 38,
            'carbs': 15,
            'fats': 8,
            'difficulty': 'easy',
            'category': 'dinner',
            'tags': ['ПП', 'Высокобелковое', 'Диетическое'],
            'ingredients': [
                '300г куриного фарша',
                '1 луковица',
                '1 кабачок',
                '1 яйцо',
                'Зелень',
                'Специи'
            ],
            'steps': [
                'Натрите кабачок, отожмите лишнюю влагу',
                'Смешайте фарш, лук, кабачок, яйцо, зелень',
                'Посолите, поперчите',
                'Сформируйте котлеты',
                'Готовьте на пару 25 минут',
                'Подавайте с овощами или салатом'
            ]
        },
        {
            'id': 28,
            'name': 'Омлет с креветками',
            'image': '../../imgs/Омлет с креветками.jpg',
            'time': 15,
            'calories': 280,
            'protein': 32,
            'carbs': 8,
            'fats': 14,
            'difficulty': 'easy',
            'category': 'dinner',
            'tags': ['ПП', 'Высокобелковое', 'Быстро'],
            'ingredients': [
                '150г креветок',
                '3 яйца',
                'Шпинат',
                'Помидоры черри',
                'Чеснок',
                'Оливковое масло'
            ],
            'steps': [
                'Обжарьте чеснок и креветки 3 минуты',
                'Добавьте шпинат, тушите 2 минуты',
                'Взбейте яйца с солью',
                'Залейте креветки яйцами',
                'Добавьте помидоры',
                'Готовьте под крышкой 5 минут'
            ]
        },
        {
            'id': 29,
            'name': 'Курица терияки с овощами',
            'image': '../../imgs/Курица терияки с овощами.jfif',
            'time': 35,
            'calories': 380,
            'protein': 42,
            'carbs': 30,
            'fats': 10,
            'difficulty': 'medium',
            'category': 'dinner',
            'tags': ['ПП', 'Высокобелковое'],
            'ingredients': [
                '200г куриной грудки',
                '3 ст.л. соевого соуса',
                '2 ст.л. мёда',
                'Имбирь, чеснок',
                'Брокколи, морковь',
                'Кунжут'
            ],
            'steps': [
                'Смешайте соевый соус, мёд, имбирь, чеснок',
                'Замаринуйте курицу на 20 минут',
                'Обжарьте курицу до золотистости',
                'Добавьте овощи и маринад',
                'Тушите 10 минут',
                'Посыпьте кунжутом'
            ]
        },
        {
            'id': 30,
            'name': 'Фрикадельки из индейки в томатном соусе',
            'image': '../../imgs/Фрикадельки из индейки в томатном соусе.jfif',
            'time': 40,
            'calories': 340,
            'protein': 38,
            'carbs': 22,
            'fats': 12,
            'difficulty': 'medium',
            'category': 'dinner',
            'tags': ['ПП', 'Высокобелковое'],
            'ingredients': [
                '300г фарша индейки',
                '1 яйцо',
                '2 ст.л. овсяных хлопьев',
                '400мл томатов в собственном соку',
                'Базилик, орегано',
                'Чеснок'
            ],
            'steps': [
                'Смешайте фарш, яйцо, овсянку, специи',
                'Сформируйте небольшие фрикадельки',
                'Обжарьте фрикадельки со всех сторон',
                'Приготовьте томатный соус с чесноком и травами',
                'Залейте фрикадельки соусом',
                'Тушите 20 минут под крышкой'
            ]
        },
        {
            'id': 31,
            'name': 'Тофу с овощами в кисло-сладком соусе',
            'image': '../../imgs/Тофу с овощами в кисло-сладком соусе.jfif',
            'time': 25,
            'calories': 280,
            'protein': 16,
            'carbs': 35,
            'fats': 10,
            'difficulty': 'easy',
            'category': 'dinner',
            'tags': ['ПП', 'Веганское', 'Быстро'],
            'ingredients': [
                '200г твёрдого тофу',
                'Болгарский перец',
                'Ананас консервированный',
                '2 ст.л. соевого соуса',
                '2 ст.л. рисового уксуса',
                '1 ст.л. мёда'
            ],
            'steps': [
                'Нарежьте тофу кубиками, обжарьте до золотистости',
                'Нарежьте перец и ананас',
                'Смешайте соевый соус, уксус, мёд',
                'Обжарьте овощи 5 минут',
                'Добавьте тофу и соус',
                'Тушите 5 минут'
            ]
        },
        {
            'id': 32,
            'name': 'Запечённые куриные бедра с розмарином',
            'image': '../../imgs/Запечённые куриные бедра с розмарином.jpg',
            'time': 50,
            'calories': 420,
            'protein': 40,
            'carbs': 15,
            'fats': 24,
            'difficulty': 'easy',
            'category': 'dinner',
            'tags': ['Высокобелковое', 'Ужин'],
            'ingredients': [
                '2 куриных бедра без кожи',
                'Розмарин свежий',
                '3 зубчика чеснока',
                'Лимон',
                'Картофель мелкий',
                'Оливковое масло'
            ],
            'steps': [
                'Натрите курицу специями, розмарином, чесноком',
                'Разрежьте картофель пополам',
                'Выложите курицу и картофель на противень',
                'Полейте маслом, сбрызните лимоном',
                'Запекайте при 200°C 45 минут',
                'Переворачивайте через 25 минут'
            ]
        },
        {
            'id': 33,
            'name': 'Рыбные тефтели с цукини',
            'image': '../../imgs/Рыбные тефтели с цукини.jpg',
            'time': 35,
            'calories': 300,
            'protein': 34,
            'carbs': 18,
            'fats': 10,
            'difficulty': 'medium',
            'category': 'dinner',
            'tags': ['ПП', 'Высокобелковое', 'Диетическое'],
            'ingredients': [
                '300г филе белой рыбы',
                '1 средний цукини',
                '1 яйцо',
                'Зелень укропа',
                '2 ст.л. овсяной муки',
                'Греческий йогурт для подачи'
            ],
            'steps': [
                'Измельчите рыбу в блендере',
                'Натрите цукини, отожмите',
                'Смешайте рыбу, цукини, яйцо, муку, укроп',
                'Сформируйте тефтели',
                'Запекайте при 180°C 25 минут',
                'Подавайте с йогуртовым соусом'
            ]
        },
        {
            'id': 34,
            'name': 'Салат с тунцом и фасолью',
            'image': '../../imgs/Салат с тунцом и фасолью.jpg',
            'time': 15,
            'calories': 320,
            'protein': 28,
            'carbs': 32,
            'fats': 10,
            'difficulty': 'easy',
            'category': 'dinner',
            'tags': ['ПП', 'Высокобелковое', 'Быстро', 'Салат'],
            'ingredients': [
                '150г консервированного тунца',
                '200г консервированной белой фасоли',
                'Помидоры черри',
                'Красный лук',
                'Руккола',
                'Лимон, оливковое масло'
            ],
            'steps': [
                'Слейте жидкость с тунца и фасоли',
                'Нарежьте помидоры пополам',
                'Тонко нарежьте лук',
                'Смешайте все ингредиенты с рукколой',
                'Заправьте маслом и лимонным соком',
                'Приправьте солью и перцем'
            ]
        },
        {
            'id': 35,
            'name': 'Куриная грудка в йогуртовом маринаде',
            'image': '../../imgs/Куриная грудка в йогуртовом маринаде.jpg',
            'time': 120,
            'calories': 280,
            'protein': 42,
            'carbs': 10,
            'fats': 8,
            'difficulty': 'easy',
            'category': 'dinner',
            'tags': ['ПП', 'Высокобелковое'],
            'ingredients': [
                '200г куриной грудки',
                '100г греческого йогурта',
                '2 зубчика чеснока',
                'Паприка, куркума',
                'Лимонный сок',
                'Свежая зелень'
            ],
            'steps': [
                'Смешайте йогурт, специи, чеснок, лимонный сок',
                'Замаринуйте курицу минимум на 2 часа',
                'Разогрейте духовку до 200°C',
                'Запекайте курицу 25 минут',
                'Дайте отдохнуть 5 минут',
                'Подавайте с овощами или салатом'
            ]
        },
        {
            'id': 36,
            'name': 'Спагетти из цукини с креветками',
            'image': '../../imgs/Спагетти из цукини с креветками.jpg',
            'time': 20,
            'calories': 240,
            'protein': 28,
            'carbs': 15,
            'fats': 10,
            'difficulty': 'easy',
            'category': 'dinner',
            'tags': ['ПП', 'Низкоуглеводное', 'Быстро'],
            'ingredients': [
                '200г креветок',
                '2 крупных цукини',
                '2 зубчика чеснока',
                'Помидоры черри',
                'Оливковое масло',
                'Базилик'
            ],
            'steps': [
                'Сделайте лапшу из цукини спирализатором или овощечисткой',
                'Обжарьте чеснок в масле',
                'Добавьте креветки, жарьте 3 минуты',
                'Добавьте помидоры, тушите 2 минуты',
                'Добавьте лапшу из цукини, прогревайте 2 минуты',
                'Посыпьте базиликом'
            ]
        },
        {
            'id': 37,
            'name': 'Запечённая скумбрия с лимоном',
            'image': '../../imgs/Запечённая скумбрия с лимоном.webp',
            'time': 30,
            'calories': 380,
            'protein': 35,
            'carbs': 5,
            'fats': 26,
            'difficulty': 'easy',
            'category': 'dinner',
            'tags': ['Высокобелковое', 'Омега-3', 'Ужин'],
            'ingredients': [
                '1 целая скумбрия',
                '1 лимон',
                'Розмарин',
                'Чеснок',
                'Оливковое масло',
                'Овощи на гарнир'
            ],
            'steps': [
                'Очистите и выпотрошите рыбу',
                'Сделайте надрезы, вставьте дольки лимона',
                'Натрите специями снаружи и внутри',
                'Полейте маслом',
                'Запекайте при 200°C 25 минут',
                'Подавайте с овощами'
            ]
        },
        {
            'id': 38,
            'name': 'Куриные шашлычки с овощами',
            'image': '../../imgs/Куриные шашлычки с овощами.webp',
            'time': 30,
            'calories': 320,
            'protein': 38,
            'carbs': 20,
            'fats': 10,
            'difficulty': 'easy',
            'category': 'dinner',
            'tags': ['ПП', 'Высокобелковое', 'Гриль'],
            'ingredients': [
                '200г куриной грудки',
                'Болгарский перец',
                'Кабачок',
                'Помидоры черри',
                'Лук',
                'Маринад (йогурт, специи)'
            ],
            'steps': [
                'Нарежьте курицу и овощи крупными кусками',
                'Замаринуйте курицу 20 минут',
                'Нанижите на шпажки, чередуя курицу и овощи',
                'Жарьте на гриле по 5 минут с каждой стороны',
                'Или запеките в духовке при 200°C 20 минут',
                'Подавайте горячими'
            ]
        },
        {
            'id': 39,
            'name': 'Фаршированные кабачки с мясом',
            'image': '../../imgs/Фаршированные кабачки с мясом.jfif',
            'time': 50,
            'calories': 320,
            'protein': 30,
            'carbs': 18,
            'fats': 14,
            'difficulty': 'medium',
            'category': 'dinner',
            'tags': ['ПП', 'Высокобелковое'],
            'ingredients': [
                '2 крупных кабачка',
                '200г говяжьего фарша',
                '1 луковица',
                'Помидоры',
                'Моцарелла',
                'Зелень, специи'
            ],
            'steps': [
                'Разрежьте кабачки вдоль, удалите мякоть',
                'Обжарьте фарш с луком',
                'Добавьте мякоть кабачков и помидоры',
                'Тушите 10 минут',
                'Нафаршируйте лодочки из кабачков',
                'Посыпьте сыром, запекайте 30 минут при 180°C'
            ]
        },
        {
            'id': 40,
            'name': 'Котлеты из чечевицы',
            'image': '../../imgs/Котлеты из чечевицы.jpg',
            'time': 40,
            'calories': 260,
            'protein': 14,
            'carbs': 38,
            'fats': 6,
            'difficulty': 'medium',
            'category': 'dinner',
            'tags': ['ПП', 'Веганское', 'Диетическое'],
            'ingredients': [
                '200г красной чечевицы',
                '1 луковица',
                '2 зубчика чеснока',
                '50г овсяных хлопьев',
                'Кумин, кориандр',
                'Зелень'
            ],
            'steps': [
                'Отварите чечевицу до мягкости',
                'Обжарьте лук и чеснок',
                'Смешайте чечевицу, лук, овсянку, специи',
                'Разомните вилкой',
                'Сформируйте котлеты',
                'Запекайте при 180°C 25 минут или жарьте'
            ]
        },

        # ПЕРЕКУСЫ (10 рецептов)
        {
            'id': 41,
            'name': 'Протеиновые шарики',
            'image': '../../imgs/Протеиновые шарики.jpeg',
            'time': 15,
            'calories': 180,
            'protein': 12,
            'carbs': 20,
            'fats': 6,
            'difficulty': 'easy',
            'category': 'snack',
            'tags': ['ПП', 'Высокобелковое', 'Перекус'],
            'ingredients': [
                '100г овсяных хлопьев',
                '50г протеинового порошка',
                '50г арахисовой пасты',
                '30мл мёда',
                'Какао',
                'Кокосовая стружка'
            ],
            'steps': [
                'Смешайте все ингредиенты кроме стружки',
                'Сформируйте шарики размером с грецкий орех',
                'Обваляйте в кокосовой стружке или какао',
                'Уберите в холодильник на 30 минут',
                'Храните в контейнере до недели',
                'Идеальный перекус перед тренировкой'
            ]
        },
        {
            'id': 42,
            'name': 'Хумус с овощными палочками',
            'image': '../../imgs/Хумус с овощными палочками.jpg',
            'time': 10,
            'calories': 220,
            'protein': 8,
            'carbs': 25,
            'fats': 10,
            'difficulty': 'easy',
            'category': 'snack',
            'tags': ['ПП', 'Веганское', 'Перекус'],
            'ingredients': [
                '200г нута (варёного)',
                '2 ст.л. тахини',
                'Лимонный сок',
                'Чеснок',
                'Морковь, огурцы, перец',
                'Оливковое масло'
            ],
            'steps': [
                'Измельчите нут в блендере',
                'Добавьте тахини, лимонный сок, чеснок',
                'Взбейте до кремообразной консистенции',
                'Нарежьте овощи палочками',
                'Полейте хумус оливковым маслом',
                'Используйте овощи для макания'
            ]
        },
        {
            'id': 43,
            'name': 'Творожная запеканка с ягодами',
            'image': '../../imgs/Творожная запеканка с ягодами.webp',
            'time': 35,
            'calories': 200,
            'protein': 16,
            'carbs': 22,
            'fats': 6,
            'difficulty': 'easy',
            'category': 'snack',
            'tags': ['ПП', 'Высокобелковое'],
            'ingredients': [
                '300г творога',
                '1 яйцо',
                '100г замороженных ягод',
                '2 ст.л. мёда',
                'Ванилин',
                'Кукурузный крахмал 1 ст.л.'
            ],
            'steps': [
                'Смешайте творог, яйцо, мёд, ванилин',
                'Добавьте крахмал',
                'Выложите в форму',
                'Сверху распределите ягоды',
                'Запекайте при 180°C 30 минут',
                'Остудите и нарежьте порциями'
            ]
        },
        {
            'id': 44,
            'name': 'Яблоки с арахисовой пастой',
            'image': '../../imgs/Яблоки с арахисовой пастой.jpg',
            'time': 5,
            'calories': 240,
            'protein': 8,
            'carbs': 32,
            'fats': 12,
            'difficulty': 'easy',
            'category': 'snack',
            'tags': ['ПП', 'Быстро', 'Перекус'],
            'ingredients': [
                '1 крупное яблоко',
                '2 ст.л. арахисовой пасты',
                'Корица',
                'Горсть грецких орехов (опционально)'
            ],
            'steps': [
                'Нарежьте яблоко дольками',
                'Намажьте каждую дольку арахисовой пастой',
                'Посыпьте корицей',
                'Можно добавить измельчённые орехи',
                'Подавайте сразу'
            ]
        },
        {
            'id': 45,
            'name': 'Энергетические батончики',
            'image': '../../imgs/Энергетические батончики.jpg',
            'time': 20,
            'calories': 210,
            'protein': 10,
            'carbs': 28,
            'fats': 8,
            'difficulty': 'easy',
            'category': 'snack',
            'tags': ['ПП', 'Перекус'],
            'ingredients': [
                '150г фиников',
                '100г миндаля',
                '50г овсяных хлопьев',
                '2 ст.л. мёда',
                '30г протеинового порошка',
                'Семена чиа'
            ],
            'steps': [
                'Измельчите финики и миндаль в блендере',
                'Добавьте овсянку, протеин, мёд',
                'Хорошо перемешайте',
                'Выложите в форму, утрамбуйте',
                'Посыпьте семенами чиа',
                'Уберите в холодильник на час, нарежьте'
            ]
        },
        {
            'id': 46,
            'name': 'Огурцы с творожным сыром',
            'image': '../../imgs/Огурцы с творожным сыром.jpg',
            'time': 10,
            'calories': 120,
            'protein': 10,
            'carbs': 8,
            'fats': 6,
            'difficulty': 'easy',
            'category': 'snack',
            'tags': ['ПП', 'Быстро', 'Низкоуглеводное'],
            'ingredients': [
                '2 огурца',
                '100г творожного сыра',
                'Зелень укропа',
                'Чеснок',
                'Паприка',
                'Соль, перец'
            ],
            'steps': [
                'Нарежьте огурцы толстыми кружками',
                'Смешайте творожный сыр с чесноком и зеленью',
                'Выложите сырную массу на огурцы',
                'Посыпьте паприкой',
                'Подавайте охлаждённым'
            ]
        },
        {
            'id': 47,
            'name': 'Морковные кексы с орехами',
            'image': '../../imgs/Морковные кексы с орехами.jpg',
            'time': 40,
            'calories': 190,
            'protein': 6,
            'carbs': 24,
            'fats': 8,
            'difficulty': 'medium',
            'category': 'snack',
            'tags': ['ПП', 'Перекус'],
            'ingredients': [
                '150г тёртой моркови',
                '100г овсяной муки',
                '2 яйца',
                '50г мёда',
                '50г грецких орехов',
                'Корица, разрыхлитель'
            ],
            'steps': [
                'Смешайте яйца с мёдом',
                'Добавьте морковь и орехи',
                'Всыпьте муку, корицу, разрыхлитель',
                'Перемешайте',
                'Разложите по формочкам',
                'Выпекайте при 180°C 25 минут'
            ]
        },
        {
            'id': 48,
            'name': 'Смузи с бананом и арахисовым маслом',
            'image': '../../imgs/Смузи с бананом и арахисовым маслом.jfif',
            'time': 5,
            'calories': 280,
            'protein': 14,
            'carbs': 38,
            'fats': 10,
            'difficulty': 'easy',
            'category': 'snack',
            'tags': ['ПП', 'Высокобелковое', 'Быстро'],
            'ingredients': [
                '1 банан',
                '200мл молока',
                '1 ст.л. арахисового масла',
                '1 ст.л. протеинового порошка',
                'Корица',
                'Лёд'
            ],
            'steps': [
                'Положите все ингредиенты в блендер',
                'Взбейте до однородности',
                'При желании добавьте лёд',
                'Перелейте в стакан',
                'Пейте сразу после приготовления'
            ]
        },
        {
            'id': 49,
            'name': 'Печёная тыква с корицей',
            'image': '../../imgs/Печёная тыква с корицей.jfif',
            'time': 35,
            'calories': 140,
            'protein': 3,
            'carbs': 28,
            'fats': 3,
            'difficulty': 'easy',
            'category': 'snack',
            'tags': ['ПП', 'Веганское', 'Перекус'],
            'ingredients': [
                '300г тыквы',
                '1 ст.л. мёда',
                '1 ч.л. корицы',
                'Мускатный орех',
                'Оливковое масло',
                'Щепотка соли'
            ],
            'steps': [
                'Нарежьте тыкву кубиками',
                'Смешайте с маслом, мёдом, специями',
                'Выложите на противень',
                'Запекайте при 200°C 30 минут',
                'Переворачивайте через 15 минут',
                'Подавайте тёплой или холодной'
            ]
        },
        {
            'id': 50,
            'name': 'Роллы из индейки с овощами',
            'image': '../../imgs/Роллы из индейки с овощами.jfif',
            'time': 10,
            'calories': 180,
            'protein': 22,
            'carbs': 8,
            'fats': 7,
            'difficulty': 'easy',
            'category': 'snack',
            'tags': ['ПП', 'Высокобелковое', 'Быстро'],
            'ingredients': [
                '4 тонких ломтика индейки',
                'Листья салата',
                'Огурец',
                'Помидор',
                'Творожный сыр',
                'Горчица'
            ],
            'steps': [
                'Разложите ломтики индейки',
                'Намажьте тонким слоем творожного сыра',
                'Положите лист салата',
                'Добавьте полоски огурца и помидора',
                'Сверните в ролл',
                'Закрепите зубочисткой'
            ]
        },
    ]

    for r in recipes_data:
        recipe = Recipe(
            id=r['id'],
            name=r['name'],
            image=r['image'],
            time=r['time'],
            calories=r['calories'],
            protein=r['protein'],
            carbs=r['carbs'],
            fats=r['fats'],
            difficulty=r['difficulty'],
            category=r['category'],
            tags=json.dumps(r['tags'], ensure_ascii=False),
            ingredients=json.dumps(r['ingredients'], ensure_ascii=False),
            steps=json.dumps(r['steps'], ensure_ascii=False),
        )
        db.session.add(recipe)

    print(f"  Создано рецептов: {len(recipes_data)}")


def clear_all():
    """Очистка всех данных из БД"""
    print("Очистка базы данных...")
    # Группы и социальные функции
    ForumReply.query.delete()
    ForumTopic.query.delete()
    PostLike.query.delete()
    PostComment.query.delete()
    GroupPost.query.delete()
    GroupMember.query.delete()
    Group.query.delete()
    # Рецепты
    Recipe.query.delete()
    # Остальные данные
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
