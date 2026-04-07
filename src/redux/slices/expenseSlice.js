import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchExpenses = createAsyncThunk('expense/fetchAll', async (params) => {
  const { data } = await axiosInstance.get('/api/expense', { params });
  const list = Array.isArray(data) ? data : (data.expenses || []);
  return { expenses: list, total: list.length, totalAmount: list.reduce((s, e) => s + (e.montant || 0), 0) };
});

export const fetchExpenseStats = createAsyncThunk('expense/fetchStats', async (params) => {
  const [summary, byCategory, trend] = await Promise.all([
    axiosInstance.get('/api/expense/stats/summary', { params }),
    axiosInstance.get('/api/expense/stats/by-category', { params }),
    axiosInstance.get('/api/expense/stats/trend', { params }),
  ]);
  return { summary: summary.data, byCategory: byCategory.data, trend: trend.data };
});

export const createExpense = createAsyncThunk('expense/create', async (payload) => {
  const { data } = await axiosInstance.post('/api/expense', payload);
  return data.data || data;
});

export const updateExpense = createAsyncThunk('expense/update', async ({ id, payload }) => {
  const { data } = await axiosInstance.put(`/api/expense/${id}`, payload);
  return data.data || data;
});

export const deleteExpense = createAsyncThunk('expense/delete', async (id) => {
  await axiosInstance.delete(`/api/expense/${id}`);
  return id;
});

// Alertes
export const fetchAlertes = createAsyncThunk('expense/fetchAlertes', async () => {
  const { data } = await axiosInstance.get('/api/alerte/depenses');
  return Array.isArray(data) ? data : [];
});

export const marquerAlerteLue = createAsyncThunk('expense/marquerAlerteLue', async (id) => {
  await axiosInstance.patch(`/api/alerte/${id}`, { lue: true });
  return id;
});

const slice = createSlice({
  name: 'expense',
  initialState: {
    list: [], total: 0, totalAmount: 0,
    stats: { summary: null, byCategory: [], trend: [] },
    alertes: [],
    isLoading: false, error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (s) => { s.isLoading = true; })
      .addCase(fetchExpenses.fulfilled, (s, a) => {
        s.isLoading = false;
        s.list = a.payload.expenses;
        s.total = a.payload.total;
        s.totalAmount = a.payload.totalAmount;
      })
      .addCase(fetchExpenses.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      .addCase(fetchExpenseStats.fulfilled, (s, a) => { s.stats = a.payload; })
      .addCase(createExpense.fulfilled, (s, a) => { if (a.payload?._id) s.list.unshift(a.payload); })
      .addCase(updateExpense.fulfilled, (s, a) => {
        if (a.payload?._id) {
          const idx = s.list.findIndex(e => e._id === a.payload._id);
          if (idx !== -1) s.list[idx] = a.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (s, a) => { s.list = s.list.filter(e => e._id !== a.payload); })
      .addCase(fetchAlertes.fulfilled, (s, a) => { s.alertes = a.payload; })
      .addCase(marquerAlerteLue.fulfilled, (s, a) => {
        s.alertes = s.alertes.filter(al => al._id !== a.payload);
      });
  },
});

export default slice.reducer;
