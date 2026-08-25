import api from './api';

export const facilityService = {
  list: (params) => api.get('/facilities', { params }).then((r) => r.data),
  get: (idOrSlug) => api.get(`/facilities/${idOrSlug}`).then((r) => r.data),
  mapFacilities: (params) => api.get('/map/facilities', { params }).then((r) => r.data),
  categories: () => api.get('/categories').then((r) => r.data),
  submitReview: (id, payload) => api.post(`/facilities/${id}/reviews`, payload).then((r) => r.data),
  report: (id, payload) => api.post(`/facilities/${id}/report`, payload).then((r) => r.data),

  // Public appointments
  doctors: (facilityId) => api.get(`/facilities/${facilityId}/doctors`).then((r) => r.data),
  appointmentSlots: (facilityId, params) => api.get(`/facilities/${facilityId}/appointments/slots`, { params }).then((r) => r.data),
  bookAppointment: (facilityId, payload) => api.post(`/facilities/${facilityId}/appointments`, payload).then((r) => r.data),

  // Self-service (requires facility auth)
  myListing: () => api.get('/facilities/me/listing').then((r) => r.data),
  updateMyListing: (payload) => api.put('/facilities/me/listing', payload).then((r) => r.data),
  uploadImage: (payload) => api.post('/facilities/me/images', payload).then((r) => r.data),
  deleteImage: (publicId) => api.delete(`/facilities/me/images/${encodeURIComponent(publicId)}`).then((r) => r.data),
  doctorsMine: () => api.get('/facilities/me/doctors').then((r) => r.data),
  createDoctor: (payload) => api.post('/facilities/me/doctors', payload).then((r) => r.data),
  updateDoctor: (id, payload) => api.put(`/facilities/me/doctors/${id}`, payload).then((r) => r.data),
  deleteDoctor: (id) => api.delete(`/facilities/me/doctors/${id}`).then((r) => r.data),
  appointmentsMine: (params) => api.get('/facilities/me/appointments', { params }).then((r) => r.data),
  updateAppointmentStatus: (id, payload) => api.patch(`/facilities/me/appointments/${id}/status`, payload).then((r) => r.data),
};
