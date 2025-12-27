import axiosInstance from './axiosConfig';

export const employerApi = {
  // Job Management (use public `/api/jobs` endpoints that accept employer role)
  getJobs: (page = 0, size = 10) =>
    axiosInstance.get(`/api/jobs/employer/my-jobs?page=${page}&size=${size}`),

  getJobDetails: (id) =>
    axiosInstance.get(`/api/jobs/${id}`),

  createJob: (jobData) =>
    axiosInstance.post('/api/jobs', jobData),

  updateJob: (id, jobData) =>
    axiosInstance.put(`/api/jobs/${id}`, jobData),

  deleteJob: (id) =>
    axiosInstance.delete(`/api/jobs/${id}`),

  toggleJobStatus: (id, isActive) =>
    axiosInstance.patch(`/api/jobs/${id}/toggle-status?isActive=${isActive}`),

  // Applications
  getApplications: (jobId = null, page = 0, size = 10) => {
    const url = jobId
      ? `/api/applications/job/${jobId}?page=${page}&size=${size}`
      : `/api/applications/employer/my-applications?page=${page}&size=${size}`;
    return axiosInstance.get(url);
  },

  getApplicationDetails: (id) =>
    axiosInstance.get(`/api/applications/${id}`),

  updateApplicationStatus: (id, status, notes = '') =>
    axiosInstance.patch(`/api/applications/${id}/status?status=${status}&notes=${notes}`),

  // Dashboard Stats
  getDashboardStats: () =>
    axiosInstance.get('/api/employer/dashboard/stats'),

  // Profiles
  getApplicantProfile: (id) =>
    axiosInstance.get(`/api/job-seekers/${id}/profile`),
};

export default employerApi;