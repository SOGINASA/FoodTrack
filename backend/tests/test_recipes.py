"""
Тесты каталога рецептов.
"""
import json
import pytest
from models import db, Recipe


class TestRecipes:

    def test_get_recipes(self, client, auth_headers, sample_recipe):
        resp = client.get('/api/recipes', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['count'] == 1

    def test_get_recipe_by_id(self, client, auth_headers, sample_recipe):
        resp = client.get(f'/api/recipes/{sample_recipe.id}', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['recipe']['name'] == 'Греческий салат'

    def test_get_recipe_not_found(self, client, auth_headers):
        resp = client.get('/api/recipes/999', headers=auth_headers)
        assert resp.status_code == 404

    def test_filter_by_category(self, client, auth_headers, app):
        with app.app_context():
            db.session.add(Recipe(name='Завтрак', category='breakfast', calories=200))
            db.session.add(Recipe(name='Ужин', category='dinner', calories=400))
            db.session.commit()

        resp = client.get('/api/recipes?category=breakfast', headers=auth_headers)
        recipes = resp.get_json()['recipes']
        assert all(r['category'] == 'breakfast' for r in recipes)

    def test_filter_by_difficulty(self, client, auth_headers, sample_recipe):
        resp = client.get('/api/recipes?difficulty=easy', headers=auth_headers)
        assert resp.get_json()['count'] >= 1

    def test_search_by_name(self, client, auth_headers, sample_recipe):
        resp = client.get('/api/recipes?search=салат', headers=auth_headers)
        assert resp.get_json()['count'] >= 1

    def test_search_no_results(self, client, auth_headers, sample_recipe):
        resp = client.get('/api/recipes?search=несуществующее', headers=auth_headers)
        assert resp.get_json()['count'] == 0

    def test_filter_all_category(self, client, auth_headers, sample_recipe):
        """category=all не фильтрует."""
        resp = client.get('/api/recipes?category=all', headers=auth_headers)
        assert resp.get_json()['count'] >= 1

    def test_unauthorized_access(self, client):
        resp = client.get('/api/recipes')
        assert resp.status_code == 401
