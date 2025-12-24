import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobApi } from '../../api/jobApi';

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async ({ page = 0, size = 10, search = '' }, { rejectWithValue }) => {
    try {
      const response = search 
        ? await jobApi.searchJobs(search, page, size)
        : await jobApi.getAllJobs(page, size);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch jobs');
    }
  }
);

export const fetchJobDetails = createAsyncThunk(
  'jobs/fetchJobDetails',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await jobApi.getJobDetails(jobId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch job details');
    }
  }
);

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    jobs: [],
    currentJob: null,
    loading: false,
    error: null,
    pagination: {
      page: 0,
      size: 10,
      totalPages: 0,
      totalElements: 0,
    },
  },
  reducers: {
    clearJobError: (state) => {
      state.error = null;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.content;
        state.pagination = {
          page: action.payload.number,
          size: action.payload.size || 10,
          totalPages: action.payload.totalPages,
          totalElements: action.payload.totalElements,
        };
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchJobDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearJobError, clearCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;