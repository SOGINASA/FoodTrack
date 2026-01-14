from routes.auth import auth_bp
from routes.meals import meals_bp
from routes.goals import goals_bp
from routes.analytics import analytics_bp


__all__ = [
    'auth_bp',
    'meals_bp',
    'goals_bp',
    'analytics_bp',
]