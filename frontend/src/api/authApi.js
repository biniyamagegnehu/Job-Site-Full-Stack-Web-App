import axiosInstance from './axiosConfig';

// Normalize responses from backend ApiResponse (which nests data.user)
// so that callers get { user, token } or user directly.
export const authApi = {
  register: async (userData) => {
    const response = await axiosInstance.post('/api/auth/register', userData);
    // Backend returns ApiResponse with data.user (AuthResponse)
    const user = response.data?.data?.user || response.data;
    const token = user?.accessToken || null;
    return { user, token };
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    const user = response.data?.data?.user;
    const token = user?.accessToken || null;
    return { user, token };
  },
};

export default authApi;