"""
Тесты дружбы: запросы, принятие, отклонение, поиск, авто-принятие встречных.
"""
import pytest
from models import db, Friendship


class TestSendFriendRequest:

    def test_send_request(self, client, auth_headers, user2):
        resp = client.post('/api/friends/request', headers=auth_headers, json={
            'userId': user2.id,
        })
        assert resp.status_code == 201
        assert resp.get_json()['status'] == 'pending'

    def test_cannot_friend_self(self, client, auth_headers, user1):
        resp = client.post('/api/friends/request', headers=auth_headers, json={
            'userId': user1.id,
        })
        assert resp.status_code == 400

    def test_cannot_send_duplicate(self, client, auth_headers, user2):
        client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        resp = client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        assert resp.status_code == 400

    def test_nonexistent_user(self, client, auth_headers):
        resp = client.post('/api/friends/request', headers=auth_headers, json={
            'userId': 9999,
        })
        assert resp.status_code == 404

    def test_auto_accept_mutual_request(self, client, auth_headers, auth_headers_user2, user1, user2):
        """Если user2 уже отправил запрос user1, user1 отправка автоматически принимает."""
        # user2 -> user1
        client.post('/api/friends/request', headers=auth_headers_user2, json={'userId': user1.id})
        # user1 -> user2 (встречный) — автопринятие
        resp = client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        assert resp.status_code == 200
        assert resp.get_json()['status'] == 'accepted'

    def test_resend_after_rejection(self, client, auth_headers, auth_headers_user2, user1, user2, app):
        """Можно повторно отправить запрос после отклонения."""
        # Отправляем и отклоняем
        resp = client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        fid = resp.get_json()['id']
        client.post(f'/api/friends/reject/{fid}', headers=auth_headers_user2)

        # Повторный запрос
        resp2 = client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        assert resp2.status_code == 201
        assert resp2.get_json()['status'] == 'pending'

    def test_cannot_request_blocked_user(self, client, auth_headers, user2, app):
        with app.app_context():
            f = Friendship(requester_id=user2.id, addressee_id=user2.id - 1,
                           status='blocked')
            # Создаём блокировку user1 -> user2
            f2 = Friendship(
                requester_id=user2.id,
                addressee_id=user2.id,
                status='blocked',
            )
            # Правильно: блокировка между user1 и user2
            blocked = Friendship(
                requester_id=user2.id - 1 if user2.id > 1 else user2.id,
                addressee_id=user2.id,
                status='blocked',
            )
            db.session.add(Friendship(
                requester_id=user2.id,
                addressee_id=user2.id - 1,
                status='blocked',
            ))
            db.session.commit()

        # user1 (id = user2.id - 1) пытается отправить запрос user2
        resp = client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        assert resp.status_code == 400


class TestAcceptRejectFriend:

    @pytest.fixture
    def pending_friendship(self, client, auth_headers, user2):
        resp = client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        return resp.get_json()['id']

    def test_accept_request(self, client, auth_headers_user2, pending_friendship):
        resp = client.post(f'/api/friends/accept/{pending_friendship}',
                           headers=auth_headers_user2)
        assert resp.status_code == 200
        assert resp.get_json()['status'] == 'accepted'

    def test_only_addressee_can_accept(self, client, auth_headers, pending_friendship):
        """Отправитель не может сам принять свой запрос."""
        resp = client.post(f'/api/friends/accept/{pending_friendship}',
                           headers=auth_headers)
        assert resp.status_code == 403

    def test_reject_request(self, client, auth_headers_user2, pending_friendship):
        resp = client.post(f'/api/friends/reject/{pending_friendship}',
                           headers=auth_headers_user2)
        assert resp.status_code == 200
        assert resp.get_json()['status'] == 'rejected'

    def test_cannot_accept_twice(self, client, auth_headers_user2, pending_friendship):
        client.post(f'/api/friends/accept/{pending_friendship}', headers=auth_headers_user2)
        resp = client.post(f'/api/friends/accept/{pending_friendship}',
                           headers=auth_headers_user2)
        assert resp.status_code == 400

    def test_accept_not_found(self, client, auth_headers):
        resp = client.post('/api/friends/accept/999', headers=auth_headers)
        assert resp.status_code == 404


class TestRemoveFriend:

    def test_remove_friend(self, client, auth_headers, auth_headers_user2, user2):
        resp = client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        fid = resp.get_json()['id']
        client.post(f'/api/friends/accept/{fid}', headers=auth_headers_user2)

        resp = client.delete(f'/api/friends/{fid}', headers=auth_headers)
        assert resp.status_code == 200

    def test_remove_not_found(self, client, auth_headers):
        resp = client.delete('/api/friends/999', headers=auth_headers)
        assert resp.status_code == 404

    def test_remove_not_authorized(self, client, auth_headers, app, user1, user2, create_user):
        user3 = create_user(email='user3@test.com', nickname='user3')
        # Дружба между user1 и user2
        with app.app_context():
            f = Friendship(requester_id=user1.id, addressee_id=user2.id, status='accepted')
            db.session.add(f)
            db.session.commit()
            fid = f.id

        # user3 пытается удалить
        with app.app_context():
            token = __import__('flask_jwt_extended').create_access_token(identity=str(user3.id))
        resp = client.delete(f'/api/friends/{fid}',
                             headers={'Authorization': f'Bearer {token}',
                                      'Content-Type': 'application/json'})
        assert resp.status_code == 403


class TestGetFriends:

    def test_get_friends_list(self, client, auth_headers, auth_headers_user2, user2):
        resp = client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        fid = resp.get_json()['id']
        client.post(f'/api/friends/accept/{fid}', headers=auth_headers_user2)

        resp = client.get('/api/friends', headers=auth_headers)
        assert resp.status_code == 200
        friends = resp.get_json()
        assert len(friends) == 1
        assert friends[0]['userId'] == user2.id

    def test_get_incoming_requests(self, client, auth_headers, auth_headers_user2, user1):
        client.post('/api/friends/request', headers=auth_headers_user2, json={'userId': user1.id})

        resp = client.get('/api/friends/requests/incoming', headers=auth_headers)
        assert resp.status_code == 200
        assert len(resp.get_json()) == 1

    def test_get_outgoing_requests(self, client, auth_headers, user2):
        client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})

        resp = client.get('/api/friends/requests/outgoing', headers=auth_headers)
        assert resp.status_code == 200
        assert len(resp.get_json()) == 1


class TestFriendSearch:

    def test_search_users(self, client, auth_headers, user2):
        resp = client.get('/api/friends/search?q=user2', headers=auth_headers)
        assert resp.status_code == 200
        results = resp.get_json()
        assert len(results) == 1
        assert results[0]['nickname'] == 'user2'

    def test_search_excludes_self(self, client, auth_headers, user1):
        resp = client.get('/api/friends/search?q=user1', headers=auth_headers)
        assert resp.status_code == 200
        assert len(resp.get_json()) == 0

    def test_search_excludes_existing_friends(self, client, auth_headers, auth_headers_user2, user2):
        # Добавляем в друзья
        resp = client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        fid = resp.get_json()['id']
        client.post(f'/api/friends/accept/{fid}', headers=auth_headers_user2)

        resp = client.get('/api/friends/search?q=user2', headers=auth_headers)
        assert len(resp.get_json()) == 0

    def test_search_too_short_query(self, client, auth_headers):
        resp = client.get('/api/friends/search?q=a', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json() == []


class TestFriendshipStatus:

    def test_status_self(self, client, auth_headers, user1):
        resp = client.get(f'/api/friends/status/{user1.id}', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['status'] == 'self'

    def test_status_none(self, client, auth_headers, user2):
        resp = client.get(f'/api/friends/status/{user2.id}', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['status'] == 'none'

    def test_status_pending(self, client, auth_headers, user2):
        client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        resp = client.get(f'/api/friends/status/{user2.id}', headers=auth_headers)
        data = resp.get_json()
        assert data['status'] == 'pending'
        assert data['isRequester'] is True

    def test_status_accepted(self, client, auth_headers, auth_headers_user2, user2):
        resp = client.post('/api/friends/request', headers=auth_headers, json={'userId': user2.id})
        fid = resp.get_json()['id']
        client.post(f'/api/friends/accept/{fid}', headers=auth_headers_user2)

        resp = client.get(f'/api/friends/status/{user2.id}', headers=auth_headers)
        assert resp.get_json()['status'] == 'accepted'
