import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5252/api';

// Создаём инстанс axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцептор для обработки ответов и обновления токена
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если токен истёк, пробуем обновить
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Если не удалось обновить токен — выходим
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// === AUTH API ===
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// === MEALS API ===
export const mealsAPI = {
  // Получить все приёмы пищи (с фильтрами)
  getAll: (params = {}) => api.get('/meals', { params }),

  // Получить приёмы пищи за сегодня
  getToday: () => api.get('/meals/today'),

  // Получить конкретный приём пищи
  getById: (id) => api.get(`/meals/${id}`),

  // Создать новый приём пищи
  create: (data) => api.post('/meals', data),

  // Обновить приём пищи
  update: (id, data) => api.put(`/meals/${id}`, data),

  // Удалить приём пищи
  delete: (id) => api.delete(`/meals/${id}`),

  // Копировать приём пищи
  copy: (id, data = {}) => api.post(`/meals/${id}/copy`, data),

  // Анализировать фото продукта (напрямую к predicts API)
  analyzePhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post('https://korolevst.supertest.beast-inside.kz/food_predict/predict/with-nutrition', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// === GOALS API ===
export const goalsAPI = {
  // Получить цели пользователя
  get: () => api.get('/goals'),

  // Обновить цели
  update: (data) => api.put('/goals', data),

  // Получить историю веса
  getWeightHistory: (days = 30) => api.get('/goals/weight', { params: { days } }),

  // Добавить запись веса
  addWeight: (data) => api.post('/goals/weight', data),

  // Удалить запись веса
  deleteWeight: (id) => api.delete(`/goals/weight/${id}`),
};

// === ANALYTICS API ===
export const analyticsAPI = {
  // Дневная статистика
  getDaily: (date) => api.get('/analytics/daily', { params: { date } }),

  // Недельная статистика
  getWeekly: () => api.get('/analytics/weekly'),

  // Месячная статистика
  getMonthly: (year, month) => api.get('/analytics/monthly', { params: { year, month } }),

  // Топ продуктов
  getTopFoods: (days = 30, limit = 10) =>
    api.get('/analytics/top-foods', { params: { days, limit } }),

  // Серия дней
  getStreak: () => api.get('/analytics/streak'),
};