import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchProjects = createAsyncThunk('project/fetchAll', async (params) => {
  const { data } = await axiosInstance.get('/api/project', { params });
  // Backend retourne un tableau direct
  return Array.isArray(data) ? { projects: data, total: data.length } : data;
});

export const fetchProjectById = createAsyncThunk('project/fetchById', async (id) => {
  const { data } = await axiosInstance.get(`/api/project/${id}`);
  return data;
});

export const createProject = createAsyncThunk('project/create', async (payload) => {
  const { data } = await axiosInstance.post('/api/project', payload);
  return data.data; // { message, data: projet }
});

export const updateProject = createAsyncThunk('project/update', async ({ id, payload }) => {
  const { data } = await axiosInstance.put(`/api/project/${id}`, payload);
  return data.data; // { message, data: projet }
});

export const deleteProject = createAsyncThunk('project/delete', async (id) => {
  await axiosInstance.delete(`/api/project/${id}`);
  return id;
});

const slice = createSlice({
  name: 'project',
  initialState: { list: [], total: 0, current: null, isLoading: false, error: null },
  reducers: {
    setCurrentProject: (s, a) => { s.current = a.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchProjects.fulfilled, (s, a) => {
        s.isLoading = false;
        s.list = a.payload.projects || [];
        s.total = a.payload.total || 0;
      })
      .addCase(fetchProjects.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      .addCase(fetchProjectById.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchProjectById.fulfilled, (s, a) => {
        s.isLoading = false;
        s.current = a.payload;
      })
      .addCase(fetchProjectById.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      .addCase(createProject.fulfilled, (s, a) => {
        if (a.payload?._id) s.list.unshift(a.payload);
        s.total += 1;
      })
      .addCase(updateProject.fulfilled, (s, a) => {
        if (a.payload?._id) {
          const idx = s.list.findIndex((p) => p._id === a.payload._id);
          if (idx !== -1) s.list[idx] = a.payload;
          s.current = a.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (s, a) => {
        s.list = s.list.filter((p) => p._id !== a.payload);
        s.total = Math.max(0, s.total - 1);
      });
  },
});

export const { setCurrentProject } = slice.actions;
export default slice.reducer;
