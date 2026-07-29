import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach JWT token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
};

// ── User ──────────────────────────────────────────
export const userAPI = {
  getProfile: () => API.get('/user/profile'),
  updateProfile: (data) => API.put('/user/profile', data),
  getDashboard: () => API.get('/user/dashboard'),
  getRecommendations: () => API.get('/user/recommendations'),
  getBookmarks: () => API.get('/user/bookmarks'),
  addBookmark: (id) => API.post(`/user/bookmarks/${id}`),
  removeBookmark: (id) => API.delete(`/user/bookmarks/${id}`),
  getDocuments: () => API.get('/user/documents'),
  updateDocuments: (data) => API.post('/user/documents', data),
  getNotifications: () => API.get('/user/notifications'),
  getUnreadCount: () => API.get('/user/notifications/unread-count'),
  markNotificationsRead: () => API.post('/user/notifications/mark-read'),
};

// ── Schemes ──────────────────────────────────────────
export const schemeAPI = {
  getAll: (params) => API.get('/schemes', { params }),
  getById: (id) => API.get(`/schemes/${id}`),
  create: (data) => API.post('/schemes', data),
  update: (id, data) => API.put(`/schemes/${id}`, data),
  delete: (id) => API.delete(`/schemes/${id}`),
  getStats: () => API.get('/schemes/admin/stats'),
};

export default API;
