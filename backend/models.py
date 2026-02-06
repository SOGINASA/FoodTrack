from flask import json
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True)
    nickname = db.Column(db.String(50), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # Nullable для OAuth пользователей

    full_name = db.Column(db.String(100))
    user_type = db.Column(db.String(20), default='user')  # user, admin
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)

    # Данные профиля (онбординг)
    gender = db.Column(db.String(10))  # male, female, na
    birth_year = db.Column(db.Integer)
    height_cm = db.Column(db.Integer)
    weight_kg = db.Column(db.Float)
    target_weight_kg = db.Column(db.Float)
    workouts_per_week = db.Column(db.Integer, default=0)
    diet = db.Column(db.String(20), default='none')  # none, keto, vegetarian, vegan, halal, lowcarb, custom
    diet_notes = db.Column(db.Text)
    meals_per_day = db.Column(db.Integer, default=3)
    health_flags = db.Column(db.Text)  # JSON массив
    health_notes = db.Column(db.Text)
    onboarding_completed = db.Column(db.Boolean, default=False)

    # токены восстановления/верификации
    reset_token = db.Column(db.String(100), unique=True)
    reset_token_expires = db.Column(db.DateTime)
    verification_token = db.Column(db.String(100), unique=True)

    # === OAuth поля ===
    oauth_provider = db.Column(db.String(50), nullable=True, index=True)  # google, github, apple
    oauth_id = db.Column(db.String(255), nullable=True)  # ID от провайдера
    oauth_access_token = db.Column(db.Text, nullable=True)
    oauth_refresh_token = db.Column(db.Text, nullable=True)
    oauth_token_expires = db.Column(db.DateTime, nullable=True)
    oauth_linked_at = db.Column(db.DateTime, nullable=True)
    email_verified_at = db.Column(db.DateTime, nullable=True)

    # Геолокация (для функции «поделиться продуктами рядом»)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    location_updated_at = db.Column(db.DateTime, nullable=True)

    # Связи
    meals = db.relationship('Meal', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    goals = db.relationship('UserGoals', backref='user', uselist=False, cascade='all, delete-orphan')
    weights = db.relationship('WeightEntry', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    water_entries = db.relationship('WaterEntry', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    fridge_products = db.relationship('FridgeProduct', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    # Индекс для уникальности OAuth
    __table_args__ = (
        db.UniqueConstraint('oauth_provider', 'oauth_id', name='uq_oauth_provider_id'),
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        if not self.password_hash:  # OAuth пользователи не имеют пароля
            return False
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'email': self.email,
            'nickname': self.nickname,
            'full_name': self.full_name,
            'user_type': self.user_type,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            # Данные профиля
            'gender': self.gender,
            'birth_year': self.birth_year,
            'height_cm': self.height_cm,
            'weight_kg': self.weight_kg,
            'target_weight_kg': self.target_weight_kg,
            'workouts_per_week': self.workouts_per_week,
            'diet': self.diet,
            'diet_notes': self.diet_notes,
            'meals_per_day': self.meals_per_day,
            'health_flags': json.loads(self.health_flags) if self.health_flags else [],
            'health_notes': self.health_notes,
            'onboarding_completed': self.onboarding_completed,
        }
        if include_sensitive:
            data['is_active'] = self.is_active
            data['is_verified'] = self.is_verified
        return data


class Meal(db.Model):
    __tablename__ = 'meals'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    name = db.Column(db.String(200), nullable=False)
    meal_type = db.Column(db.String(20), nullable=False)  # breakfast, lunch, dinner, snack
    meal_date = db.Column(db.Date, nullable=False, index=True)
    meal_time = db.Column(db.String(5))  # HH:MM

    calories = db.Column(db.Integer, default=0)
    protein = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fats = db.Column(db.Float, default=0)

    portions = db.Column(db.Float, default=1)
    image_url = db.Column(db.String(500))

    # AI анализ
    ai_confidence = db.Column(db.Integer)  # 0-100
    health_score = db.Column(db.Integer)  # 0-100
    ai_advice = db.Column(db.Text)
    tags = db.Column(db.Text)  # JSON массив тегов

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Связь с ингредиентами
    ingredients = db.relationship('MealIngredient', backref='meal', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.meal_type,
            'date': self.meal_date.isoformat() if self.meal_date else None,
            'time': self.meal_time,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fats': self.fats,
            'portions': self.portions,
            'image': self.image_url,
            'ai_confidence': self.ai_confidence,
            'health_score': self.health_score,
            'ai_advice': self.ai_advice,
            'tags': json.loads(self.tags) if self.tags else [],
            'ingredients': [i.to_dict() for i in self.ingredients],
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class MealIngredient(db.Model):
    __tablename__ = 'meal_ingredients'
    id = db.Column(db.Integer, primary_key=True)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'), nullable=False)

    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.String(50))
    calories = db.Column(db.Integer, default=0)
    protein = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fats = db.Column(db.Float, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'amount': self.amount,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fats': self.fats,
        }


class UserGoals(db.Model):
    __tablename__ = 'user_goals'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)

    calories_goal = db.Column(db.Integer, default=2500)
    protein_goal = db.Column(db.Integer, default=150)
    carbs_goal = db.Column(db.Integer, default=200)
    fats_goal = db.Column(db.Integer, default=70)
    water_goal = db.Column(db.Integer, default=2000)  # мл

    target_weight = db.Column(db.Float)
    activity_level = db.Column(db.String(20), default='moderate')  # sedentary, light, moderate, active, very_active
    goal_type = db.Column(db.String(20), default='maintain')  # lose, maintain, gain
    diet_type = db.Column(db.String(20), default='balanced')  # balanced, low_carb, high_protein, keto, vegetarian

    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'calories_goal': self.calories_goal,
            'protein_goal': self.protein_goal,
            'carbs_goal': self.carbs_goal,
            'fats_goal': self.fats_goal,
            'water_goal': self.water_goal,
            'target_weight': self.target_weight,
            'activity_level': self.activity_level,
            'goal_type': self.goal_type,
            'diet_type': self.diet_type,
        }


class WaterEntry(db.Model):
    """Запись о потреблении воды"""
    __tablename__ = 'water_entries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    amount_ml = db.Column(db.Integer, nullable=False)  # мл
    date = db.Column(db.Date, nullable=False, index=True)
    time = db.Column(db.String(5))  # HH:MM

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'amount_ml': self.amount_ml,
            'date': self.date.isoformat() if self.date else None,
            'time': self.time,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class WeightEntry(db.Model):
    __tablename__ = 'weight_entries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    weight = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False, index=True)
    notes = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'weight': self.weight,
            'date': self.date.isoformat() if self.date else None,
            'notes': self.notes,
        }


class Measurement(db.Model):
    """Замеры тела"""
    __tablename__ = 'measurements'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    date = db.Column(db.Date, nullable=False, index=True)
    chest = db.Column(db.Float)  # грудь
    waist = db.Column(db.Float)  # талия
    hips = db.Column(db.Float)  # бёдра
    biceps = db.Column(db.Float)  # бицепс
    thigh = db.Column(db.Float)  # бедро
    neck = db.Column(db.Float)  # шея
    notes = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'chest': self.chest,
            'waist': self.waist,
            'hips': self.hips,
            'biceps': self.biceps,
            'thigh': self.thigh,
            'neck': self.neck,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class ProgressPhoto(db.Model):
    """Фото прогресса"""
    __tablename__ = 'progress_photos'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    date = db.Column(db.Date, nullable=False, index=True)
    image_url = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(20), default='front')  # front, side, back
    notes = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date.isoformat() if self.date else None,
            'image_url': self.image_url,
            'category': self.category,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# === Группы и социальные функции ===

class Group(db.Model):
    """Группы пользователей"""
    __tablename__ = 'groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    emoji = db.Column(db.String(10), default='💪')
    is_public = db.Column(db.Boolean, default=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Связи
    owner = db.relationship('User', backref='owned_groups', foreign_keys=[owner_id])
    members = db.relationship('GroupMember', backref='group', lazy='dynamic', cascade='all, delete-orphan')
    posts = db.relationship('GroupPost', backref='group', lazy='dynamic', cascade='all, delete-orphan')
    topics = db.relationship('ForumTopic', backref='group', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_members=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'emoji': self.emoji,
            'isPublic': self.is_public,
            'ownerId': self.owner_id,
            'membersCount': self.members.count(),
            'postsToday': self.posts.filter(
                db.func.date(GroupPost.created_at) == datetime.now(timezone.utc).date()
            ).count(),
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }
        if include_members:
            data['members'] = [m.to_dict() for m in self.members.limit(10)]
        return data


class GroupMember(db.Model):
    """Участники группы"""
    __tablename__ = 'group_members'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    role = db.Column(db.String(20), default='member')  # owner, admin, member

    joined_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref='group_memberships')

    __table_args__ = (db.UniqueConstraint('group_id', 'user_id', name='unique_group_member'),)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'name': self.user.full_name or self.user.nickname,
            'role': self.role,
            'avatar': None,
            'joinedAt': self.joined_at.isoformat() if self.joined_at else None,
        }


class GroupPost(db.Model):
    """Посты в группе"""
    __tablename__ = 'group_posts'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    text = db.Column(db.Text)
    image_url = db.Column(db.String(500))

    # Привязка к блюду (опционально)
    meal_id = db.Column(db.Integer, db.ForeignKey('meals.id'))

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Связи
    user = db.relationship('User', backref='group_posts')
    meal = db.relationship('Meal', backref='shared_posts')
    comments = db.relationship('PostComment', backref='post', lazy='dynamic', cascade='all, delete-orphan')
    likes = db.relationship('PostLike', backref='post', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, current_user_id=None):
        meal_data = None
        if self.meal:
            meal_data = {
                'name': self.meal.name,
                'calories': self.meal.calories,
                'protein': self.meal.protein,
                'carbs': self.meal.carbs,
                'fats': self.meal.fats,
            }

        return {
            'id': self.id,
            'userId': self.user_id,
            'userName': self.user.full_name or self.user.nickname,
            'userAvatar': None,
            'text': self.text,
            'image': self.image_url,
            'meal': meal_data,
            'likes': [like.user_id for like in self.likes],
            'comments': [c.to_dict() for c in self.comments.order_by(PostComment.created_at)],
            'timestamp': self.created_at.isoformat() if self.created_at else None,
        }


class PostComment(db.Model):
    """Комментарии к постам"""
    __tablename__ = 'post_comments'
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('group_posts.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    text = db.Column(db.Text, nullable=False)
    reply_to_id = db.Column(db.Integer, db.ForeignKey('post_comments.id'))
    reply_to_name = db.Column(db.String(100))

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref='post_comments')
    replies = db.relationship('PostComment', backref=db.backref('parent', remote_side=[id]), lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'userName': self.user.full_name or self.user.nickname,
            'text': self.text,
            'replyToId': self.reply_to_id,
            'replyToName': self.reply_to_name,
            'timestamp': self.created_at.isoformat() if self.created_at else None,
        }


class PostLike(db.Model):
    """Лайки постов"""
    __tablename__ = 'post_likes'
    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('group_posts.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('post_id', 'user_id', name='unique_post_like'),)


class ForumTopic(db.Model):
    """Темы форума группы"""
    __tablename__ = 'forum_topics'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(20), default='discussion')  # discussion, question, recipe, achievement, tip
    is_pinned = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_activity = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    author = db.relationship('User', backref='forum_topics')
    replies = db.relationship('ForumReply', backref='topic', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'category': self.category,
            'authorId': self.author_id,
            'authorName': self.author.full_name or self.author.nickname,
            'authorAvatar': None,
            'isPinned': self.is_pinned,
            'replies': [r.to_dict() for r in self.replies.order_by(ForumReply.created_at)],
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'lastActivity': self.last_activity.isoformat() if self.last_activity else None,
        }


class ForumReply(db.Model):
    """Ответы в темах форума"""
    __tablename__ = 'forum_replies'
    id = db.Column(db.Integer, primary_key=True)
    topic_id = db.Column(db.Integer, db.ForeignKey('forum_topics.id'), nullable=False, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    content = db.Column(db.Text, nullable=False)
    reply_to_id = db.Column(db.Integer, db.ForeignKey('forum_replies.id'))
    reply_to_name = db.Column(db.String(100))

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    author = db.relationship('User', backref='forum_replies')

    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'authorId': self.author_id,
            'authorName': self.author.full_name or self.author.nickname,
            'authorAvatar': None,
            'replyToId': self.reply_to_id,
            'replyToName': self.reply_to_name,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


# === План питания (рецепты) ===

class MealPlan(db.Model):
    """Запланированные рецепты в плане питания"""
    __tablename__ = 'meal_plans'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # Данные рецепта (копируются из фронтенда)
    recipe_id = db.Column(db.Integer, nullable=False)  # ID рецепта из фронтенда
    name = db.Column(db.String(200), nullable=False)
    image_url = db.Column(db.String(500))

    # Тип приёма пищи и дата
    meal_type = db.Column(db.String(20), nullable=False)  # breakfast, lunch, dinner, snack
    planned_date = db.Column(db.Date, nullable=False, index=True)

    # Нутриенты
    calories = db.Column(db.Integer, default=0)
    protein = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fats = db.Column(db.Float, default=0)

    # Время приготовления и сложность
    cooking_time = db.Column(db.Integer)  # минуты
    difficulty = db.Column(db.String(20))  # easy, medium, hard

    # Ингредиенты и шаги (JSON)
    ingredients = db.Column(db.Text)  # JSON массив
    steps = db.Column(db.Text)  # JSON массив
    tags = db.Column(db.Text)  # JSON массив

    # Статус
    is_completed = db.Column(db.Boolean, default=False)  # приготовлено ли

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'recipeId': self.recipe_id,
            'name': self.name,
            'image': self.image_url,
            'type': self.meal_type,
            'date': self.planned_date.isoformat() if self.planned_date else None,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fats': self.fats,
            'time': self.cooking_time,
            'difficulty': self.difficulty,
            'ingredients': json.loads(self.ingredients) if self.ingredients else [],
            'steps': json.loads(self.steps) if self.steps else [],
            'tags': json.loads(self.tags) if self.tags else [],
            'isCompleted': self.is_completed,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class Recipe(db.Model):
    """Рецепты для каталога"""
    __tablename__ = 'recipes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    image = db.Column(db.String(500))
    time = db.Column(db.Integer)  # время приготовления в минутах
    calories = db.Column(db.Integer, default=0)
    protein = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fats = db.Column(db.Float, default=0)
    difficulty = db.Column(db.String(20))  # easy, medium, hard
    category = db.Column(db.String(20))  # breakfast, lunch, dinner, snack
    tags = db.Column(db.Text)  # JSON массив
    ingredients = db.Column(db.Text)  # JSON массив
    steps = db.Column(db.Text)  # JSON массив

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'image': self.image,
            'time': self.time,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fats': self.fats,
            'difficulty': self.difficulty,
            'category': self.category,
            'tags': json.loads(self.tags) if self.tags else [],
            'ingredients': json.loads(self.ingredients) if self.ingredients else [],
            'steps': json.loads(self.steps) if self.steps else [],
        }


class AuditLog(db.Model):
    """Логирование всех операций с аутентификацией и пользователем"""
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    
    # Основные поля действия
    action = db.Column(db.String(50), nullable=False, index=True)  # REGISTER_EMAIL, LOGIN_OAUTH, etc.
    action_type = db.Column(db.String(20), nullable=False)  # auth, profile, oauth, account
    status = db.Column(db.String(20), default='success')  # success, failure
    
    # Детали запроса
    ip_address = db.Column(db.String(45), index=True)  # IPv4 и IPv6
    user_agent = db.Column(db.Text)
    device_type = db.Column(db.String(50))  # Desktop, Mobile, Tablet
    browser = db.Column(db.String(50))  # Chrome, Safari, Firefox
    os = db.Column(db.String(50))  # Windows, macOS, Linux, iOS, Android
    
    # OAuth специфичные поля
    oauth_provider = db.Column(db.String(50), nullable=True)  # google, github, apple
    oauth_id = db.Column(db.String(255), nullable=True)
    
    # Ошибки и детали
    error_code = db.Column(db.String(50), nullable=True)
    error_message = db.Column(db.Text, nullable=True)
    error_details = db.Column(db.Text, nullable=True)  # Full stacktrace
    
    # Изменения данных
    changes = db.Column(db.Text, nullable=True)  # JSON с измененными полями
    
    # Метаданные
    session_id = db.Column(db.String(100), index=True)
    request_id = db.Column(db.String(100), unique=True)
    
    # Временные метки
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    duration_ms = db.Column(db.Integer)  # Длительность операции в миллисекундах
    
    # Индексы для быстрого поиска
    __table_args__ = (
        db.Index('ix_audit_user_action_date', 'user_id', 'action', 'created_at'),
        db.Index('ix_audit_ip_date', 'ip_address', 'created_at'),
        db.Index('ix_audit_session', 'session_id', 'created_at'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'action_type': self.action_type,
            'status': self.status,
            'ip_address': self.ip_address,
            'device_type': self.device_type,
            'browser': self.browser,
            'os': self.os,
            'oauth_provider': self.oauth_provider,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'duration_ms': self.duration_ms,
        }


# === Друзья ===

class Friendship(db.Model):
    """Дружба / запрос в друзья между двумя пользователями"""
    __tablename__ = 'friendships'
    id = db.Column(db.Integer, primary_key=True)
    requester_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    addressee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected, blocked

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Связи
    requester = db.relationship('User', foreign_keys=[requester_id], backref='sent_friend_requests')
    addressee = db.relationship('User', foreign_keys=[addressee_id], backref='received_friend_requests')

    __table_args__ = (
        db.UniqueConstraint('requester_id', 'addressee_id', name='unique_friendship_request'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'requesterId': self.requester_id,
            'addresseeId': self.addressee_id,
            'requesterName': self.requester.full_name or self.requester.nickname,
            'addresseeName': self.addressee.full_name or self.addressee.nickname,
            'requesterAvatar': None,
            'addresseeAvatar': None,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


# === Холодильник ===

class FridgeProduct(db.Model):
    """Продукт в холодильнике пользователя"""
    __tablename__ = 'fridge_products'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    name = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.Float, default=1)
    unit = db.Column(db.String(20), default='шт')  # шт, кг, г, л, мл, упак
    category = db.Column(db.String(30), default='other')  # dairy, meat, fish, vegetables, fruits, bakery, frozen, canned, other
    expiry_date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'quantity': self.quantity,
            'unit': self.unit,
            'category': self.category,
            'expiryDate': self.expiry_date.isoformat() if self.expiry_date else None,
            'notes': self.notes,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class ProductShareRequest(db.Model):
    """Запрос на передачу продуктов другому пользователю"""
    __tablename__ = 'product_share_requests'
    id = db.Column(db.Integer, primary_key=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    # JSON-список продуктов: [{name, quantity, unit}]
    products_json = db.Column(db.Text, nullable=False)

    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected
    sender_lat = db.Column(db.Float, nullable=True)
    sender_lng = db.Column(db.Float, nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_share_requests')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_share_requests')

    def to_dict(self):
        return {
            'id': self.id,
            'senderId': self.sender_id,
            'senderName': self.sender.full_name or self.sender.nickname or 'Пользователь',
            'recipientId': self.recipient_id,
            'products': json.loads(self.products_json) if self.products_json else [],
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class PushSubscription(db.Model):
    """Подписка на push-уведомления (Web Push)"""
    __tablename__ = 'push_subscriptions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    endpoint = db.Column(db.Text, nullable=False)
    p256dh_key = db.Column(db.String(255), nullable=False)
    auth_key = db.Column(db.String(255), nullable=False)

    user_agent = db.Column(db.String(255), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('push_subscriptions', lazy='dynamic', cascade='all, delete-orphan'))

    __table_args__ = (
        db.UniqueConstraint('endpoint', name='uq_push_endpoint'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'userAgent': self.user_agent,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }

    def to_webpush_dict(self):
        return {
            'endpoint': self.endpoint,
            'keys': {
                'p256dh': self.p256dh_key,
                'auth': self.auth_key,
            }
        }


class Notification(db.Model):
    """Уведомление пользователя"""
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(30), nullable=False, index=True)

    related_type = db.Column(db.String(30), nullable=True)
    related_id = db.Column(db.Integer, nullable=True)

    is_read = db.Column(db.Boolean, default=False, index=True)
    is_pushed = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    read_at = db.Column(db.DateTime, nullable=True)

    user = db.relationship('User', backref=db.backref('notifications', lazy='dynamic', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'body': self.body,
            'category': self.category,
            'relatedType': self.related_type,
            'relatedId': self.related_id,
            'isRead': self.is_read,
            'createdAt': (self.created_at.isoformat() + 'Z') if self.created_at else None,
            'readAt': (self.read_at.isoformat() + 'Z') if self.read_at else None,
        }


class NotificationPreference(db.Model):
    """Настройки уведомлений пользователя"""
    __tablename__ = 'notification_preferences'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)

    meal_reminders = db.Column(db.Boolean, default=True)
    water_reminders = db.Column(db.Boolean, default=True)
    progress_updates = db.Column(db.Boolean, default=True)
    group_activity = db.Column(db.Boolean, default=True)
    weekly_reports = db.Column(db.Boolean, default=True)

    breakfast_time = db.Column(db.String(5), default='08:00')
    lunch_time = db.Column(db.String(5), default='13:00')
    dinner_time = db.Column(db.String(5), default='19:00')

    push_enabled = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship('User', backref=db.backref('notification_preferences', uselist=False, cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'mealReminders': self.meal_reminders,
            'waterReminders': self.water_reminders,
            'progressUpdates': self.progress_updates,
            'groupActivity': self.group_activity,
            'weeklyReports': self.weekly_reports,
            'breakfastTime': self.breakfast_time,
            'lunchTime': self.lunch_time,
            'dinnerTime': self.dinner_time,
            'pushEnabled': self.push_enabled,
        }