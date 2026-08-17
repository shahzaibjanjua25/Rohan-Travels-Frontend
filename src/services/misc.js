// frontend/src/services/misc.js

import api from './api';

// ============================================
// NOTIFICATION SERVICE
// ============================================
export const notificationService = {
  // ============================================
  // USER ROUTES (for regular users)
  // ============================================

  // Get user's own notifications
  getUserNotifications: async () => {
    const response = await api.get('/notifications');
    return response;
  },

  // Get unread count for user
  unreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response;
  },

  // Mark user notification as read
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response;
  },

  // Mark all user notifications as read
  markAllRead: async () => {
    const response = await api.patch('/notifications/read-all');
    return response;
  },

  // Delete user notification
  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response;
  },

  // Delete all read user notifications
  clearRead: async () => {
    const response = await api.delete('/notifications/read');
    return response;
  },

  // ============================================
  // ADMIN ROUTES (for admin panel)
  // ============================================

  // Get all notifications (admin only)
  getAll: async () => {
    const response = await api.get('/notifications/admin');
    return response;
  },

  // Get total unread count (admin only)
  getAdminUnreadCount: async () => {
    const response = await api.get('/notifications/admin/unread-count');
    return response;
  },

  // Mark any notification as read (admin only)
  markAdminAsRead: async (id) => {
    const response = await api.patch(`/notifications/admin/${id}/read`);
    return response;
  },

  // Mark all notifications as read (admin only)
  markAllAdminRead: async () => {
    const response = await api.patch('/notifications/admin/read-all');
    return response;
  },

  // Delete any notification (admin only)
  deleteAdmin: async (id) => {
    const response = await api.delete(`/notifications/admin/${id}`);
    return response;
  },

  // Delete all notifications (admin only)
  deleteAllAdmin: async () => {
    const response = await api.delete('/notifications/admin/delete-all');
    return response;
  },
};

// ============================================
// DASHBOARD SERVICE
// ============================================
export const dashboardService = {
  get: async (params) => {
    const response = await api.get('/dashboard', { params });
    return response;
  },
  revenue: async (params) => {
    const response = await api.get('/dashboard/revenue', { params });
    return response;
  },
};

// ============================================
// LEDGER SERVICE
// ============================================
export const ledgerService = {
  // Get user's ledger/account balance
  getBalance: async () => {
    const response = await api.get('/ledger/balance');
    return response;
  },

  // Get ledger entries (transactions)
  getEntries: async (params) => {
    const response = await api.get('/ledger/entries', { params });
    return response;
  },

  // Get ledger transactions (alias for getEntries)
  getTransactions: async (params) => {
    const response = await api.get('/ledger/entries', { params });
    return response;
  },

  // Get a specific entry
  getEntry: async (id) => {
    const response = await api.get(`/ledger/entries/${id}`);
    return response;
  },

  // Get user's account summary
  getSummary: async () => {
    const response = await api.get('/ledger/summary');
    return response;
  },
};

// ============================================
// FLIGHT SERVICE
// ============================================
export const flightService = {
  search: async (params) => {
    const response = await api.get('/flights/search', { params });
    return response;
  },
  get: async (id) => {
    const response = await api.get(`/flights/${id}`);
    return response;
  },
  create: async (data) => {
    const response = await api.post('/flights', data);
    return response;
  },
  update: async (id, data) => {
    const response = await api.put(`/flights/${id}`, data);
    return response;
  },
  delete: async (id) => {
    const response = await api.delete(`/flights/${id}`);
    return response;
  },
};

// ============================================
// BOOKING SERVICE
// ============================================
export const bookingService = {
  getAll: async (params) => {
    const response = await api.get('/bookings', { params });
    return response;
  },
  get: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response;
  },
  create: async (data) => {
    const response = await api.post('/bookings', data);
    return response;
  },
  update: async (id, data) => {
    const response = await api.put(`/bookings/${id}`, data);
    return response;
  },
  delete: async (id) => {
    const response = await api.delete(`/bookings/${id}`);
    return response;
  },
};

// ============================================
// USER SERVICE
// ============================================
export const userService = {
  getAll: async (params) => {
    const response = await api.get('/users', { params });
    return response;
  },
  get: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response;
  },
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response;
  },
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response;
  },
};

// ============================================
// ACCOUNT SERVICE
// ============================================
export const accountService = {
  getProfile: async () => {
    const response = await api.get('/account/profile');
    return response;
  },
  updateProfile: async (data) => {
    const response = await api.put('/account/profile', data);
    return response;
  },
  changePassword: async (data) => {
    const response = await api.put('/account/password', data);
    return response;
  },
  getSettings: async () => {
    const response = await api.get('/account/settings');
    return response;
  },
  updateSettings: async (data) => {
    const response = await api.put('/account/settings', data);
    return response;
  },
};

// ============================================
// SETTINGS SERVICE
// ============================================
export const settingsService = {
  // Get settings
  get: async () => {
    const response = await api.get('/settings');
    return response;
  },

  // Update settings
  update: async (data) => {
    const response = await api.put('/settings', data);
    return response;
  },

  // Reset settings to defaults
  reset: async () => {
    const response = await api.post('/settings/reset');
    return response;
  },
};

// ============================================
// DEFAULT EXPORT (for convenience)
// ============================================
export default {
  notificationService,
  dashboardService,
  ledgerService,
  flightService,
  bookingService,
  userService,
  accountService,
  settingsService,
};