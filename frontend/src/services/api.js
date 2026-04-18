import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('fintech_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('fintech_token');
      localStorage.removeItem('fintech_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  requestAccess: (data) => api.post('/auth/request-access', data)
};

export const transactionApi = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  getSummary: () => api.get('/transactions/summary'),
  getAnomalies: () => api.get('/transactions/anomalies'),
};

export const reportApi = {
  getMonthly: (month) => api.get('/reports/monthly', { params: { month } }),
  getAll: () => api.get('/reports'),
  generate: (month) => api.post('/reports/generate', null, { params: { month } }),
};

export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
  getReports: () => api.get('/admin/reports'),
  getAccessRequests: () => api.get('/admin/access-requests'),
  approveRequest: (id) => api.post(`/admin/access-requests/${id}/approve`),
  rejectRequest: (id) => api.post(`/admin/access-requests/${id}/reject`),
};

export const SSE_URL = `${API_BASE}/api/notifications/stream`;

export default api;
