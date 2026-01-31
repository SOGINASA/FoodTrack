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
  completeOnboarding: (data) => api.post('/auth/onboarding', data),
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

// === PROGRESS API ===
export const progressAPI = {
  // Замеры тела
  getMeasurements: () => api.get('/progress/measurements'),
  addMeasurement: (data) => api.post('/progress/measurements', data),
  deleteMeasurement: (id) => api.delete(`/progress/measurements/${id}`),

  // Фото прогресса
  getPhotos: () => api.get('/progress/photos'),
  addPhoto: (data) => api.post('/progress/photos', data),
  deletePhoto: (id) => api.delete(`/progress/photos/${id}`),
};

// === MEAL PLANS API ===
export const mealPlansAPI = {
  // Получить все планы питания (с фильтрами)
  getAll: (params = {}) => api.get('/meal-plans', { params }),

  // Получить план на неделю
  getWeek: (startDate) => api.get('/meal-plans/week', { params: { start_date: startDate } }),

  // Получить конкретный план
  getById: (id) => api.get(`/meal-plans/${id}`),

  // Добавить рецепт в план питания
  create: (data) => api.post('/meal-plans', data),

  // Обновить план
  update: (id, data) => api.put(`/meal-plans/${id}`, data),

  // Удалить план
  delete: (id) => api.delete(`/meal-plans/${id}`),

  // Отметить как выполненный
  toggleComplete: (id) => api.post(`/meal-plans/${id}/complete`),
};

// === GROUPS API ===
export const groupsAPI = {
  // Группы
  getMyGroups: () => api.get('/groups/all'),
  discoverGroups: () => api.get('/groups/discover'),
  getGroup: (id) => api.get(`/groups/${id}`),
  createGroup: (data) => api.post('/groups/create', data),
  updateGroup: (id, data) => api.put(`/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/groups/${id}`),
  joinGroup: (id) => api.post(`/groups/${id}/join`),
  leaveGroup: (id) => api.post(`/groups/${id}/leave`),
  getMembers: (groupId) => api.get(`/groups/${groupId}/members`),

  // Посты
  getPosts: (groupId, page = 1) => api.get(`/groups/${groupId}/posts`, { params: { page } }),
  createPost: (groupId, data) => api.post(`/groups/${groupId}/posts`, data),
  deletePost: (groupId, postId) => api.delete(`/groups/${groupId}/posts/${postId}`),
  toggleLike: (groupId, postId) => api.post(`/groups/${groupId}/posts/${postId}/like`),
  addComment: (groupId, postId, data) => api.post(`/groups/${groupId}/posts/${postId}/comments`, data),

  // Форум
  getTopics: (groupId) => api.get(`/groups/${groupId}/topics`),
  getTopic: (groupId, topicId) => api.get(`/groups/${groupId}/topics/${topicId}`),
  createTopic: (groupId, data) => api.post(`/groups/${groupId}/topics`, data),
  deleteTopic: (groupId, topicId) => api.delete(`/groups/${groupId}/topics/${topicId}`),
  togglePinTopic: (groupId, topicId) => api.post(`/groups/${groupId}/topics/${topicId}/pin`),
  addReply: (groupId, topicId, data) => api.post(`/groups/${groupId}/topics/${topicId}/replies`, data),
};

// === FRIDGE API ===
export const fridgeAPI = {
  // Получить все продукты в холодильнике
  getAll: () => api.get('/fridge'),

  // Добавить продукт
  addProduct: (data) => api.post('/fridge', data),

  // Обновить продукт
  updateProduct: (id, data) => api.put(`/fridge/${id}`, data),

  // Удалить продукт
  deleteProduct: (id) => api.delete(`/fridge/${id}`),

  // Сканировать чек
  scanReceipt: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/fridge/scan-receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Сканировать штрихкод
  scanBarcode: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/fridge/scan-barcode', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Генерировать рецепты на основе продуктов
  generateRecipes: () => api.get('/fridge/generate-recipes'),

  // Получить продукты с истекающим сроком годности
  getExpiringSoon: (days = 7) => api.get('/fridge/expiring-soon', { params: { days } }),
};