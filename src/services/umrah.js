// frontend/src/services/umrah.js
import api from './api';

export const umrahService = {
  // Packages
  getPackages: (params) => api.get('/umrah/packages', { params }),
  getPackage: (id) => api.get(`/umrah/packages/${id}`),
  createPackage: (data) => api.post('/umrah/packages', data),
  updatePackage: (id, data) => api.put(`/umrah/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/umrah/packages/${id}`),
  updatePackageStatus: (id, status) => api.patch(`/umrah/packages/${id}/status`, status),

  // Bookings
  createBooking: (data) => api.post('/umrah/bookings', data),
  getBookings: (params) => api.get('/umrah/bookings', { params }),
  getBooking: (id) => api.get(`/umrah/bookings/${id}`),
  cancelBooking: (id, reason) => api.patch(`/umrah/bookings/${id}/cancel`, { reason }),
  updateBookingStatus: (id, status) => api.patch(`/umrah/bookings/${id}/status`, { status }),

  // Hotels
  getHotels: (city) => api.get('/umrah/hotels', { params: { city } }),
  createHotel: (data) => api.post('/umrah/hotels', data),
  updateHotel: (id, data) => api.put(`/umrah/hotels/${id}`, data),
  deleteHotel: (id) => api.delete(`/umrah/hotels/${id}`),
};

export default umrahService;