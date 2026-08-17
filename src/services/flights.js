import api from './api';

export const flightService = {
  search: (params, options) => api.get('/flights', { ...options, params }),
  get: (id) => api.get(`/flights/${id}`),
  create: (payload) => api.post('/flights', payload),
  update: (id, payload) => api.put(`/flights/${id}`, payload),
  setStatus: (id, status) => api.patch(`/flights/${id}/status`, { status }),
  remove: (id) => api.delete(`/flights/${id}`),
};

export default flightService;
