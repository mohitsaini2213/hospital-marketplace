import api from './api';

export const adminService = {
  dashboardSummary: () => api.get('/admin/dashboard/summary').then((r) => r.data),

  listFacilities: (params) => api.get('/admin/facilities', { params }).then((r) => r.data),
  updateFacility: (id, payload) => api.put(`/admin/facilities/${id}`, payload).then((r) => r.data),
  approveFacility: (id) => api.patch(`/admin/facilities/${id}/approve`).then((r) => r.data),
  rejectFacility: (id, reason) => api.patch(`/admin/facilities/${id}/reject`, { reason }).then((r) => r.data),
  suspendFacility: (id) => api.patch(`/admin/facilities/${id}/suspend`).then((r) => r.data),
  deleteFacility: (id) => api.delete(`/admin/facilities/${id}`).then((r) => r.data),

  listWebsiteLeads: (params) => api.get('/admin/website-leads', { params }).then((r) => r.data),
  updateWebsiteLead: (id, payload) => api.patch(`/admin/website-leads/${id}`, payload).then((r) => r.data),

  listActivity: (params) => api.get('/admin/activity', { params }).then((r) => r.data),

  createCategory: (payload) => api.post('/admin/categories', payload).then((r) => r.data),
  updateCategory: (id, payload) => api.put(`/admin/categories/${id}`, payload).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data),

  listReviews: (params) => api.get('/admin/reviews', { params }).then((r) => r.data),
  moderateReview: (id, status) => api.patch(`/admin/reviews/${id}`, { status }).then((r) => r.data),

  listAdmins: () => api.get('/admin/admins').then((r) => r.data),
  createAdmin: (payload) => api.post('/admin/admins', payload).then((r) => r.data),
  updateAdminStatus: (id, payload) => api.patch(`/admin/admins/${id}`, payload).then((r) => r.data),
};

export const notificationService = {
  list: () => api.get('/notifications').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/notifications/read-all').then((r) => r.data),
};
