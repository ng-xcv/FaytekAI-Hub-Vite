import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchIdeas = createAsyncThunk('idea/fetchAll', async (params) => {
  const { data } = await axiosInstance.get('/api/ideas', { params });
  return data;
});
export const createIdea = createAsyncThunk('idea/create', async (payload) => {
  const { data } = await axiosInstance.post('/api/ideas', payload);
  return data.idea;
});
export const updateIdea = createAsyncThunk('idea/update', async ({ id, payload }) => {
  const { data } = await axiosInstance.put(`/api/ideas/${id}`, payload);
  return data.idea;
});
export const deleteIdea = createAsyncThunk('idea/delete', async (id) => {
  await axiosInstance.delete(`/api/ideas/${id}`);
  return id;
});

const slice = createSlice({
  name: 'idea',
  initialState: { list: [], total: 0, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIdeas.pending, (s) => { s.isLoading = true; })
      .addCase(fetchIdeas.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload.ideas || []; s.total = a.payload.total || 0; })
      .addCase(fetchIdeas.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      .addCase(createIdea.fulfilled, (s, a) => { s.list.unshift(a.payload); })
      .addCase(updateIdea.fulfilled, (s, a) => { const idx = s.list.findIndex(i => i._id === a.payload._id); if (idx !== -1) s.list[idx] = a.payload; })
      .addCase(deleteIdea.fulfilled, (s, a) => { s.list = s.list.filter(i => i._id !== a.payload); });
  },
});
export default slice.reducer;
