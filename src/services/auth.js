import api from './api';

export const authService = {
  register: (payload) => api.post('/auth/register', payload),
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: (options) => api.get('/auth/me', options),
  updateProfile: (payload) => api.patch('/auth/me', payload),
  changePassword: (currentPassword, newPassword) =>
    api.patch('/auth/password', { currentPassword, newPassword }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export default authService;
