import axiosInstance from './axiosConfig';

export const adminApi = {
  getDashboard: () =>
    axiosInstance.get('/api/admin/dashboard'),

  getUsers: (page = 0, size = 10) =>
    axiosInstance.get(`/api/admin/users?page=${page}&size=${size}`),

  getPendingEmployers: () =>
    axiosInstance.get('/api/admin/employers/pending'),

  approveEmployer: (id) =>
    axiosInstance.patch(`/api/admin/employers/${id}/approve`),

  rejectEmployer: (id) =>
    axiosInstance.patch(`/api/admin/employers/${id}/reject`),

  // Jobs
  listJobs: (page = 0, size = 10) =>
    axiosInstance.get(`/api/admin/jobs?page=${page}&size=${size}`),

  getPendingJobs: (page = 0, size = 10) =>
    axiosInstance.get(`/api/admin/jobs/pending?page=${page}&size=${size}`),

  approveJob: (id) =>
    axiosInstance.patch(`/api/admin/jobs/${id}/approve`),

  rejectJob: (id) =>
    axiosInstance.patch(`/api/admin/jobs/${id}/reject`),

  deleteJob: (id) =>
    axiosInstance.delete(`/api/admin/jobs/${id}`),

  deleteUser: (id) =>
    axiosInstance.delete(`/api/admin/users/${id}`),

  deactivateJob: (id) =>
    axiosInstance.patch(`/api/admin/jobs/${id}/deactivate`),

  createUser: (userData) =>
    axiosInstance.post('/api/admin/users', userData),

  updateUser: (id, userData) =>
    axiosInstance.put(`/api/admin/users/${id}`, userData),
};

export default adminApi;