import json
from pywebpush import webpush, WebPushException
from flask import current_app
from models import db, PushSubscription, Notification, NotificationPreference


class PushService:
    @staticmethod
    def send_to_user(user_id, notification):
        """Отправить push всем устройствам пользователя"""
        subscriptions = PushSubscription.query.filter_by(user_id=user_id).all()

        if not subscriptions:
            return

        payload = json.dumps({
            'title': notification.title,
            'body': notification.body,
            'icon': '/imgs/logo.png',
            'badge': '/logo192.png',
            'category': notification.category,
            'notificationId': notification.id,
            'url': PushService._get_url_for_category(notification),
        }, ensure_ascii=False)

        vapid_private_key = current_app.config['VAPID_PRIVATE_KEY']
        vapid_claims = {'sub': current_app.config['VAPID_CLAIMS_EMAIL']}

        for sub in subscriptions:
            try:
                webpush(
                    subscription_info=sub.to_webpush_dict(),
                    data=payload,
                    vapid_private_key=vapid_private_key,
                    vapid_claims=vapid_claims,
                )
            except WebPushException as e:
                if e.response and e.response.status_code == 410:
                    db.session.delete(sub)
                else:
                    print(f"Push error for sub {sub.id}: {e}")

        notification.is_pushed = True
        db.session.commit()

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
    if prefs and prefs.push_enabled:
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
            PushService.send_to_user(user_id, notification)

    db.session.commit()
    return notification
