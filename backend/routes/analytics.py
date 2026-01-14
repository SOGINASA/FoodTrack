from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Meal, UserGoals
from datetime import datetime, date, timedelta
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/daily', methods=['GET'])
@jwt_required()
def get_daily_stats():
    """Получить статистику за день"""
    try:
        user_id = int(get_jwt_identity())

        date_str = request.args.get('date', date.today().isoformat())
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()

        meals = Meal.query.filter_by(
            user_id=user_id,
            meal_date=target_date
        ).all()

        # Получаем цели пользователя
        goals = UserGoals.query.filter_by(user_id=user_id).first()
        if not goals:
            goals = UserGoals(user_id=user_id)
            db.session.add(goals)
            db.session.commit()

        totals = {
            'calories': sum(m.calories for m in meals),
            'protein': sum(m.protein for m in meals),
            'carbs': sum(m.carbs for m in meals),
            'fats': sum(m.fats for m in meals),
            'meals_count': len(meals)
        }

        # Проценты от целей
        progress = {
            'calories': round((totals['calories'] / goals.calories_goal) * 100, 1) if goals.calories_goal else 0,
            'protein': round((totals['protein'] / goals.protein_goal) * 100, 1) if goals.protein_goal else 0,
            'carbs': round((totals['carbs'] / goals.carbs_goal) * 100, 1) if goals.carbs_goal else 0,
            'fats': round((totals['fats'] / goals.fats_goal) * 100, 1) if goals.fats_goal else 0,
        }

        remaining = {
            'calories': max(0, goals.calories_goal - totals['calories']),
            'protein': max(0, goals.protein_goal - totals['protein']),
            'carbs': max(0, goals.carbs_goal - totals['carbs']),
            'fats': max(0, goals.fats_goal - totals['fats']),
        }

        return jsonify({
            'date': target_date.isoformat(),
            'totals': totals,
            'goals': goals.to_dict(),
            'progress': progress,
            'remaining': remaining
        })

    except Exception as e:
        print(f"Ошибка получения дневной статистики: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500


@analytics_bp.route('/weekly', methods=['GET'])
@jwt_required()
def get_weekly_stats():
    """Получить статистику за неделю"""
    try:
        user_id = int(get_jwt_identity())

        end_date = date.today()
        start_date = end_date - timedelta(days=6)

        # Получаем все приёмы пищи за неделю
        meals = Meal.query.filter(
            Meal.user_id == user_id,
            Meal.meal_date >= start_date,
            Meal.meal_date <= end_date
        ).all()

        # Группируем по дням
        daily_data = {}
        for i in range(7):
            day = start_date + timedelta(days=i)
            daily_data[day.isoformat()] = {
                'date': day.isoformat(),
                'calories': 0,
                'protein': 0,
                'carbs': 0,
                'fats': 0,
                'meals_count': 0
            }

        for meal in meals:
            day_key = meal.meal_date.isoformat()
            if day_key in daily_data:
                daily_data[day_key]['calories'] += meal.calories
                daily_data[day_key]['protein'] += meal.protein
                daily_data[day_key]['carbs'] += meal.carbs
                daily_data[day_key]['fats'] += meal.fats
                daily_data[day_key]['meals_count'] += 1

        # Получаем цели
        goals = UserGoals.query.filter_by(user_id=user_id).first()
        calories_goal = goals.calories_goal if goals else 2500

        # Считаем дни с достигнутой целью
        days_with_goal = sum(
            1 for d in daily_data.values()
            if 0.9 * calories_goal <= d['calories'] <= 1.1 * calories_goal
        )

        # Средние значения
        total_calories = sum(d['calories'] for d in daily_data.values())
        avg_calories = round(total_calories / 7) if meals else 0

        return jsonify({
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'daily': list(daily_data.values()),
            'summary': {
                'total_calories': total_calories,
                'avg_calories': avg_calories,
                'days_with_goal': days_with_goal,
                'total_meals': len(meals)
            }
        })

    except Exception as e:
        print(f"Ошибка получения недельной статистики: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500


@analytics_bp.route('/monthly', methods=['GET'])
@jwt_required()
def get_monthly_stats():
    """Получить статистику за месяц"""
    try:
        user_id = int(get_jwt_identity())

        # Можно указать месяц и год
        year = request.args.get('year', date.today().year, type=int)
        month = request.args.get('month', date.today().month, type=int)

        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)

        # Получаем все приёмы пищи за месяц
        meals = Meal.query.filter(
            Meal.user_id == user_id,
            Meal.meal_date >= start_date,
            Meal.meal_date <= end_date
        ).all()

        # Группируем по неделям
        weeks_data = {}
        for meal in meals:
            week_num = meal.meal_date.isocalendar()[1]
            if week_num not in weeks_data:
                weeks_data[week_num] = {
                    'week': week_num,
                    'calories': 0,
                    'protein': 0,
                    'carbs': 0,
                    'fats': 0,
                    'meals_count': 0
                }
            weeks_data[week_num]['calories'] += meal.calories
            weeks_data[week_num]['protein'] += meal.protein
            weeks_data[week_num]['carbs'] += meal.carbs
            weeks_data[week_num]['fats'] += meal.fats
            weeks_data[week_num]['meals_count'] += 1

        # Итоги за месяц
        total_days = (end_date - start_date).days + 1
        days_with_meals = len(set(m.meal_date for m in meals))

        totals = {
            'calories': sum(m.calories for m in meals),
            'protein': sum(m.protein for m in meals),
            'carbs': sum(m.carbs for m in meals),
            'fats': sum(m.fats for m in meals),
        }

        return jsonify({
            'month': month,
            'year': year,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'weeks': list(weeks_data.values()),
            'totals': totals,
            'summary': {
                'total_meals': len(meals),
                'days_tracked': days_with_meals,
                'total_days': total_days,
                'avg_daily_calories': round(totals['calories'] / days_with_meals) if days_with_meals else 0
            }
        })

    except Exception as e:
        print(f"Ошибка получения месячной статистики: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500


@analytics_bp.route('/top-foods', methods=['GET'])
@jwt_required()
def get_top_foods():
    """Получить топ продуктов пользователя"""
    try:
        user_id = int(get_jwt_identity())

        days = request.args.get('days', 30, type=int)
        limit = request.args.get('limit', 10, type=int)
        start_date = date.today() - timedelta(days=days)

        # Группируем по названию блюда
        top_foods = db.session.query(
            Meal.name,
            func.count(Meal.id).label('count'),
            func.avg(Meal.calories).label('avg_calories'),
            func.sum(Meal.calories).label('total_calories')
        ).filter(
            Meal.user_id == user_id,
            Meal.meal_date >= start_date
        ).group_by(Meal.name).order_by(
            func.count(Meal.id).desc()
        ).limit(limit).all()

        foods = [
            {
                'name': f.name,
                'count': f.count,
                'avg_calories': round(f.avg_calories or 0),
                'total_calories': f.total_calories or 0
            }
            for f in top_foods
        ]

        return jsonify({
            'top_foods': foods,
            'period_days': days
        })

    except Exception as e:
        print(f"Ошибка получения топ продуктов: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500


@analytics_bp.route('/streak', methods=['GET'])
@jwt_required()
def get_streak():
    """Получить серию дней с записями"""
    try:
        user_id = int(get_jwt_identity())

        # Получаем все уникальные даты с записями
        dates = db.session.query(Meal.meal_date).filter(
            Meal.user_id == user_id
        ).distinct().order_by(Meal.meal_date.desc()).all()

        dates = [d[0] for d in dates]

        if not dates:
            return jsonify({'current_streak': 0, 'longest_streak': 0})

        # Считаем текущую серию
        current_streak = 0
        today = date.today()

        for i, d in enumerate(dates):
            expected_date = today - timedelta(days=i)
            if d == expected_date:
                current_streak += 1
            else:
                break

        # Считаем самую длинную серию
        longest_streak = 1
        current = 1

        for i in range(1, len(dates)):
            if dates[i-1] - dates[i] == timedelta(days=1):
                current += 1
                longest_streak = max(longest_streak, current)
            else:
                current = 1

        return jsonify({
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'total_days_tracked': len(dates)
        })

    except Exception as e:
        print(f"Ошибка получения серии: {e}")
        return jsonify({'error': 'Ошибка получения данных'}), 500