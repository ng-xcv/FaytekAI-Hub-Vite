import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchIdeas = createAsyncThunk('idea/fetchAll', async (params) => {
  const { data } = await axiosInstance.get('/api/idea', { params });
  return data;
});

export const createIdea = createAsyncThunk('idea/create', async (payload) => {
  const { data } = await axiosInstance.post('/api/idea', payload);
  return data.data;
});

export const updateIdea = createAsyncThunk('idea/update', async ({ id, payload }) => {
  const { data } = await axiosInstance.put(`/api/idea/${id}`, payload);
  return data.data;
});

export const deleteIdea = createAsyncThunk('idea/delete', async (id) => {
  await axiosInstance.delete(`/api/idea/${id}`);
  return id;
});

export const startBrainstorm = createAsyncThunk('idea/startBrainstorm', async (id) => {
  const { data } = await axiosInstance.post(`/api/idea/${id}/brainstorm/start`);
  return data.data;
});

export const validateActions = createAsyncThunk('idea/validateActions', async ({ id, actionNumeros }) => {
  const { data } = await axiosInstance.post(`/api/idea/${id}/actions/validate`, { actionNumeros });
  return data.data;
});

const slice = createSlice({
  name: 'idea',
  initialState: { list: [], total: 0, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIdeas.pending, (s) => { s.isLoading = true; })
      .addCase(fetchIdeas.fulfilled, (s, a) => {
        s.isLoading = false;
        s.list = a.payload.data || [];
        s.total = a.payload.pagination?.total || 0;
      })
      .addCase(fetchIdeas.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      .addCase(createIdea.fulfilled, (s, a) => { if (a.payload) s.list.unshift(a.payload); })
      .addCase(updateIdea.fulfilled, (s, a) => {
        if (a.payload) {
          const idx = s.list.findIndex(i => i._id === a.payload._id);
          if (idx !== -1) s.list[idx] = a.payload;
        }
      })
      .addCase(deleteIdea.fulfilled, (s, a) => { s.list = s.list.filter(i => i._id !== a.payload); })
      .addCase(startBrainstorm.fulfilled, (s, a) => {
        if (a.payload) {
          const idx = s.list.findIndex(i => i._id === a.payload._id);
          if (idx !== -1) s.list[idx] = a.payload;
        }
      })
      .addCase(validateActions.fulfilled, (s, a) => {
        if (a.payload?.idea) {
          const idx = s.list.findIndex(i => i._id === a.payload.idea._id);
          if (idx !== -1) s.list[idx] = a.payload.idea;
        }
      });
  },
});

export default slice.reducer;
