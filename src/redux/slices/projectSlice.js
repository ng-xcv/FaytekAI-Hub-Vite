import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchProjects = createAsyncThunk('project/fetchAll', async (params) => {
  const { data } = await axiosInstance.get('/api/projects', { params });
  return data;
});
export const createProject = createAsyncThunk('project/create', async (payload) => {
  const { data } = await axiosInstance.post('/api/projects', payload);
  return data.project;
});
export const updateProject = createAsyncThunk('project/update', async ({ id, payload }) => {
  const { data } = await axiosInstance.put(`/api/projects/${id}`, payload);
  return data.project;
});
export const deleteProject = createAsyncThunk('project/delete', async (id) => {
  await axiosInstance.delete(`/api/projects/${id}`);
  return id;
});

const slice = createSlice({
  name: 'project',
  initialState: { list: [], total: 0, current: null, isLoading: false, error: null },
  reducers: { setCurrentProject: (s, a) => { s.current = a.payload; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (s) => { s.isLoading = true; })
      .addCase(fetchProjects.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload.projects || []; s.total = a.payload.total || 0; })
      .addCase(fetchProjects.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      .addCase(createProject.fulfilled, (s, a) => { s.list.unshift(a.payload); })
      .addCase(updateProject.fulfilled, (s, a) => { const idx = s.list.findIndex(p => p._id === a.payload._id); if (idx !== -1) s.list[idx] = a.payload; })
      .addCase(deleteProject.fulfilled, (s, a) => { s.list = s.list.filter(p => p._id !== a.payload); });
  },
});
export const { setCurrentProject } = slice.actions;
export default slice.reducer;
