import axiosInstance from './axiosConfig';

export const jobSeekerApi = {
  getProfile: () =>
    axiosInstance.get('/api/job-seekers/profile'),

  updateProfile: (profileData) =>
    axiosInstance.put('/api/job-seekers/profile', profileData),

  deleteAccount: () =>
    axiosInstance.delete('/api/job-seekers/profile'),
};

export default jobSeekerApi;