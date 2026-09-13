import axios from 'axios';
import { useAuthStore } from '../store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Request interceptor: attach token ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ─────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──────────────────────────────────────────────────────────────
export const authApi = {
  register:       (data: object) => api.post('/auth/register', data),
  login:          (data: object) => api.post('/auth/login', data),
  logout:         ()             => api.post('/auth/logout'),
  me:             ()             => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token: string, password: string) =>
                    api.post('/auth/reset-password', { token, password }),
};

// ── Items API (Board – admin-approved only) ───────────────────────────────
export const itemsApi = {
  getAll:        (params?: object) => api.get('/items', { params }),
  getById:       (id: string)      => api.get(`/items/${id}`),
  delete:        (id: string)      => api.delete(`/items/${id}`),
  getRelated:    (id: string)      => api.get(`/items/${id}/related`),
  incrementView: (id: string)      => api.post(`/items/${id}/view`),
  bookmark:      (id: string)      => api.post(`/items/${id}/bookmark`),
  resolve:       (id: string)      => api.patch(`/items/${id}/resolve`),
  // "I Found This" tip sent to admin for verification
  submitTip:     (id: string, data: { message?: string; contact?: string; tip?: string }) =>
                   api.post(`/items/${id}/tip`, data),
};

// ── Reports API (member → admin private reports) ──────────────────────────
export const reportsApi = {
  submit:  (data: FormData) => api.post('/reports', data, {
             headers: { 'Content-Type': 'multipart/form-data' },
           }),
  getMine: ()               => api.get('/reports/mine'),
};

// ── Users API ─────────────────────────────────────────────────────────────
export const usersApi = {
  getMe:      ()               => api.get('/users/me'),
  updateMe:   (data: FormData) => api.put('/users/me', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
              }),
  getById:    (id: string)     => api.get(`/users/${id}`),
  getMyItems: (params?: object) => api.get('/users/me/items', { params }),
};

// ── Dashboard API ─────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

// ── Notifications API ─────────────────────────────────────────────────────
export const notificationsApi = {
  getAll:      ()           => api.get('/notifications'),
  markRead:    (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: ()           => api.patch('/notifications/read-all'),
  delete:      (id: string) => api.delete(`/notifications/${id}`),
};

// ── Chat API ─────────────────────────────────────────────────────────────
export const chatApi = {
  getConversations:  ()                    => api.get('/conversations'),
  getMessages:       (convId: string, params?: object) =>
                       api.get(`/conversations/${convId}/messages`, { params }),
  sendMessage:       (convId: string, data: object) =>
                       api.post(`/conversations/${convId}/messages`, data),
  startConversation: (data: object)        => api.post('/conversations/start', data),
};

// ── Admin API ─────────────────────────────────────────────────────────────
export const adminApi = {
  getStats:        ()                  => api.get('/admin/stats'),
  getUsers:        (params?: object)   => api.get('/admin/users', { params }),
  banUser:         (id: string)        => api.patch(`/admin/users/${id}/ban`),
  unbanUser:       (id: string)        => api.patch(`/admin/users/${id}/unban`),
  // Report queue
  getReports:      (params?: object)   => api.get('/admin/reports', { params }),
  publishReport:   (id: string, adminNote?: string) =>
                     api.patch(`/admin/reports/${id}/publish`, { adminNote }),
  rejectReport:    (id: string, reason: string) =>
                     api.patch(`/admin/reports/${id}/reject`, { reason }),
  // Board items
  getItems:        (params?: object)   => api.get('/admin/items', { params }),
  resolveItem:     (id: string)        => api.patch(`/admin/items/${id}/resolve`),
  // Finder tips
  getItemTips:     (itemId: string)    => api.get(`/admin/items/${itemId}/tips`),
  updateTipStatus: (itemId: string, tipId: string, status: string) =>
                     api.patch(`/admin/items/${itemId}/tips/${tipId}`, { status }),
};

// ── AI API ────────────────────────────────────────────────────────────────
export const aiApi = {
  generateDesc: (data: FormData) => api.post('/ai/generate-description', data, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                }),
  chat: (messages: object[]) => api.post('/ai/chat', { messages }),
};
