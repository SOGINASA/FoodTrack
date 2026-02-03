"""
Тесты холодильника: CRUD продуктов, срок годности, геолокация, шаринг.
"""
import json
import math
import pytest
from datetime import date, timedelta
from models import db, FridgeProduct, ProductShareRequest, User


class TestFridgeCRUD:

    def test_add_product(self, client, auth_headers):
        resp = client.post('/api/fridge', headers=auth_headers, json={
            'name': 'Молоко',
            'quantity': 2,
            'unit': 'л',
            'category': 'dairy',
            'expiryDate': (date.today() + timedelta(days=5)).isoformat(),
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data['name'] == 'Молоко'
        assert data['quantity'] == 2
        assert data['category'] == 'dairy'

    def test_add_product_no_name(self, client, auth_headers):
        resp = client.post('/api/fridge', headers=auth_headers, json={
            'quantity': 1,
        })
        assert resp.status_code == 400

    def test_add_product_invalid_date(self, client, auth_headers):
        resp = client.post('/api/fridge', headers=auth_headers, json={
            'name': 'Test',
            'expiryDate': 'not-a-date',
        })
        assert resp.status_code == 400

    def test_get_products(self, client, auth_headers, app, user1):
        with app.app_context():
            db.session.add(FridgeProduct(user_id=user1.id, name='Яйца', quantity=10, unit='шт'))
            db.session.commit()

        resp = client.get('/api/fridge', headers=auth_headers)
        assert resp.status_code == 200
        assert len(resp.get_json()) == 1

    def test_update_product(self, client, auth_headers, app, user1):
        with app.app_context():
            p = FridgeProduct(user_id=user1.id, name='Хлеб', quantity=1, unit='шт')
            db.session.add(p)
            db.session.commit()
            pid = p.id

        resp = client.put(f'/api/fridge/{pid}', headers=auth_headers, json={
            'name': 'Хлеб бородинский',
            'quantity': 2,
        })
        assert resp.status_code == 200
        assert resp.get_json()['name'] == 'Хлеб бородинский'

    def test_update_product_not_found(self, client, auth_headers):
        resp = client.put('/api/fridge/999', headers=auth_headers, json={'name': 'x'})
        assert resp.status_code == 404

    def test_update_other_users_product(self, client, auth_headers_user2, app, user1):
        with app.app_context():
            p = FridgeProduct(user_id=user1.id, name='Сыр', quantity=1)
            db.session.add(p)
            db.session.commit()
            pid = p.id

        resp = client.put(f'/api/fridge/{pid}', headers=auth_headers_user2, json={'name': 'x'})
        assert resp.status_code == 403

    def test_delete_product(self, client, auth_headers, app, user1):
        with app.app_context():
            p = FridgeProduct(user_id=user1.id, name='Масло', quantity=1)
            db.session.add(p)
            db.session.commit()
            pid = p.id

        resp = client.delete(f'/api/fridge/{pid}', headers=auth_headers)
        assert resp.status_code == 200

    def test_delete_other_users_product(self, client, auth_headers_user2, app, user1):
        with app.app_context():
            p = FridgeProduct(user_id=user1.id, name='Кефир', quantity=1)
            db.session.add(p)
            db.session.commit()
            pid = p.id

        resp = client.delete(f'/api/fridge/{pid}', headers=auth_headers_user2)
        assert resp.status_code == 403


class TestExpiringSoon:

    def test_expiring_soon(self, client, auth_headers, app, user1):
        with app.app_context():
            # Истекает через 3 дня
            db.session.add(FridgeProduct(
                user_id=user1.id, name='Йогурт', quantity=1,
                expiry_date=date.today() + timedelta(days=3),
            ))
            # Истекает через 10 дней — за пределами 7-дневного окна
            db.session.add(FridgeProduct(
                user_id=user1.id, name='Консервы', quantity=1,
                expiry_date=date.today() + timedelta(days=10),
            ))
            # Уже просрочен
            db.session.add(FridgeProduct(
                user_id=user1.id, name='Сметана', quantity=1,
                expiry_date=date.today() - timedelta(days=1),
            ))
            db.session.commit()

        resp = client.get('/api/fridge/expiring-soon', headers=auth_headers)
        assert resp.status_code == 200
        products = resp.get_json()
        assert len(products) == 1
        assert products[0]['name'] == 'Йогурт'


# ==================== Haversine ====================

class TestHaversine:

    def test_haversine_same_point(self):
        from routes.fridge import haversine
        assert haversine(55.75, 37.62, 55.75, 37.62) == 0

    def test_haversine_known_distance(self):
        """Москва → Санкт-Петербург ≈ 634 км."""
        from routes.fridge import haversine
        dist = haversine(55.7558, 37.6173, 59.9343, 30.3351)
        assert 630_000 < dist < 640_000

    def test_haversine_short_distance(self):
        from routes.fridge import haversine
        dist = haversine(55.7558, 37.6173, 55.7560, 37.6175)
        assert dist < 30  # менее 30 метров


# ==================== Геолокация ====================

class TestGeolocation:

    def test_update_location(self, client, auth_headers, app, user1):
        resp = client.post('/api/fridge/update-location', headers=auth_headers, json={
            'lat': 55.75,
            'lng': 37.62,
        })
        assert resp.status_code == 200

        with app.app_context():
            user = User.query.get(user1.id)
            assert user.latitude == 55.75
            assert user.longitude == 37.62

    def test_update_location_missing_coords(self, client, auth_headers):
        resp = client.post('/api/fridge/update-location', headers=auth_headers, json={
            'lat': 55.75,
        })
        assert resp.status_code == 400

    def test_nearby_users(self, client, auth_headers, app, user1, user2):
        with app.app_context():
            user = User.query.get(user2.id)
            user.latitude = 55.7510
            user.longitude = 37.6210
            user.is_active = True
            db.session.commit()

        resp = client.get(
            '/api/fridge/nearby-users?lat=55.7500&lng=37.6200',
            headers=auth_headers,
        )
        assert resp.status_code == 200
        nearby = resp.get_json()
        assert len(nearby) >= 1
        assert nearby[0]['distance'] < 1000

    def test_nearby_users_missing_coords(self, client, auth_headers):
        resp = client.get('/api/fridge/nearby-users', headers=auth_headers)
        assert resp.status_code == 400


# ==================== Sharing ====================

class TestProductSharing:

    @pytest.fixture
    def products_to_share(self, app, user1):
        with app.app_context():
            p1 = FridgeProduct(user_id=user1.id, name='Сок', quantity=2, unit='л')
            p2 = FridgeProduct(user_id=user1.id, name='Печенье', quantity=1, unit='упак')
            db.session.add_all([p1, p2])
            db.session.commit()
            return [p1.id, p2.id]

    def test_send_share_request(self, client, auth_headers, user2, products_to_share):
        resp = client.post('/api/fridge/share/send', headers=auth_headers, json={
            'recipientId': user2.id,
            'productIds': products_to_share,
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data['status'] == 'pending'
        assert len(data['products']) == 2

    def test_send_share_to_self(self, client, auth_headers, user1, products_to_share):
        resp = client.post('/api/fridge/share/send', headers=auth_headers, json={
            'recipientId': user1.id,
            'productIds': products_to_share,
        })
        assert resp.status_code == 400

    def test_send_share_no_recipient(self, client, auth_headers, products_to_share):
        resp = client.post('/api/fridge/share/send', headers=auth_headers, json={
            'productIds': products_to_share,
        })
        assert resp.status_code == 400

    def test_send_share_no_products(self, client, auth_headers, user2):
        resp = client.post('/api/fridge/share/send', headers=auth_headers, json={
            'recipientId': user2.id,
            'productIds': [],
        })
        assert resp.status_code == 400

    def test_accept_share_request(self, client, auth_headers, auth_headers_user2,
                                   user2, products_to_share, app):
        # Отправляем
        resp = client.post('/api/fridge/share/send', headers=auth_headers, json={
            'recipientId': user2.id,
            'productIds': products_to_share,
        })
        req_id = resp.get_json()['id']

        # Принимаем
        resp2 = client.post(f'/api/fridge/share/accept/{req_id}',
                            headers=auth_headers_user2)
        assert resp2.status_code == 200
        assert resp2.get_json()['status'] == 'accepted'

        # Проверяем, что продукты появились у user2
        resp3 = client.get('/api/fridge', headers=auth_headers_user2)
        products = resp3.get_json()
        assert len(products) == 2

    def test_reject_share_request(self, client, auth_headers, auth_headers_user2,
                                   user2, products_to_share):
        resp = client.post('/api/fridge/share/send', headers=auth_headers, json={
            'recipientId': user2.id,
            'productIds': products_to_share,
        })
        req_id = resp.get_json()['id']

        resp2 = client.post(f'/api/fridge/share/reject/{req_id}',
                            headers=auth_headers_user2)
        assert resp2.status_code == 200
        assert resp2.get_json()['status'] == 'rejected'

    def test_cannot_accept_others_share(self, client, auth_headers, auth_headers_user2,
                                         user2, products_to_share):
        resp = client.post('/api/fridge/share/send', headers=auth_headers, json={
            'recipientId': user2.id,
            'productIds': products_to_share,
        })
        req_id = resp.get_json()['id']

        # user1 пытается принять запрос, предназначенный user2
        resp2 = client.post(f'/api/fridge/share/accept/{req_id}', headers=auth_headers)
        assert resp2.status_code == 403

    def test_get_share_requests(self, client, auth_headers, auth_headers_user2,
                                 user2, products_to_share):
        client.post('/api/fridge/share/send', headers=auth_headers, json={
            'recipientId': user2.id,
            'productIds': products_to_share,
        })

        resp = client.get('/api/fridge/share/requests', headers=auth_headers_user2)
        assert resp.status_code == 200
        assert len(resp.get_json()) == 1

    def test_cannot_accept_already_processed(self, client, auth_headers, auth_headers_user2,
                                              user2, products_to_share):
        resp = client.post('/api/fridge/share/send', headers=auth_headers, json={
            'recipientId': user2.id,
            'productIds': products_to_share,
        })
        req_id = resp.get_json()['id']
        client.post(f'/api/fridge/share/accept/{req_id}', headers=auth_headers_user2)

        # Повторная попытка
        resp2 = client.post(f'/api/fridge/share/accept/{req_id}', headers=auth_headers_user2)
        assert resp2.status_code == 400
