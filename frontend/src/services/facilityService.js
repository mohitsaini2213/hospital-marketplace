import api from './api';

export const facilityService = {
  list: (params) => api.get('/facilities', { params }).then((r) => r.data),
  get: (idOrSlug) => api.get(`/facilities/${idOrSlug}`).then((r) => r.data),
  mapFacilities: (params) => api.get('/map/facilities', { params }).then((r) => r.data),
  categories: () => api.get('/categories').then((r) => r.data),
  submitReview: (id, payload) => api.post(`/facilities/${id}/reviews`, payload).then((r) => r.data),
  report: (id, payload) => api.post(`/facilities/${id}/report`, payload).then((r) => r.data),

  // Self-service (requires facility auth)
  myListing: () => api.get('/facilities/me/listing').then((r) => r.data),
  updateMyListing: (payload) => api.put('/facilities/me/listing', payload).then((r) => r.data),
  uploadImage: (payload) => api.post('/facilities/me/images', payload).then((r) => r.data),
  deleteImage: (publicId) => api.delete(`/facilities/me/images/${encodeURIComponent(publicId)}`).then((r) => r.data),
};
