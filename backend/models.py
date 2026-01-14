from flask import json
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=True, index=True)
    nickname = db.Column(db.String(50), unique=True, nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    full_name = db.Column(db.String(100))
    user_type = db.Column(db.String(20), default='user')  # user, admin
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)

    # токены восстановления/верификации
    reset_token = db.Column(db.String(100), unique=True)
    reset_token_expires = db.Column(db.DateTime)
    verification_token = db.Column(db.String(100), unique=True)

    # Связи
    meals = db.relationship('Meal', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    goals = db.relationship('UserGoals', backref='user', uselist=False, cascade='all, delete-orphan')
    weights = db.relationship('WeightEntry', backref='user', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
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

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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

    target_weight = db.Column(db.Float)
    activity_level = db.Column(db.String(20), default='moderate')  # sedentary, light, moderate, active, very_active
    goal_type = db.Column(db.String(20), default='maintain')  # lose, maintain, gain

    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'calories_goal': self.calories_goal,
            'protein_goal': self.protein_goal,
            'carbs_goal': self.carbs_goal,
            'fats_goal': self.fats_goal,
            'target_weight': self.target_weight,
            'activity_level': self.activity_level,
            'goal_type': self.goal_type,
        }


class WeightEntry(db.Model):
    __tablename__ = 'weight_entries'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    weight = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False, index=True)
    notes = db.Column(db.Text)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'weight': self.weight,
            'date': self.date.isoformat() if self.date else None,
            'notes': self.notes,
        }