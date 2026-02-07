import { create } from 'zustand';
import api, { notificationsAPI } from '../services/api';

// WebSocket URL — берём baseURL из axios и конвертируем в ws://
const getWsUrl = () => {
  const baseUrl = api.defaults.baseURL;
  const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
  return `${baseUrl.replace(/^https?/, wsProtocol).replace('/api', '')}/ws/notifications`;
};

// WebSocket state (не реактивный, не нужен ререндер)
let ws = null;
let reconnectTimeout = null;
let reconnectAttempts = 0;
let pollInterval = null;
let focusHandler = null;
let lastSeenNotificationId = null;

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  hasMore: true,
  page: 1,
  connected: false,
  newNotification: null,
  fridgeUpdateCallbacks: {},

  // === API actions ===

  fetchNotifications: async (pageNum = 1) => {
    set({ loading: true });
    try {
      const response = await notificationsAPI.getAll({ page: pageNum, per_page: 20 });
      const { notifications: items, hasMore } = response.data;
      set((state) => ({
        notifications: pageNum === 1 ? items : [...state.notifications, ...items],
        hasMore,
        page: pageNum,
      }));
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      set({ loading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      set({ unreadCount: response.data.count });
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsAPI.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  },

  deleteNotification: async (id) => {
    try {
      await notificationsAPI.deleteNotification(id);
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  },

  loadMore: () => {
    const { hasMore, loading, page, fetchNotifications } = get();
    if (hasMore && !loading) {
      fetchNotifications(page + 1);
    }
  },

  clearNewNotification: () => set({ newNotification: null }),

  // === Polling fallback (когда WebSocket не работает) ===

  _pollForUpdates: async () => {
    try {
      // Обновляем счётчик непрочитанных
      const countRes = await notificationsAPI.getUnreadCount();
      set({ unreadCount: countRes.data.count });

      // Проверяем новые уведомления
      const response = await notificationsAPI.getAll({ page: 1, per_page: 5 });
      const { notifications: items } = response.data;

      if (items.length > 0) {
        const latestId = items[0].id;

        if (lastSeenNotificationId !== null && latestId !== lastSeenNotificationId) {
          // Появились новые уведомления — добавляем в стор
          const currentIds = new Set(get().notifications.map((n) => n.id));
          const newItems = items.filter((n) => !currentIds.has(n.id));

          if (newItems.length > 0) {
            set((state) => ({
              notifications: [...newItems, ...state.notifications],
              newNotification: newItems[0],
            }));

            // Auto-clear toast after 5 seconds
            setTimeout(() => {
              const current = get().newNotification;
              if (current?.id === newItems[0].id) {
                set({ newNotification: null });
              }
            }, 5000);
          }
        }

        lastSeenNotificationId = latestId;
      }
    } catch (err) {
      console.error('Error polling for updates:', err);
    }
  },

  // === Fridge update callbacks ===

  registerFridgeUpdate: (id, callback) => {
    set((state) => ({
      fridgeUpdateCallbacks: {
        ...state.fridgeUpdateCallbacks,
        [id]: callback,
      },
    }));
  },

  unregisterFridgeUpdate: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.fridgeUpdateCallbacks;
      return { fridgeUpdateCallbacks: rest };
    });
  },

  // === WebSocket ===

  connectWebSocket: () => {
    // Не создаём новый WS если уже открыт или подключается
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const wsUrl = `${getWsUrl()}?token=${encodeURIComponent(token)}`;
      ws = new WebSocket(wsUrl);
      let localPingInterval = null;

      ws.onopen = () => {
        console.log('WebSocket connected');
        set({ connected: true });
        reconnectAttempts = 0;

        // Send ping every 20 seconds to keep connection alive
        localPingInterval = setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 20000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'notification') {
            const notification = data.payload;
            // Обновляем lastSeenNotificationId чтобы polling не дублировал
            lastSeenNotificationId = notification.id;
            set((state) => ({
              notifications: [notification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
              newNotification: notification,
            }));

            // Auto-clear toast after 5 seconds
            setTimeout(() => {
              const current = get().newNotification;
              if (current?.id === notification.id) {
                set({ newNotification: null });
              }
            }, 5000);
          } else if (data.type === 'unread_count') {
            set({ unreadCount: data.payload.count });
          } else if (data.type === 'fridge_update') {
            // Trigger fridge update callback if registered
            const callbacks = get().fridgeUpdateCallbacks || {};
            Object.values(callbacks).forEach((callback) => callback(data));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        set({ connected: false });
        ws = null;

        // Clear ping interval
        if (localPingInterval) {
          clearInterval(localPingInterval);
          localPingInterval = null;
        }

        // Reconnect with exponential backoff (без лимита — polling тоже пытается)
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts += 1;

        reconnectTimeout = setTimeout(() => {
          console.log(`Attempting to reconnect (attempt ${reconnectAttempts})...`);
          get().connectWebSocket();
        }, delay);
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
    }
  },

  disconnectWebSocket: () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    if (ws) {
      ws.close(1000, 'User logout');
      ws = null;
    }
    set({ connected: false });
    reconnectAttempts = 0;
  },

  // Вызывается из App.js при смене auth state
  connect: () => {
    const { fetchUnreadCount, connectWebSocket, _pollForUpdates } = get();

    fetchUnreadCount();
    connectWebSocket();

    // Инициализируем lastSeenNotificationId
    notificationsAPI
      .getAll({ page: 1, per_page: 1 })
      .then((res) => {
        const items = res.data?.notifications || [];
        if (items.length > 0 && lastSeenNotificationId === null) {
          lastSeenNotificationId = items[0].id;
        }
      })
      .catch(() => {});

    // Polling каждые 15 секунд — ловит уведомления если WS не работает
    pollInterval = setInterval(() => {
      _pollForUpdates();

      // Пробуем переподключить WS если отвалился
      if (!get().connected) {
        reconnectAttempts = 0;
        get().connectWebSocket();
      }
    }, 15000);

    // Переподключение и проверка при фокусе окна
    focusHandler = () => {
      _pollForUpdates();
      if (!get().connected) {
        reconnectAttempts = 0;
        get().connectWebSocket();
      }
    };
    window.addEventListener('focus', focusHandler);
  },

  disconnect: () => {
    get().disconnectWebSocket();

    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    if (focusHandler) {
      window.removeEventListener('focus', focusHandler);
      focusHandler = null;
    }

    lastSeenNotificationId = null;
    set({ notifications: [], unreadCount: 0, newNotification: null });
  },
}));

export default useNotificationStore;
