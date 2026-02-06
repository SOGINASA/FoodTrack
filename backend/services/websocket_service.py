import json
import threading

# Потокобезопасный реестр WebSocket-соединений: {user_id: set(ws)}
_connections = {}
_lock = threading.Lock()


def register(user_id, ws):
    """Зарегистрировать WebSocket-соединение для пользователя"""
    with _lock:
        if user_id not in _connections:
            _connections[user_id] = set()
        _connections[user_id].add(ws)


def unregister(user_id, ws):
    """Удалить WebSocket-соединение пользователя"""
    with _lock:
        if user_id in _connections:
            _connections[user_id].discard(ws)
            if not _connections[user_id]:
                del _connections[user_id]


def send_to_user(user_id, data):
    """Отправить JSON-сообщение всем WebSocket-соединениям пользователя"""
    with _lock:
        connections = list(_connections.get(user_id, []))

    if not connections:
        return

    message = json.dumps(data, ensure_ascii=False)
    dead = []

    for ws in connections:
        try:
            ws.send(message)
        except Exception:
            dead.append(ws)

    if dead:
        with _lock:
            for ws in dead:
                if user_id in _connections:
                    _connections[user_id].discard(ws)
                    if not _connections[user_id]:
                        del _connections[user_id]


def send_notification(user_id, notification_dict):
    """Отправить уведомление через WebSocket"""
    send_to_user(user_id, {
        'type': 'notification',
        'payload': notification_dict,
    })


def send_unread_count(user_id, count):
    """Отправить обновлённый счётчик непрочитанных"""
    send_to_user(user_id, {
        'type': 'unread_count',
        'payload': {'count': count},
    })
