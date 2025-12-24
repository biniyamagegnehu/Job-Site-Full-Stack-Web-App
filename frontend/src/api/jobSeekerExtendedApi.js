import axiosInstance from './axiosConfig';

export const jobSeekerExtendedApi = {
  // Applications
  getApplications: (page = 0, size = 10) =>
    axiosInstance.get(`/api/applications/my-applications?page=${page}&size=${size}`),

  applyForJob: (jobId, applicationData = {}) =>
    axiosInstance.post('/api/applications', { jobId, ...applicationData }),

  // CV Management
  getCVs: () =>
    axiosInstance.get('/api/job-seekers/cv'),

  uploadCV: (formData) =>
    axiosInstance.post('/api/job-seekers/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  deleteCV: () =>
    axiosInstance.delete('/api/job-seekers/cv'),


  // Saved Jobs
  getSavedJobs: (page = 0, size = 10) =>
    axiosInstance.get(`/api/job-seeker/saved-jobs?page=${page}&size=${size}`),

  saveJob: (jobId) =>
    axiosInstance.post(`/api/job-seeker/jobs/${jobId}/save`),

  unsaveJob: (jobId) =>
    axiosInstance.delete(`/api/job-seeker/jobs/${jobId}/save`),

  // Download CV (returns blob)
  downloadCV: () => axiosInstance.get('/api/job-seekers/cv/download', { responseType: 'blob' }),
};

export default jobSeekerExtendedApi;