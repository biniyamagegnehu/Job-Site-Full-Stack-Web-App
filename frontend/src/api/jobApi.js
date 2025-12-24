import axiosInstance from './axiosConfig';

export const jobApi = {
  getAllJobs: (page = 0, size = 10) =>
    axiosInstance.get(`/api/jobs?page=${page}&size=${size}`),

  searchJobs: (title = '', filters = {}, page = 0, size = 10) => {
    const params = new URLSearchParams({
      title,
      page,
      size,
      ...filters
    });
    // Remove null/undefined/empty string params
    for (const [key, value] of params.entries()) {
      if (value === null || value === undefined || value === '') {
        params.delete(key);
      }
    }
    return axiosInstance.get(`/api/jobs/search?${params.toString()}`);
  },

  getJobDetails: (id) =>
    axiosInstance.get(`/api/jobs/${id}`),
};

export default jobApi;