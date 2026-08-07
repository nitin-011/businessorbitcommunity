import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Business APIs
export const businessAPI = {
  apply: (data: { name: string; company: string; role: string; stage: string; email: string }) =>
    api.post('/business/apply', data),
};

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getBusiness: (params?: any) => api.get('/admin/business', { params }),
  approve: (type: 'student' | 'business', id: string) =>
    api.patch(`/admin/approve/${type}/${id}`),
  reject: (type: 'student' | 'business', id: string) =>
    api.patch(`/admin/reject/${type}/${id}`),
  sendBulkEmail: (data: { recipients: string[]; subject: string; content: string }) =>
    api.post('/admin/bulk-email', data),
};
