"""
Тесты планов питания: CRUD, отметка выполнения, неделя.
"""
import json
import pytest
from datetime import date, timedelta
from models import db, MealPlan


class TestMealPlanCRUD:

    def test_create_meal_plan(self, client, auth_headers):
        resp = client.post('/api/meal-plans', headers=auth_headers, json={
            'recipeId': 1,
            'name': 'Овсяная каша',
            'date': date.today().isoformat(),
            'type': 'breakfast',
            'calories': 300,
            'protein': 10,
            'carbs': 50,
            'fats': 5,
            'ingredients': ['овсянка', 'молоко'],
            'steps': ['Варить 10 минут'],
        })
        assert resp.status_code == 201
        plan = resp.get_json()['meal_plan']
        assert plan['name'] == 'Овсяная каша'
        assert plan['type'] == 'breakfast'

    def test_create_meal_plan_no_recipe_id(self, client, auth_headers):
        resp = client.post('/api/meal-plans', headers=auth_headers, json={
            'name': 'Test',
            'date': date.today().isoformat(),
        })
        assert resp.status_code == 400

    def test_create_meal_plan_no_name(self, client, auth_headers):
        resp = client.post('/api/meal-plans', headers=auth_headers, json={
            'recipeId': 1,
            'date': date.today().isoformat(),
        })
        assert resp.status_code == 400

    def test_create_meal_plan_no_date(self, client, auth_headers):
        resp = client.post('/api/meal-plans', headers=auth_headers, json={
            'recipeId': 1,
            'name': 'Test',
        })
        assert resp.status_code == 400

    def test_create_meal_plan_category_mapping(self, client, auth_headers):
        """Тип определяется из category если type не указан."""
        resp = client.post('/api/meal-plans', headers=auth_headers, json={
            'recipeId': 1,
            'name': 'Ужин',
            'date': date.today().isoformat(),
            'category': 'dinner',
        })
        assert resp.status_code == 201
        assert resp.get_json()['meal_plan']['type'] == 'dinner'

    def test_get_meal_plans(self, client, auth_headers, app, user1):
        with app.app_context():
            db.session.add(MealPlan(
                user_id=user1.id, recipe_id=1, name='P1',
                meal_type='lunch', planned_date=date.today(),
            ))
            db.session.commit()

        resp = client.get('/api/meal-plans', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['count'] == 1

    def test_get_meal_plans_filter_by_date(self, client, auth_headers, app, user1):
        today = date.today()
        with app.app_context():
            db.session.add(MealPlan(
                user_id=user1.id, recipe_id=1, name='Today',
                meal_type='lunch', planned_date=today,
            ))
            db.session.add(MealPlan(
                user_id=user1.id, recipe_id=2, name='Tomorrow',
                meal_type='dinner', planned_date=today + timedelta(days=1),
            ))
            db.session.commit()

        resp = client.get(f'/api/meal-plans?date={today.isoformat()}', headers=auth_headers)
        assert resp.get_json()['count'] == 1

    def test_get_meal_plan_by_id(self, client, auth_headers, app, user1):
        with app.app_context():
            plan = MealPlan(
                user_id=user1.id, recipe_id=1, name='P1',
                meal_type='lunch', planned_date=date.today(),
            )
            db.session.add(plan)
            db.session.commit()
            pid = plan.id

        resp = client.get(f'/api/meal-plans/{pid}', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['meal_plan']['name'] == 'P1'

    def test_get_meal_plan_not_found(self, client, auth_headers):
        resp = client.get('/api/meal-plans/999', headers=auth_headers)
        assert resp.status_code == 404

    def test_update_meal_plan(self, client, auth_headers, app, user1):
        with app.app_context():
            plan = MealPlan(
                user_id=user1.id, recipe_id=1, name='P1',
                meal_type='lunch', planned_date=date.today(),
            )
            db.session.add(plan)
            db.session.commit()
            pid = plan.id

        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        resp = client.put(f'/api/meal-plans/{pid}', headers=auth_headers, json={
            'date': tomorrow,
            'type': 'dinner',
        })
        assert resp.status_code == 200
        assert resp.get_json()['meal_plan']['type'] == 'dinner'

    def test_update_meal_plan_not_found(self, client, auth_headers):
        resp = client.put('/api/meal-plans/999', headers=auth_headers, json={'type': 'lunch'})
        assert resp.status_code == 404

    def test_delete_meal_plan(self, client, auth_headers, app, user1):
        with app.app_context():
            plan = MealPlan(
                user_id=user1.id, recipe_id=1, name='P1',
                meal_type='lunch', planned_date=date.today(),
            )
            db.session.add(plan)
            db.session.commit()
            pid = plan.id

        resp = client.delete(f'/api/meal-plans/{pid}', headers=auth_headers)
        assert resp.status_code == 200

    def test_delete_meal_plan_not_found(self, client, auth_headers):
        resp = client.delete('/api/meal-plans/999', headers=auth_headers)
        assert resp.status_code == 404


class TestMealPlanCompletion:

    def test_toggle_complete(self, client, auth_headers, app, user1):
        with app.app_context():
            plan = MealPlan(
                user_id=user1.id, recipe_id=1, name='P1',
                meal_type='lunch', planned_date=date.today(),
            )
            db.session.add(plan)
            db.session.commit()
            pid = plan.id

        # Выполнен
        resp = client.post(f'/api/meal-plans/{pid}/complete', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['meal_plan']['isCompleted'] is True

        # Отмена
        resp2 = client.post(f'/api/meal-plans/{pid}/complete', headers=auth_headers)
        assert resp2.get_json()['meal_plan']['isCompleted'] is False

    def test_complete_not_found(self, client, auth_headers):
        resp = client.post('/api/meal-plans/999/complete', headers=auth_headers)
        assert resp.status_code == 404


class TestWeekMealPlans:

    def test_get_week_plans(self, client, auth_headers, app, user1):
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())
        with app.app_context():
            for i in range(3):
                db.session.add(MealPlan(
                    user_id=user1.id, recipe_id=i + 1, name=f'Plan {i}',
                    meal_type='lunch', planned_date=start_of_week + timedelta(days=i),
                ))
            db.session.commit()

        resp = client.get('/api/meal-plans/week', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['total_count'] == 3
        assert len(data['week_plans']) == 7  # 7 дней

    def test_get_week_plans_custom_start(self, client, auth_headers, app, user1):
        start = date(2025, 6, 2)  # Понедельник
        with app.app_context():
            db.session.add(MealPlan(
                user_id=user1.id, recipe_id=1, name='Plan',
                meal_type='lunch', planned_date=start,
            ))
            db.session.commit()

        resp = client.get(f'/api/meal-plans/week?start_date={start.isoformat()}',
                          headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['total_count'] == 1
