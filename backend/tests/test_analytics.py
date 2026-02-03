"""
Тесты аналитики: дневная, недельная, месячная статистика, серия, топ продуктов.
"""
import pytest
from datetime import date, timedelta
from models import db, Meal, UserGoals


@pytest.fixture
def meals_for_week(app, user1):
    """Создать приёмы пищи за последние 7 дней."""
    with app.app_context():
        today = date.today()
        meals = []
        for i in range(7):
            d = today - timedelta(days=i)
            meal = Meal(
                user_id=user1.id,
                name='Завтрак' if i % 2 == 0 else 'Ужин',
                meal_type='breakfast' if i % 2 == 0 else 'dinner',
                meal_date=d,
                calories=500,
                protein=25.0,
                carbs=50.0,
                fats=15.0,
            )
            meals.append(meal)
            db.session.add(meal)
        db.session.commit()
        return meals


@pytest.fixture
def meals_for_streak(app, user1):
    """Создать приёмы пищи для проверки серии (5 подряд)."""
    with app.app_context():
        today = date.today()
        for i in range(5):
            d = today - timedelta(days=i)
            db.session.add(Meal(
                user_id=user1.id,
                name=f'Meal day {i}',
                meal_type='lunch',
                meal_date=d,
                calories=300,
                protein=15.0,
                carbs=30.0,
                fats=10.0,
            ))
        # Пропускаем день 5, добавляем день 6 (разрыв серии)
        db.session.add(Meal(
            user_id=user1.id,
            name='Meal day 6',
            meal_type='lunch',
            meal_date=today - timedelta(days=6),
            calories=300,
            protein=15.0,
            carbs=30.0,
            fats=10.0,
        ))
        db.session.commit()


class TestDailyStats:

    def test_daily_stats_with_meals(self, client, auth_headers, sample_meal):
        resp = client.get('/api/analytics/daily', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['totals']['calories'] == 350
        assert data['totals']['protein'] == 12.0
        assert data['totals']['meals_count'] == 1

    def test_daily_stats_progress_percent(self, client, auth_headers, sample_meal):
        resp = client.get('/api/analytics/daily', headers=auth_headers)
        data = resp.get_json()
        # Цель по умолчанию: 2500 cal, 350/2500 = 14%
        assert data['progress']['calories'] == pytest.approx(14.0, abs=0.1)

    def test_daily_stats_remaining(self, client, auth_headers, sample_meal):
        resp = client.get('/api/analytics/daily', headers=auth_headers)
        data = resp.get_json()
        assert data['remaining']['calories'] == 2150  # 2500 - 350

    def test_daily_stats_empty_day(self, client, auth_headers):
        yesterday = (date.today() - timedelta(days=1)).isoformat()
        resp = client.get(f'/api/analytics/daily?date={yesterday}', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['totals']['calories'] == 0

    def test_daily_stats_creates_goals_if_missing(self, client, app, auth_headers, user1):
        # Удаляем цели
        with app.app_context():
            UserGoals.query.filter_by(user_id=user1.id).delete()
            db.session.commit()

        resp = client.get('/api/analytics/daily', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['goals'] is not None


class TestWeeklyStats:

    def test_weekly_stats(self, client, auth_headers, meals_for_week):
        resp = client.get('/api/analytics/weekly', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['summary']['total_meals'] == 7
        assert data['summary']['total_calories'] == 3500
        assert data['summary']['avg_calories'] == 500
        assert len(data['daily']) == 7

    def test_weekly_stats_empty(self, client, auth_headers):
        resp = client.get('/api/analytics/weekly', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['summary']['total_meals'] == 0

    def test_weekly_days_with_goal(self, client, auth_headers, app, user1, meals_for_week):
        # Устанавливаем цель 500 cal — каждый день должен быть в пределах ±10%
        with app.app_context():
            goals = UserGoals.query.filter_by(user_id=user1.id).first()
            goals.calories_goal = 500
            db.session.commit()

        resp = client.get('/api/analytics/weekly', headers=auth_headers)
        data = resp.get_json()
        assert data['summary']['days_with_goal'] == 7


class TestMonthlyStats:

    def test_monthly_stats(self, client, auth_headers, meals_for_week):
        today = date.today()
        resp = client.get(
            f'/api/analytics/monthly?year={today.year}&month={today.month}',
            headers=auth_headers,
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['summary']['total_meals'] >= 1
        assert data['totals']['calories'] > 0

    def test_monthly_stats_empty_month(self, client, auth_headers):
        # Проверяем месяц без данных
        resp = client.get('/api/analytics/monthly?year=2020&month=1', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['summary']['total_meals'] == 0

    def test_monthly_stats_december(self, client, auth_headers, app, user1):
        """Проверка декабрь (month=12 -> end = jan следующего года)."""
        with app.app_context():
            db.session.add(Meal(
                user_id=user1.id, name='Dec meal', meal_type='lunch',
                meal_date=date(2025, 12, 15),
                calories=100, protein=5, carbs=10, fats=3,
            ))
            db.session.commit()

        resp = client.get('/api/analytics/monthly?year=2025&month=12', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['summary']['total_meals'] == 1


class TestTopFoods:

    def test_top_foods(self, client, auth_headers, meals_for_week):
        resp = client.get('/api/analytics/top-foods', headers=auth_headers)
        assert resp.status_code == 200
        foods = resp.get_json()['top_foods']
        assert len(foods) > 0
        # Завтрак встречается чаще (4 раза vs 3)
        assert foods[0]['name'] == 'Завтрак'
        assert foods[0]['count'] == 4

    def test_top_foods_custom_period(self, client, auth_headers, meals_for_week):
        resp = client.get('/api/analytics/top-foods?days=3&limit=5', headers=auth_headers)
        assert resp.status_code == 200


class TestStreak:

    def test_streak_with_data(self, client, auth_headers, meals_for_streak):
        resp = client.get('/api/analytics/streak', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['current_streak'] == 5
        assert data['longest_streak'] >= 5
        assert data['total_days_tracked'] == 6

    def test_streak_empty(self, client, auth_headers):
        resp = client.get('/api/analytics/streak', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['current_streak'] == 0

    def test_streak_broken(self, client, auth_headers, app, user1):
        """Серия прерывается если пропущен день."""
        with app.app_context():
            today = date.today()
            # Есть запись на сегодня и позавчера, но не вчера
            db.session.add(Meal(
                user_id=user1.id, name='Today', meal_type='lunch',
                meal_date=today, calories=100, protein=5, carbs=10, fats=3,
            ))
            db.session.add(Meal(
                user_id=user1.id, name='Day before yesterday', meal_type='lunch',
                meal_date=today - timedelta(days=2),
                calories=100, protein=5, carbs=10, fats=3,
            ))
            db.session.commit()

        resp = client.get('/api/analytics/streak', headers=auth_headers)
        assert resp.get_json()['current_streak'] == 1
