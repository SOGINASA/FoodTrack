import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

// WebSocket URL - конвертируем HTTP URL в WS URL
const getWsUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5252/api';
  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
  const baseUrl = apiUrl.replace(/^https?/, wsProtocol).replace('/api', '');
  return `${baseUrl}/ws/notifications`;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [connected, setConnected] = useState(false);
  const [newNotification, setNewNotification] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Fetch notifications via API
  const fetchNotifications = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/notifications/get', {
        params: { page: pageNum, per_page: 20 },
      });
      if (pageNum === 1) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...response.data.notifications]);
      }
      setHasMore(response.data.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count via API
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      await api.post(`/notifications/read/${id}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, []);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchNotifications(page + 1);
    }
  }, [hasMore, loading, page, fetchNotifications]);

  // Clear new notification toast
  const clearNewNotification = useCallback(() => {
    setNewNotification(null);
  }, []);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const wsUrl = `${getWsUrl()}?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'notification') {
            const notification = data.payload;

            // Add to notifications list
            setNotifications((prev) => [notification, ...prev]);

            // Increment unread count
            setUnreadCount((prev) => prev + 1);

            // Set new notification for toast
            setNewNotification(notification);

            // Auto-clear toast after 5 seconds
            setTimeout(() => {
              setNewNotification((current) =>
                current?.id === notification.id ? null : current
              );
            }, 5000);
          } else if (data.type === 'unread_count') {
            setUnreadCount(data.payload.count);
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
        setConnected(false);
        wsRef.current = null;

        // Reconnect with exponential backoff
        if (isAuthenticated && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current += 1;

          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (attempt ${reconnectAttempts.current})...`);
            connectWebSocket();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Error creating WebSocket:', err);
    }
  }, [isAuthenticated]);

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User logout');
      wsRef.current = null;
    }

    setConnected(false);
    reconnectAttempts.current = 0;
  }, []);

  // Connect/disconnect based on auth state
  useEffect(() => {
    if (isAuthenticated) {
      // Initial fetch
      fetchUnreadCount();

      // Connect WebSocket
      connectWebSocket();

      // Fallback polling every 30 seconds (in case WebSocket fails)
      const pollInterval = setInterval(() => {
        if (!connected) {
          fetchUnreadCount();
        }
      }, 30000);

      // Refresh on window focus
      const handleFocus = () => {
        fetchUnreadCount();
        if (!connected) {
          connectWebSocket();
        }
      };
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(pollInterval);
        window.removeEventListener('focus', handleFocus);
        disconnectWebSocket();
      };
    } else {
      disconnectWebSocket();
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, connectWebSocket, disconnectWebSocket, fetchUnreadCount, connected]);

  const value = {
    notifications,
    unreadCount,
    loading,
    hasMore,
    connected,
    newNotification,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadMore,
    clearNewNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
