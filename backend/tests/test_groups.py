"""
Тесты групп: CRUD, вступление/выход, посты, лайки, комментарии, форум.
"""
import pytest
from models import db, Group, GroupMember, GroupPost, ForumTopic


class TestGroupCRUD:

    def test_create_group(self, client, auth_headers):
        resp = client.post('/api/groups/create', headers=auth_headers, json={
            'name': 'Fitness Club',
            'description': 'Work hard',
            'isPublic': True,
        })
        assert resp.status_code == 201
        data = resp.get_json()
        assert data['name'] == 'Fitness Club'
        assert data['membersCount'] == 1  # создатель автоматически участник

    def test_create_group_no_name(self, client, auth_headers):
        resp = client.post('/api/groups/create', headers=auth_headers, json={
            'description': 'No name',
        })
        assert resp.status_code == 400

    def test_get_my_groups(self, client, auth_headers, sample_group):
        resp = client.get('/api/groups/all', headers=auth_headers)
        assert resp.status_code == 200
        assert len(resp.get_json()) == 1

    def test_get_group_details(self, client, auth_headers, sample_group):
        resp = client.get(f'/api/groups/{sample_group.id}', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['name'] == 'Test Group'

    def test_update_group(self, client, auth_headers, sample_group):
        resp = client.put(f'/api/groups/{sample_group.id}', headers=auth_headers, json={
            'name': 'Updated Group',
        })
        assert resp.status_code == 200
        assert resp.get_json()['name'] == 'Updated Group'

    def test_update_group_no_permission(self, client, auth_headers_user2, sample_group):
        resp = client.put(f'/api/groups/{sample_group.id}', headers=auth_headers_user2, json={
            'name': 'Hacked',
        })
        assert resp.status_code == 403

    def test_delete_group(self, client, auth_headers, sample_group):
        resp = client.delete(f'/api/groups/{sample_group.id}', headers=auth_headers)
        assert resp.status_code == 200

    def test_delete_group_not_owner(self, client, auth_headers_user2, sample_group, app, user2):
        with app.app_context():
            db.session.add(GroupMember(group_id=sample_group.id, user_id=user2.id, role='member'))
            db.session.commit()

        resp = client.delete(f'/api/groups/{sample_group.id}', headers=auth_headers_user2)
        assert resp.status_code == 403


class TestGroupMembership:

    def test_join_public_group(self, client, auth_headers_user2, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/join', headers=auth_headers_user2)
        assert resp.status_code == 200

    def test_join_private_group_forbidden(self, client, auth_headers_user2, app, user1):
        with app.app_context():
            g = Group(name='Private', is_public=False, owner_id=user1.id)
            db.session.add(g)
            db.session.flush()
            db.session.add(GroupMember(group_id=g.id, user_id=user1.id, role='owner'))
            db.session.commit()
            gid = g.id

        resp = client.post(f'/api/groups/{gid}/join', headers=auth_headers_user2)
        assert resp.status_code == 403

    def test_cannot_join_twice(self, client, auth_headers_user2, sample_group):
        client.post(f'/api/groups/{sample_group.id}/join', headers=auth_headers_user2)
        resp = client.post(f'/api/groups/{sample_group.id}/join', headers=auth_headers_user2)
        assert resp.status_code == 400

    def test_leave_group(self, client, auth_headers_user2, sample_group):
        client.post(f'/api/groups/{sample_group.id}/join', headers=auth_headers_user2)
        resp = client.post(f'/api/groups/{sample_group.id}/leave', headers=auth_headers_user2)
        assert resp.status_code == 200

    def test_owner_cannot_leave(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/leave', headers=auth_headers)
        assert resp.status_code == 400

    def test_get_members(self, client, auth_headers, sample_group):
        resp = client.get(f'/api/groups/{sample_group.id}/members', headers=auth_headers)
        assert resp.status_code == 200
        assert len(resp.get_json()) == 1

    def test_discover_public_groups(self, client, auth_headers_user2, sample_group):
        resp = client.get('/api/groups/discover', headers=auth_headers_user2)
        assert resp.status_code == 200
        groups = resp.get_json()
        assert any(g['id'] == sample_group.id for g in groups)


class TestGroupPosts:

    @pytest.fixture
    def group_with_member(self, client, auth_headers_user2, sample_group):
        client.post(f'/api/groups/{sample_group.id}/join', headers=auth_headers_user2)
        return sample_group

    def test_create_post(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/posts', headers=auth_headers, json={
            'text': 'Hello group!',
        })
        assert resp.status_code == 201
        assert resp.get_json()['text'] == 'Hello group!'

    def test_create_empty_post(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/posts', headers=auth_headers, json={})
        assert resp.status_code == 400

    def test_non_member_cannot_post(self, client, auth_headers_user2, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/posts',
                           headers=auth_headers_user2, json={'text': 'Spam'})
        assert resp.status_code == 403

    def test_get_posts(self, client, auth_headers, sample_group):
        client.post(f'/api/groups/{sample_group.id}/posts', headers=auth_headers,
                     json={'text': 'Post 1'})
        client.post(f'/api/groups/{sample_group.id}/posts', headers=auth_headers,
                     json={'text': 'Post 2'})

        resp = client.get(f'/api/groups/{sample_group.id}/posts', headers=auth_headers)
        assert resp.status_code == 200
        assert resp.get_json()['total'] == 2

    def test_delete_own_post(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/posts', headers=auth_headers,
                           json={'text': 'To delete'})
        post_id = resp.get_json()['id']

        resp2 = client.delete(f'/api/groups/{sample_group.id}/posts/{post_id}',
                              headers=auth_headers)
        assert resp2.status_code == 200

    def test_non_author_non_admin_cannot_delete(self, client, auth_headers, auth_headers_user2,
                                                  group_with_member):
        resp = client.post(f'/api/groups/{group_with_member.id}/posts', headers=auth_headers,
                           json={'text': 'Mine'})
        post_id = resp.get_json()['id']

        resp2 = client.delete(f'/api/groups/{group_with_member.id}/posts/{post_id}',
                              headers=auth_headers_user2)
        assert resp2.status_code == 403


class TestPostLikes:

    def test_like_post(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/posts', headers=auth_headers,
                           json={'text': 'Likeable'})
        post_id = resp.get_json()['id']

        resp2 = client.post(f'/api/groups/{sample_group.id}/posts/{post_id}/like',
                            headers=auth_headers)
        assert resp2.status_code == 200
        assert resp2.get_json()['action'] == 'liked'

    def test_unlike_post(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/posts', headers=auth_headers,
                           json={'text': 'Likeable'})
        post_id = resp.get_json()['id']

        client.post(f'/api/groups/{sample_group.id}/posts/{post_id}/like',
                     headers=auth_headers)
        resp2 = client.post(f'/api/groups/{sample_group.id}/posts/{post_id}/like',
                            headers=auth_headers)
        assert resp2.get_json()['action'] == 'unliked'


class TestPostComments:

    def test_add_comment(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/posts', headers=auth_headers,
                           json={'text': 'Commentable'})
        post_id = resp.get_json()['id']

        resp2 = client.post(f'/api/groups/{sample_group.id}/posts/{post_id}/comments',
                            headers=auth_headers, json={'text': 'Nice post!'})
        assert resp2.status_code == 201
        assert resp2.get_json()['text'] == 'Nice post!'

    def test_empty_comment(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/posts', headers=auth_headers,
                           json={'text': 'Post'})
        post_id = resp.get_json()['id']

        resp2 = client.post(f'/api/groups/{sample_group.id}/posts/{post_id}/comments',
                            headers=auth_headers, json={})
        assert resp2.status_code == 400


class TestForum:

    def test_create_topic(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/topics', headers=auth_headers, json={
            'title': 'Как набрать массу?',
            'content': 'Подскажите программу тренировок',
            'category': 'question',
        })
        assert resp.status_code == 201
        assert resp.get_json()['title'] == 'Как набрать массу?'

    def test_create_topic_missing_fields(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/topics', headers=auth_headers, json={
            'title': 'No content',
        })
        assert resp.status_code == 400

    def test_get_topics(self, client, auth_headers, sample_group):
        client.post(f'/api/groups/{sample_group.id}/topics', headers=auth_headers,
                     json={'title': 'T1', 'content': 'C1'})
        client.post(f'/api/groups/{sample_group.id}/topics', headers=auth_headers,
                     json={'title': 'T2', 'content': 'C2'})

        resp = client.get(f'/api/groups/{sample_group.id}/topics', headers=auth_headers)
        assert resp.status_code == 200
        assert len(resp.get_json()) == 2

    def test_pin_topic(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/topics', headers=auth_headers,
                           json={'title': 'Pinnable', 'content': 'Test'})
        topic_id = resp.get_json()['id']

        resp2 = client.post(f'/api/groups/{sample_group.id}/topics/{topic_id}/pin',
                            headers=auth_headers)
        assert resp2.status_code == 200
        assert resp2.get_json()['isPinned'] is True

        # Toggle unpin
        resp3 = client.post(f'/api/groups/{sample_group.id}/topics/{topic_id}/pin',
                            headers=auth_headers)
        assert resp3.get_json()['isPinned'] is False

    def test_pin_topic_not_admin(self, client, auth_headers_user2, sample_group, app, user2):
        with app.app_context():
            db.session.add(GroupMember(group_id=sample_group.id, user_id=user2.id, role='member'))
            topic = ForumTopic(group_id=sample_group.id, author_id=user2.id,
                               title='T', content='C')
            db.session.add(topic)
            db.session.commit()
            topic_id = topic.id

        resp = client.post(f'/api/groups/{sample_group.id}/topics/{topic_id}/pin',
                           headers=auth_headers_user2)
        assert resp.status_code == 403

    def test_add_reply(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/topics', headers=auth_headers,
                           json={'title': 'Discussion', 'content': 'Let us discuss'})
        topic_id = resp.get_json()['id']

        resp2 = client.post(f'/api/groups/{sample_group.id}/topics/{topic_id}/replies',
                            headers=auth_headers, json={'content': 'I agree!'})
        assert resp2.status_code == 201
        assert resp2.get_json()['content'] == 'I agree!'

    def test_add_empty_reply(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/topics', headers=auth_headers,
                           json={'title': 'T', 'content': 'C'})
        topic_id = resp.get_json()['id']

        resp2 = client.post(f'/api/groups/{sample_group.id}/topics/{topic_id}/replies',
                            headers=auth_headers, json={})
        assert resp2.status_code == 400

    def test_delete_topic(self, client, auth_headers, sample_group):
        resp = client.post(f'/api/groups/{sample_group.id}/topics', headers=auth_headers,
                           json={'title': 'To delete', 'content': 'Bye'})
        topic_id = resp.get_json()['id']

        resp2 = client.delete(f'/api/groups/{sample_group.id}/topics/{topic_id}',
                              headers=auth_headers)
        assert resp2.status_code == 200

    def test_delete_topic_no_permission(self, client, auth_headers_user2, sample_group,
                                         app, user2):
        with app.app_context():
            db.session.add(GroupMember(group_id=sample_group.id, user_id=user2.id, role='member'))
            db.session.commit()

        resp = client.post(f'/api/groups/{sample_group.id}/topics', headers=auth_headers_user2,
                           json={'title': 'My topic', 'content': 'Content'})
        topic_id = resp.get_json()['id']

        # Другой member не может удалить чужую тему
        # user2 удаляет свою — ок (автор)
        resp2 = client.delete(f'/api/groups/{sample_group.id}/topics/{topic_id}',
                              headers=auth_headers_user2)
        assert resp2.status_code == 200
