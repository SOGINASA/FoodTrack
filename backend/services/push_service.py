import json
import threading
from pywebpush import webpush, WebPushException
from flask import current_app
from models import db, PushSubscription, Notification, NotificationPreference
from services import websocket_service


class PushService:
    @staticmethod
    def send_to_user(user_id, notification):
        """Отправить push всем устройствам пользователя (в фоновом потоке)"""
        subscriptions = PushSubscription.query.filter_by(user_id=user_id).all()

        if not subscriptions:
            print(f"[Push] No subscriptions for user {user_id}")
            return False

        vapid_private_key = current_app.config.get('VAPID_PRIVATE_KEY', '')
        if not vapid_private_key:
            print(f"[Push] VAPID_PRIVATE_KEY is empty, cannot send push")
            return False

        vapid_claims = {'sub': current_app.config['VAPID_CLAIMS_EMAIL']}

        payload = json.dumps({
            'title': notification.title,
            'body': notification.body,
            'icon': '/imgs/logo.png',
            'badge': '/logo192.png',
            'category': notification.category,
            'notificationId': notification.id,
            'url': PushService._get_url_for_category(notification),
        }, ensure_ascii=False)

        sub_dicts = [sub.to_webpush_dict() for sub in subscriptions]
        sub_ids = [sub.id for sub in subscriptions]
        notification_id = notification.id
        app = current_app._get_current_object()

        def _send_in_background():
            with app.app_context():
                sent = False
                for sub_dict, sub_id in zip(sub_dicts, sub_ids):
                    try:
                        webpush(
                            subscription_info=sub_dict,
                            data=payload,
                            vapid_private_key=vapid_private_key,
                            vapid_claims=vapid_claims,
                        )
                        sent = True
                        print(f"[Push] Sent to user {user_id}, sub {sub_id}")
                    except WebPushException as e:
                        if e.response and e.response.status_code == 410:
                            print(f"[Push] Sub {sub_id} expired (410), removing")
                            expired = PushSubscription.query.get(sub_id)
                            if expired:
                                db.session.delete(expired)
                        else:
                            print(f"[Push] WebPushException for sub {sub_id}: {e}")
                    except Exception as e:
                        print(f"[Push] Unexpected error for sub {sub_id}: {e}")

                notif = Notification.query.get(notification_id)
                if notif:
                    notif.is_pushed = sent
                db.session.commit()

        thread = threading.Thread(target=_send_in_background, daemon=True)
        thread.start()
        return True

    @staticmethod
    def _get_url_for_category(notification):
        """Определить URL для открытия при клике на уведомление"""
        url_map = {
            'meal_reminder': '/diary',
            'water_reminder': '/',
            'progress': '/progress',
            'group': '/groups',
            'weekly_report': '/analytics',
            'friend': '/friends',
            'fridge': '/fridge',
            'system': '/',
        }
        return url_map.get(notification.category, '/')


def create_and_push_notification(user_id, title, body, category, related_type=None, related_id=None):
    """Создать уведомление и отправить push (если включён)"""
    notification = Notification(
        user_id=user_id,
        title=title,
        body=body,
        category=category,
        related_type=related_type,
        related_id=related_id,
    )
    db.session.add(notification)
    db.session.flush()

    prefs = NotificationPreference.query.filter_by(user_id=user_id).first()
    should_push = False

    if not prefs:
        print(f"[Push] No preferences for user {user_id}, skipping push")
    elif not prefs.push_enabled:
        print(f"[Push] push_enabled=False for user {user_id}, skipping push")
    else:
        category_enabled = {
            'meal_reminder': prefs.meal_reminders,
            'water_reminder': prefs.water_reminders,
            'progress': prefs.progress_updates,
            'group': prefs.group_activity,
            'weekly_report': prefs.weekly_reports,
            'friend': True,
            'fridge': True,
            'system': True,
        }
        if category_enabled.get(category, True):
            should_push = True
        else:
            print(f"[Push] Category '{category}' disabled for user {user_id}")

    db.session.commit()

    # Отправляем через WebSocket (мгновенно)
    websocket_service.send_notification(user_id, notification.to_dict())

    # Отправляем обновлённый счётчик непрочитанных
    unread = Notification.query.filter_by(user_id=user_id, is_read=False).count()
    websocket_service.send_unread_count(user_id, unread)

    # Отправляем через Web Push (в фоновом потоке)
    if should_push:
        PushService.send_to_user(user_id, notification)

    return notification
