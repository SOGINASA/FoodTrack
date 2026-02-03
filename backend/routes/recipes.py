from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Recipe
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

recipes_bp = Blueprint('recipes', __name__)


@recipes_bp.route('get', methods=['GET'])
@jwt_required()
def get_recipes():
    """Получить список рецептов с фильтрацией"""
    try:
        category = request.args.get('category')
        difficulty = request.args.get('difficulty')
        search = request.args.get('search')

        query = Recipe.query

        if category and category != 'all':
            query = query.filter(Recipe.category == category)

        if difficulty and difficulty != 'all':
            query = query.filter(Recipe.difficulty == difficulty)

        if search:
            search_lower = f'%{search.lower()}%'
            query = query.filter(
                db.or_(
                    db.func.lower(Recipe.name).like(search_lower),
                    db.func.lower(Recipe.tags).like(search_lower)
                )
            )

        recipes = query.order_by(Recipe.id.asc()).all()

        return jsonify({
            'recipes': [r.to_dict() for r in recipes],
            'count': len(recipes)
        })

    except Exception as e:
        logger.error(f"[GET /recipes] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка получения рецептов'}), 500


@recipes_bp.route('/<int:recipe_id>', methods=['GET'])
@jwt_required()
def get_recipe(recipe_id):
    """Получить конкретный рецепт"""
    try:
        recipe = Recipe.query.get(recipe_id)

        if not recipe:
            return jsonify({'error': 'Рецепт не найден'}), 404

        return jsonify({'recipe': recipe.to_dict()})

    except Exception as e:
        logger.error(f"[GET /recipes/{recipe_id}] Ошибка: {e}", exc_info=True)
        return jsonify({'error': 'Ошибка получения рецепта'}), 500
