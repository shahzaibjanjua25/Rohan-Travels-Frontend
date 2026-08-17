// src/services/settings.js
import api from './api';

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

export default settingsService;