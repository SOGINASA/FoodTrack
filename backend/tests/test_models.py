"""
Тесты моделей, валидаторов и утилит.
"""
import json
import pytest
from datetime import date, datetime
from models import (
    db, User, Meal, MealIngredient, UserGoals, WeightEntry,
    Group, GroupMember, FridgeProduct, MealPlan, Recipe, Friendship
)


# ==================== User model ====================

class TestUserModel:

    def test_set_and_check_password(self, app):
        with app.app_context():
            user = User(email='pw@test.com')
            user.set_password('secret123')
            assert user.check_password('secret123') is True
            assert user.check_password('wrong') is False

    def test_oauth_user_no_password(self, app):
        with app.app_context():
            user = User(email='oauth@test.com', oauth_provider='google')
            # Без пароля check_password возвращает False
            assert user.check_password('anything') is False

    def test_to_dict(self, app, user1):
        with app.app_context():
            user = User.query.get(user1.id)
            d = user.to_dict()
            assert d['email'] == 'user1@test.com'
            assert d['nickname'] == 'user1'
            assert 'is_active' not in d  # не включается по умолчанию

    def test_to_dict_with_sensitive(self, app, user1):
        with app.app_context():
            user = User.query.get(user1.id)
            d = user.to_dict(include_sensitive=True)
            assert 'is_active' in d
            assert 'is_verified' in d

    def test_to_dict_health_flags_json(self, app, user1):
        with app.app_context():
            user = User.query.get(user1.id)
            user.health_flags = json.dumps(['allergy', 'diabetes'])
            db.session.commit()

            d = user.to_dict()
            assert d['health_flags'] == ['allergy', 'diabetes']


# ==================== Meal model ====================

class TestMealModel:

    def test_meal_to_dict(self, app, sample_meal):
        with app.app_context():
            meal = Meal.query.get(sample_meal.id)
            d = meal.to_dict()
            assert d['name'] == 'Овсянка'
            assert d['type'] == 'breakfast'
            assert d['calories'] == 350
            assert d['ingredients'] == []
            assert d['tags'] == []

    def test_meal_to_dict_with_tags(self, app, user1):
        with app.app_context():
            meal = Meal(
                user_id=user1.id, name='Test', meal_type='lunch',
                meal_date=date.today(), calories=100,
                tags=json.dumps(['tag1', 'tag2']),
            )
            db.session.add(meal)
            db.session.commit()
            d = meal.to_dict()
            assert d['tags'] == ['tag1', 'tag2']

    def test_meal_ingredients_to_dict(self, app, user1):
        with app.app_context():
            meal = Meal(user_id=user1.id, name='M', meal_type='lunch',
                        meal_date=date.today(), calories=100)
            db.session.add(meal)
            db.session.flush()
            ing = MealIngredient(meal_id=meal.id, name='Rice', amount='100g',
                                 calories=130, protein=3, carbs=28, fats=0.3)
            db.session.add(ing)
            db.session.commit()

            d = meal.to_dict()
            assert len(d['ingredients']) == 1
            assert d['ingredients'][0]['name'] == 'Rice'


# ==================== UserGoals model ====================

class TestUserGoalsModel:

    def test_goals_to_dict(self, app, user1):
        with app.app_context():
            goals = UserGoals.query.filter_by(user_id=user1.id).first()
            d = goals.to_dict()
            assert d['calories_goal'] == 2500
            assert d['goal_type'] == 'maintain'
            assert d['diet_type'] == 'balanced'


# ==================== WeightEntry model ====================

class TestWeightEntryModel:

    def test_weight_entry_to_dict(self, app, user1):
        with app.app_context():
            entry = WeightEntry(user_id=user1.id, weight=75.5, date=date.today(), notes='AM')
            db.session.add(entry)
            db.session.commit()
            d = entry.to_dict()
            assert d['weight'] == 75.5
            assert d['date'] == date.today().isoformat()


# ==================== FridgeProduct model ====================

class TestFridgeProductModel:

    def test_fridge_product_to_dict(self, app, user1):
        with app.app_context():
            p = FridgeProduct(user_id=user1.id, name='Milk', quantity=2, unit='л',
                              category='dairy', expiry_date=date(2025, 12, 31))
            db.session.add(p)
            db.session.commit()
            d = p.to_dict()
            assert d['name'] == 'Milk'
            assert d['unit'] == 'л'
            assert d['expiryDate'] == '2025-12-31'


# ==================== MealPlan model ====================

class TestMealPlanModel:

    def test_meal_plan_to_dict(self, app, user1):
        with app.app_context():
            plan = MealPlan(
                user_id=user1.id, recipe_id=1, name='Recipe',
                meal_type='lunch', planned_date=date.today(),
                ingredients=json.dumps(['a', 'b']),
                steps=json.dumps(['step1']),
                tags=json.dumps(['healthy']),
            )
            db.session.add(plan)
            db.session.commit()
            d = plan.to_dict()
            assert d['ingredients'] == ['a', 'b']
            assert d['steps'] == ['step1']
            assert d['tags'] == ['healthy']
            assert d['isCompleted'] is False


# ==================== Recipe model ====================

class TestRecipeModel:

    def test_recipe_to_dict(self, app, sample_recipe):
        with app.app_context():
            r = Recipe.query.get(sample_recipe.id)
            d = r.to_dict()
            assert d['name'] == 'Греческий салат'
            assert d['difficulty'] == 'easy'
            assert len(d['tags']) == 2
            assert len(d['ingredients']) == 3


# ==================== Friendship model ====================

class TestFriendshipModel:

    def test_friendship_to_dict(self, app, user1, user2):
        with app.app_context():
            f = Friendship(requester_id=user1.id, addressee_id=user2.id, status='pending')
            db.session.add(f)
            db.session.commit()
            d = f.to_dict()
            assert d['status'] == 'pending'
            assert d['requesterName'] is not None
            assert d['addresseeName'] is not None


# ==================== Auth validators ====================

class TestValidators:

    def test_validate_email(self):
        from routes.auth import validate_email
        assert validate_email('test@example.com') is True
        assert validate_email('user.name+tag@domain.co') is True
        assert validate_email('notanemail') is False
        assert validate_email('') is False
        assert validate_email('@missing.com') is False

    def test_validate_nickname(self):
        from routes.auth import validate_nickname
        assert validate_nickname('user1') is True
        assert validate_nickname('my_nick-name.1') is True
        assert validate_nickname('ab') is False  # < 3
        assert validate_nickname('a' * 21) is False  # > 20
        assert validate_nickname('user name') is False  # space
        assert validate_nickname('user@name') is False  # special char

    def test_is_email(self):
        from routes.auth import is_email
        assert is_email('test@example.com') is True
        assert is_email('nickname') is False
        assert is_email('no@dot') is False

    def test_validate_phone(self):
        from routes.auth import validate_phone
        assert validate_phone('+77771234567') is True
        assert validate_phone('87771234567') is True
        assert validate_phone('1234567890') is False
