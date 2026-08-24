import api from './api';

export const authService = {
  registerFacility: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  loginFacility: (payload) => api.post('/auth/login', payload).then((r) => r.data),
  loginAdmin: (payload) => api.post('/auth/admin/login', payload).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  refresh: () => api.post('/auth/refresh').then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload).then((r) => r.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((r) => r.data),
  changePassword: (payload) => api.patch('/auth/change-password', payload).then((r) => r.data),
};
