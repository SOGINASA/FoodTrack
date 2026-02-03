"""
Тесты прогресса: замеры тела и фото прогресса.
"""
import pytest
from datetime import date, timedelta
from models import db, Measurement, ProgressPhoto


class TestMeasurements:

    def test_add_measurement(self, client, auth_headers):
        resp = client.post('/api/progress/measurements', headers=auth_headers, json={
            'date': date.today().isoformat(),
            'chest': 100,
            'waist': 80,
            'hips': 95,
            'biceps': 35,
            'notes': 'Утро',
        })
        assert resp.status_code == 201
        m = resp.get_json()['measurement']
        assert m['chest'] == 100
        assert m['waist'] == 80

    def test_add_measurement_updates_existing(self, client, auth_headers):
        today = date.today().isoformat()
        client.post('/api/progress/measurements', headers=auth_headers, json={
            'date': today, 'chest': 100,
        })
        resp = client.post('/api/progress/measurements', headers=auth_headers, json={
            'date': today, 'chest': 102,
        })
        assert resp.status_code == 201
        assert resp.get_json()['measurement']['chest'] == 102

    def test_get_measurements(self, client, auth_headers, app, user1):
        with app.app_context():
            db.session.add(Measurement(
                user_id=user1.id, date=date.today(),
                chest=98, waist=78,
            ))
            db.session.commit()

        resp = client.get('/api/progress/measurements', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['count'] == 1

    def test_delete_measurement(self, client, auth_headers, app, user1):
        with app.app_context():
            m = Measurement(user_id=user1.id, date=date.today(), chest=100)
            db.session.add(m)
            db.session.commit()
            mid = m.id

        resp = client.delete(f'/api/progress/measurements/{mid}', headers=auth_headers)
        assert resp.status_code == 200

    def test_delete_measurement_not_found(self, client, auth_headers):
        resp = client.delete('/api/progress/measurements/999', headers=auth_headers)
        assert resp.status_code == 404

    def test_add_measurement_no_data(self, client, auth_headers):
        resp = client.post('/api/progress/measurements', headers=auth_headers,
                           data='', content_type='application/json')
        assert resp.status_code == 400


class TestProgressPhotos:

    def test_add_photo(self, client, auth_headers):
        resp = client.post('/api/progress/photos', headers=auth_headers, json={
            'image_url': 'https://example.com/photo.jpg',
            'category': 'front',
            'notes': 'Начало',
        })
        assert resp.status_code == 201
        photo = resp.get_json()['photo']
        assert photo['image_url'] == 'https://example.com/photo.jpg'
        assert photo['category'] == 'front'

    def test_add_photo_no_url(self, client, auth_headers):
        resp = client.post('/api/progress/photos', headers=auth_headers, json={
            'category': 'front',
        })
        assert resp.status_code == 400

    def test_get_photos(self, client, auth_headers, app, user1):
        with app.app_context():
            db.session.add(ProgressPhoto(
                user_id=user1.id, date=date.today(),
                image_url='https://example.com/p1.jpg',
            ))
            db.session.commit()

        resp = client.get('/api/progress/photos', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['count'] == 1

    def test_delete_photo(self, client, auth_headers, app, user1):
        with app.app_context():
            p = ProgressPhoto(
                user_id=user1.id, date=date.today(),
                image_url='https://example.com/p1.jpg',
            )
            db.session.add(p)
            db.session.commit()
            pid = p.id

        resp = client.delete(f'/api/progress/photos/{pid}', headers=auth_headers)
        assert resp.status_code == 200

    def test_delete_photo_not_found(self, client, auth_headers):
        resp = client.delete('/api/progress/photos/999', headers=auth_headers)
        assert resp.status_code == 404
