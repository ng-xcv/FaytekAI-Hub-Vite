import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchTasks = createAsyncThunk('task/fetchAll', async (params) => {
  const { data } = await axiosInstance.get('/api/tasks', { params });
  return data;
});
export const createTask = createAsyncThunk('task/create', async (payload) => {
  const { data } = await axiosInstance.post('/api/tasks', payload);
  return data.task;
});
export const updateTask = createAsyncThunk('task/update', async ({ id, payload }) => {
  const { data } = await axiosInstance.put(`/api/tasks/${id}`, payload);
  return data.task;
});
export const deleteTask = createAsyncThunk('task/delete', async (id) => {
  await axiosInstance.delete(`/api/tasks/${id}`);
  return id;
});

const slice = createSlice({
  name: 'task',
  initialState: { list: [], total: 0, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchTasks.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload.tasks || []; s.total = a.payload.total || 0; })
      .addCase(fetchTasks.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      .addCase(createTask.fulfilled, (s, a) => { s.list.unshift(a.payload); s.total += 1; })
      .addCase(updateTask.fulfilled, (s, a) => { const idx = s.list.findIndex(t => t._id === a.payload._id); if (idx !== -1) s.list[idx] = a.payload; })
      .addCase(deleteTask.fulfilled, (s, a) => { s.list = s.list.filter(t => t._id !== a.payload); s.total -= 1; });
  },
});
export default slice.reducer;
