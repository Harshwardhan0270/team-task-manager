import api from './api'

export const projectsService = {
  getAll: () => api.get('/projects').then(r => r.data),
  create: (data) => api.post('/projects', data).then(r => r.data),
  update: (id, data) => api.put(`/projects/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/projects/${id}`),
  getMembers: (id) => api.get(`/projects/${id}/members`).then(r => r.data),
  addMember: (id, userId) => api.post(`/projects/${id}/members`, { userId }).then(r => r.data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
}
