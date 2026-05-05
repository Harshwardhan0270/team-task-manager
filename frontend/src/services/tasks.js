import api from './api'

export const tasksService = {
  getAll: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }).then(r => r.data),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data).then(r => r.data),
  updateStatus: (projectId, taskId, status) => api.patch(`/projects/${projectId}/tasks/${taskId}`, { status }).then(r => r.data),
}
