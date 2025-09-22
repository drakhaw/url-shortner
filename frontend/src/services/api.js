import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  changePassword: (newEmail, newPassword) => 
    api.post('/auth/change-password', { newEmail, newPassword }),
  getMe: () => api.get('/auth/me'),
};

// URL API
export const urlApi = {
  create: (destination, customSlug) => 
    api.post('/urls', { destination, customSlug }),
  list: (page = 1, limit = 10) => 
    api.get('/urls', { params: { page, limit } }),
  get: (id) => api.get(`/urls/${id}`),
  update: (id, destination) => 
    api.put(`/urls/${id}`, { destination }),
  delete: (id) => api.delete(`/urls/${id}`),
};

export default api;