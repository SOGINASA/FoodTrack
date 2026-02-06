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
const MAX_RECONNECT_ATTEMPTS = 5;

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  hasMore: true,
  page: 1,
  connected: false,
  newNotification: null,

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

  // === WebSocket ===

  connectWebSocket: () => {
    if (ws?.readyState === WebSocket.OPEN) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const wsUrl = `${getWsUrl()}?token=${encodeURIComponent(token)}`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        set({ connected: true });
        reconnectAttempts = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'notification') {
            const notification = data.payload;
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

        // Reconnect with exponential backoff
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          reconnectAttempts += 1;

          reconnectTimeout = setTimeout(() => {
            console.log(`Attempting to reconnect (attempt ${reconnectAttempts})...`);
            get().connectWebSocket();
          }, delay);
        }
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
    const { fetchUnreadCount, connectWebSocket } = get();

    fetchUnreadCount();
    connectWebSocket();

    // Fallback polling каждые 30 секунд
    pollInterval = setInterval(() => {
      if (!get().connected) {
        get().fetchUnreadCount();
      }
    }, 30000);

    // Переподключение при фокусе окна
    focusHandler = () => {
      get().fetchUnreadCount();
      if (!get().connected) {
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

    set({ notifications: [], unreadCount: 0, newNotification: null });
  },
}));

export default useNotificationStore;
