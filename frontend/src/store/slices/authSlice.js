import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';

// Helper function to safely parse JSON
const safeParseJSON = (item, defaultValue = null) => {
  if (!item) return defaultValue;
  try {
    return JSON.parse(item);
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
};

// Helper function to get user from localStorage safely
const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user');
    return safeParseJSON(userStr);
  } catch (error) {
    console.error('Error getting user from storage:', error);
    return null;
  }
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // authApi.login now returns a normalized { user, token } object
      const data = await authApi.login(credentials);
      return data;
    } catch (error) {
      // Log raw server response for easier debugging
      console.error('Login error response:', error.response?.data || error.message || error);

      // Extract error message properly
      const errorData = error.response?.data;
      let errorMessage = 'Login failed';
      
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.validationErrors) {
        // Handle validation errors
        const validationMessages = Object.values(errorData.validationErrors).flat();
        errorMessage = validationMessages.join(', ');
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      // authApi.register returns the created user object
      const data = await authApi.register(userData);
      return data;
    } catch (error) {
      // Log raw server response for easier debugging
      console.error('Register error response:', error.response?.data || error.message || error);

      // Extract error message properly
      const errorData = error.response?.data;
      let errorMessage = 'Registration failed';
      
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.validationErrors) {
        // Handle validation errors
        const validationMessages = Object.values(errorData.validationErrors).flat();
        errorMessage = validationMessages.join(', ');
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: getUserFromStorage(),
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearStorage: (state) => {
      // Clear localStorage and reset state
      state.user = null;
      state.token = null;
      try {
        localStorage.clear();
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        try {
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        } catch (error) {
          console.error('Error saving to localStorage:', error);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        // Normalized response: { user, token }
        const user = action.payload?.user || null;
        const token = action.payload?.token || null;
        state.user = user;
        state.token = token;
        try {
          if (token) localStorage.setItem('token', token);
          if (user) localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Error saving to localStorage after register:', error);
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      });
  },
});

export const { logout, clearError, clearStorage } = authSlice.actions;
export default authSlice.reducer;