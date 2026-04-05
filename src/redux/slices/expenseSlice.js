import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchExpenses = createAsyncThunk('expense/fetchAll', async (params) => {
  const { data } = await axiosInstance.get('/api/expenses', { params });
  return data;
});
export const createExpense = createAsyncThunk('expense/create', async (payload) => {
  const { data } = await axiosInstance.post('/api/expenses', payload);
  return data.expense;
});
export const updateExpense = createAsyncThunk('expense/update', async ({ id, payload }) => {
  const { data } = await axiosInstance.put(`/api/expenses/${id}`, payload);
  return data.expense;
});
export const deleteExpense = createAsyncThunk('expense/delete', async (id) => {
  await axiosInstance.delete(`/api/expenses/${id}`);
  return id;
});

const slice = createSlice({
  name: 'expense',
  initialState: { list: [], total: 0, totalAmount: 0, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (s) => { s.isLoading = true; })
      .addCase(fetchExpenses.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload.expenses || []; s.total = a.payload.total || 0; s.totalAmount = a.payload.totalAmount || 0; })
      .addCase(fetchExpenses.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      .addCase(createExpense.fulfilled, (s, a) => { s.list.unshift(a.payload); })
      .addCase(updateExpense.fulfilled, (s, a) => { const idx = s.list.findIndex(e => e._id === a.payload._id); if (idx !== -1) s.list[idx] = a.payload; })
      .addCase(deleteExpense.fulfilled, (s, a) => { s.list = s.list.filter(e => e._id !== a.payload); });
  },
});
export default slice.reducer;
