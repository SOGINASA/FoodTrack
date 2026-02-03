"""
Тесты CRUD приёмов пищи, копирования и фильтрации.
"""
import json
import pytest
from datetime import date, timedelta
from models import db, Meal, MealIngredient


class TestGetMeals:

    def test_get_meals_empty(self, client, auth_headers):
        resp = client.get('/api/meals', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['count'] == 0

    def test_get_meals_with_data(self, client, auth_headers, sample_meal):
        resp = client.get('/api/meals', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['count'] == 1

    def test_get_meals_filter_by_date(self, client, auth_headers, sample_meal):
        today = date.today().isoformat()
        resp = client.get(f'/api/meals?date={today}', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['count'] == 1

    def test_get_meals_filter_by_date_range(self, client, auth_headers, sample_meal):
        start = (date.today() - timedelta(days=1)).isoformat()
        end = date.today().isoformat()
        resp = client.get(f'/api/meals?start_date={start}&end_date={end}', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['count'] == 1

    def test_get_meals_filter_by_type(self, client, auth_headers, sample_meal):
        resp = client.get('/api/meals?type=breakfast', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['count'] == 1

        resp2 = client.get('/api/meals?type=dinner', headers=auth_headers)
        assert resp2.get_json()['count'] == 0

    def test_get_meal_not_found(self, client, auth_headers):
        resp = client.get('/api/meals/999', headers=auth_headers)
        assert resp.status_code == 404

    def test_get_meal_by_id(self, client, auth_headers, sample_meal):
        resp = client.get(f'/api/meals/{sample_meal.id}', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['meal']['name'] == 'Овсянка'

    def test_unauthorized_access(self, client):
        resp = client.get('/api/meals')
        assert resp.status_code == 401


class TestCreateMeal:

    def test_create_meal_minimal(self, client, auth_headers):
        resp = client.post('/api/meals', headers=auth_headers, json={
            'name': 'Рис с курицей',
        })
        assert resp.status_code == 201
        meal = resp.get_json()['meal']
        assert meal['name'] == 'Рис с курицей'
        assert meal['type'] == 'snack'  # по умолчанию

    def test_create_meal_full(self, client, auth_headers):
        resp = client.post('/api/meals', headers=auth_headers, json={
            'name': 'Борщ',
            'type': 'lunch',
            'date': date.today().isoformat(),
            'time': '13:00',
            'calories': 450,
            'protein': 20.0,
            'carbs': 40.0,
            'fats': 15.0,
            'portions': 2,
            'tags': ['суп', 'домашнее'],
            'ingredients': [
                {'name': 'Свекла', 'amount': '200г', 'calories': 80, 'protein': 2, 'carbs': 18, 'fats': 0},
                {'name': 'Картофель', 'amount': '150г', 'calories': 120, 'protein': 3, 'carbs': 25, 'fats': 0},
            ]
        })
        assert resp.status_code == 201
        meal = resp.get_json()['meal']
        assert meal['calories'] == 450
        assert len(meal['ingredients']) == 2
        assert meal['tags'] == ['суп', 'домашнее']

    def test_create_meal_no_name(self, client, auth_headers):
        resp = client.post('/api/meals', headers=auth_headers, json={
            'calories': 100,
        })
        assert resp.status_code == 400

    def test_create_meal_no_data(self, client, auth_headers):
        resp = client.post('/api/meals', headers=auth_headers,
                           data='', content_type='application/json')
        assert resp.status_code == 400


class TestUpdateMeal:

    def test_update_meal(self, client, auth_headers, sample_meal):
        resp = client.put(f'/api/meals/{sample_meal.id}', headers=auth_headers, json={
            'name': 'Каша рисовая',
            'calories': 400,
        })
        assert resp.status_code == 200
        assert resp.get_json()['meal']['name'] == 'Каша рисовая'
        assert resp.get_json()['meal']['calories'] == 400

    def test_update_meal_ingredients(self, client, auth_headers, sample_meal):
        resp = client.put(f'/api/meals/{sample_meal.id}', headers=auth_headers, json={
            'ingredients': [
                {'name': 'Молоко', 'amount': '200мл', 'calories': 100},
            ]
        })
        assert resp.status_code == 200
        assert len(resp.get_json()['meal']['ingredients']) == 1

    def test_update_meal_not_found(self, client, auth_headers):
        resp = client.put('/api/meals/999', headers=auth_headers, json={'name': 'x'})
        assert resp.status_code == 404

    def test_update_other_users_meal(self, client, auth_headers_user2, sample_meal):
        resp = client.put(f'/api/meals/{sample_meal.id}', headers=auth_headers_user2,
                          json={'name': 'hacked'})
        assert resp.status_code == 404


class TestDeleteMeal:

    def test_delete_meal(self, client, auth_headers, sample_meal):
        resp = client.delete(f'/api/meals/{sample_meal.id}', headers=auth_headers)
        assert resp.status_code == 200

        resp2 = client.get(f'/api/meals/{sample_meal.id}', headers=auth_headers)
        assert resp2.status_code == 404

    def test_delete_meal_not_found(self, client, auth_headers):
        resp = client.delete('/api/meals/999', headers=auth_headers)
        assert resp.status_code == 404


class TestCopyMeal:

    def test_copy_meal(self, client, auth_headers, sample_meal):
        resp = client.post(f'/api/meals/{sample_meal.id}/copy', headers=auth_headers, json={
            'date': (date.today() + timedelta(days=1)).isoformat(),
            'type': 'dinner',
        })
        assert resp.status_code == 201
        copy = resp.get_json()['meal']
        assert copy['name'] == 'Овсянка'
        assert copy['type'] == 'dinner'
        assert copy['id'] != sample_meal.id

    def test_copy_meal_default_date(self, client, auth_headers, sample_meal):
        resp = client.post(f'/api/meals/{sample_meal.id}/copy', headers=auth_headers, json={})
        assert resp.status_code == 201

    def test_copy_nonexistent_meal(self, client, auth_headers):
        resp = client.post('/api/meals/999/copy', headers=auth_headers, json={})
        assert resp.status_code == 404


class TestTodayMeals:

    def test_today_meals(self, client, auth_headers, sample_meal):
        resp = client.get('/api/meals/today', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['date'] == date.today().isoformat()
        assert data['totals']['calories'] == 350
        assert data['totals']['meals_count'] == 1

    def test_today_meals_empty(self, client, auth_headers):
        resp = client.get('/api/meals/today', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['totals']['meals_count'] == 0
