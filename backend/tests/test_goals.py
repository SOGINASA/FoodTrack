"""
Тесты целей пользователя и трекинга веса.
"""
import pytest
from datetime import date, timedelta
from models import db, UserGoals, WeightEntry


class TestGetGoals:

    def test_get_goals(self, client, auth_headers):
        resp = client.get('/api/goals', headers=auth_headers)
        assert resp.status_code == 200
        goals = resp.get_json()['goals']
        assert goals['calories_goal'] == 2500
        assert goals['protein_goal'] == 150

    def test_get_goals_creates_default_if_missing(self, client, app, auth_headers, user1):
        with app.app_context():
            UserGoals.query.filter_by(user_id=user1.id).delete()
            db.session.commit()

        resp = client.get('/api/goals', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['goals']['calories_goal'] == 2500


class TestUpdateGoals:

    def test_update_goals(self, client, auth_headers):
        resp = client.put('/api/goals', headers=auth_headers, json={
            'calories_goal': 2000,
            'protein_goal': 120,
            'goal_type': 'lose',
            'diet_type': 'keto',
        })
        assert resp.status_code == 200
        goals = resp.get_json()['goals']
        assert goals['calories_goal'] == 2000
        assert goals['goal_type'] == 'lose'

    def test_update_goals_partial(self, client, auth_headers):
        resp = client.put('/api/goals', headers=auth_headers, json={
            'fats_goal': 90,
        })
        assert resp.status_code == 200
        assert resp.get_json()['goals']['fats_goal'] == 90

    def test_update_goals_no_data(self, client, auth_headers):
        resp = client.put('/api/goals', headers=auth_headers,
                          data='', content_type='application/json')
        assert resp.status_code == 400

    def test_update_goals_creates_if_missing(self, client, app, auth_headers, user1):
        with app.app_context():
            UserGoals.query.filter_by(user_id=user1.id).delete()
            db.session.commit()

        resp = client.put('/api/goals', headers=auth_headers, json={
            'calories_goal': 3000,
        })
        assert resp.status_code == 200
        assert resp.get_json()['goals']['calories_goal'] == 3000


# ==================== Вес ====================

class TestWeightTracking:

    def test_add_weight(self, client, auth_headers):
        resp = client.post('/api/goals/weight', headers=auth_headers, json={
            'weight': 75.5,
            'date': date.today().isoformat(),
            'notes': 'Утром натощак',
        })
        assert resp.status_code == 201
        assert resp.get_json()['entry']['weight'] == 75.5

    def test_add_weight_updates_existing(self, client, auth_headers):
        """Повторная запись на ту же дату обновляет, а не дублирует."""
        today = date.today().isoformat()
        client.post('/api/goals/weight', headers=auth_headers, json={
            'weight': 75.0, 'date': today,
        })
        resp = client.post('/api/goals/weight', headers=auth_headers, json={
            'weight': 74.5, 'date': today,
        })
        assert resp.status_code == 201
        assert resp.get_json()['entry']['weight'] == 74.5

    def test_add_weight_no_value(self, client, auth_headers):
        resp = client.post('/api/goals/weight', headers=auth_headers, json={})
        assert resp.status_code == 400

    def test_get_weight_history(self, client, auth_headers, app, user1):
        with app.app_context():
            for i in range(5):
                db.session.add(WeightEntry(
                    user_id=user1.id,
                    weight=80.0 - i,
                    date=date.today() - timedelta(days=i),
                ))
            db.session.commit()

        resp = client.get('/api/goals/weight', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['count'] == 5
        assert data['stats']['current'] == 80.0  # самая свежая (desc)
        assert data['stats']['min'] == 76.0
        assert data['stats']['max'] == 80.0

    def test_get_weight_history_empty(self, client, auth_headers):
        resp = client.get('/api/goals/weight', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['stats'] is None

    def test_get_weight_history_with_days_filter(self, client, auth_headers, app, user1):
        with app.app_context():
            db.session.add(WeightEntry(
                user_id=user1.id, weight=70, date=date.today(),
            ))
            db.session.add(WeightEntry(
                user_id=user1.id, weight=71, date=date.today() - timedelta(days=60),
            ))
            db.session.commit()

        resp = client.get('/api/goals/weight?days=30', headers=auth_headers)
        assert resp.get_json()['count'] == 1

    def test_delete_weight(self, client, auth_headers, app, user1):
        with app.app_context():
            entry = WeightEntry(user_id=user1.id, weight=70, date=date.today())
            db.session.add(entry)
            db.session.commit()
            entry_id = entry.id

        resp = client.delete(f'/api/goals/weight/{entry_id}', headers=auth_headers)
        assert resp.status_code == 200

    def test_delete_weight_not_found(self, client, auth_headers):
        resp = client.delete('/api/goals/weight/999', headers=auth_headers)
        assert resp.status_code == 404
