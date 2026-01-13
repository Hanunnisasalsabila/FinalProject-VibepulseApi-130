import axios from 'axios';

// 🔴 PERBAIKAN DI SINI: Ganti import.meta.env (Vite) jadi process.env (CRA)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  changePassword: (data) => api.put('/api/auth/change-password', data),
};

// API Keys API
export const apiKeysAPI = {
  generate: (data) => api.post('/api/keys/generate', data),
  getAll: () => api.get('/api/keys'),
  getById: (id) => api.get(`/api/keys/${id}`),
  update: (id, data) => api.put(`/api/keys/${id}`, data),
  revoke: (id) => api.delete(`/api/keys/${id}`),
  regenerate: (id) => api.put(`/api/keys/${id}/regenerate`),
};

// Songs API (with API key)
export const songsAPI = {
  getAll: (params, apiKey) => axios.get(`${API_BASE_URL}/api/songs`, {
    params,
    headers: { 'x-api-key': apiKey }
  }),
  getById: (id, apiKey) => axios.get(`${API_BASE_URL}/api/songs/${id}`, {
    headers: { 'x-api-key': apiKey }
  }),
  incrementPlay: (id, apiKey) => axios.get(`${API_BASE_URL}/api/songs/${id}`, {
    headers: { 'x-api-key': apiKey }
  }),
  getMoods: (apiKey) => axios.get(`${API_BASE_URL}/api/songs/moods`, {
    headers: { 'x-api-key': apiKey }
  }),
  getByMood: (mood, params, apiKey) => axios.get(`${API_BASE_URL}/api/songs/mood/${mood}`, {
    params,
    headers: { 'x-api-key': apiKey }
  }),
  getRandom: (params, apiKey) => axios.get(`${API_BASE_URL}/api/songs/random`, {
    params,
    headers: { 'x-api-key': apiKey }
  }),
};

// Admin API
export const adminAPI = {
  // Users
  getAllUsers: (params) => api.get('/api/admin/users', { params }),
  getUserById: (id) => api.get(`/api/admin/users/${id}`),
  blockUser: (id) => api.put(`/api/admin/users/${id}/block`),
  unblockUser: (id) => api.put(`/api/admin/users/${id}/unblock`),
  updateUserPlan: (id, plan) => api.put(`/api/admin/users/${id}/plan`, { plan }),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  
  // Analytics
  getAnalytics: () => api.get('/api/admin/analytics'),
  getLogs: (params) => api.get('/api/admin/logs', { params }),
  
  // Songs
  getAllSongs: (params) => api.get('/api/admin/songs', { params }),
  createSong: (formData) => api.post('/api/admin/songs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateSong: (id, formData) => api.put(`/api/admin/songs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteSong: (id) => api.delete(`/api/admin/songs/${id}`),
};

export default api;