
//api in frontend src/services/bookings.js
import api from './api';

export const bookingService = {
  list: (params) => api.get('/bookings', { params }),
  get: (id) => api.get(`/bookings/${id}`),
  create: (payload) => api.post('/bookings', payload),
  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  seatMap: (flightId) => api.get(`/bookings/flights/${flightId}/seats`),

  // Admin
  documents: (id) => api.get(`/bookings/${id}/documents`),
  markPaid: (id, payload) => api.patch(`/bookings/${id}/pay`, payload || {}),
  setStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
};

export default bookingService;
