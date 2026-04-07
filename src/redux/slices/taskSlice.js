import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk('task/fetchAll', async (params) => {
  const { data } = await axiosInstance.get('/api/task', { params });
  // Le backend retourne un tableau directement
  return Array.isArray(data) ? { tasks: data, total: data.length } : data;
});

export const createTask = createAsyncThunk('task/create', async (payload) => {
  const { data } = await axiosInstance.post('/api/task', payload);
  return data.tache || data.task || data;
});

export const updateTask = createAsyncThunk('task/update', async ({ id, payload }) => {
  const { data } = await axiosInstance.put(`/api/task/${id}`, payload);
  return data.tache || data.task || data;
});

export const updateTaskStatus = createAsyncThunk('task/updateStatus', async ({ id, statut }) => {
  const { data } = await axiosInstance.patch(`/api/task/${id}/statut`, { statut });
  return data.tache || data.task || data;
});

export const updateTaskScore = createAsyncThunk('task/updateScore', async ({ id, scoring }) => {
  const { data } = await axiosInstance.patch(`/api/task/${id}/scoring`, { scoring });
  return data.tache || data.task || data;
});

export const deleteTask = createAsyncThunk('task/delete', async (id) => {
  await axiosInstance.delete(`/api/task/${id}`);
  return id;
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const slice = createSlice({
  name: 'task',
  initialState: {
    list: [],
    total: 0,
    isLoading: false,
    error: null,
    overdueAlerts: [], // tâches avec deadline dépassée
  },
  reducers: {
    // Calculer les alertes deadline depuis la liste chargée
    computeOverdueAlerts: (state) => {
      const now = new Date().getTime();
      state.overdueAlerts = state.list.filter(
        (t) =>
          t.dateEcheance &&
          new Date(t.dateEcheance).getTime() < now &&
          t.statut !== 'done' &&
          t.statut !== 'cancelled'
      );
    },
    clearOverdueAlert: (state, action) => {
      state.overdueAlerts = state.overdueAlerts.filter((t) => t._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchTasks.fulfilled, (s, a) => {
        s.isLoading = false;
        s.list = a.payload.tasks || [];
        s.total = a.payload.total || 0;
        // Calculer les alertes deadline dès le chargement
        const now = new Date().getTime();
        s.overdueAlerts = s.list.filter(
          (t) =>
            t.dateEcheance &&
            new Date(t.dateEcheance).getTime() < now &&
            t.statut !== 'done' &&
            t.statut !== 'cancelled'
        );
      })
      .addCase(fetchTasks.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      // createTask
      .addCase(createTask.fulfilled, (s, a) => {
        if (a.payload?._id) { s.list.unshift(a.payload); s.total += 1; }
      })
      // updateTask
      .addCase(updateTask.fulfilled, (s, a) => {
        if (a.payload?._id) {
          const idx = s.list.findIndex((t) => t._id === a.payload._id);
          if (idx !== -1) s.list[idx] = a.payload;
        }
      })
      // updateTaskStatus (Kanban drag&drop)
      .addCase(updateTaskStatus.fulfilled, (s, a) => {
        if (a.payload?._id) {
          const idx = s.list.findIndex((t) => t._id === a.payload._id);
          if (idx !== -1) s.list[idx] = { ...s.list[idx], statut: a.payload.statut };
        }
      })
      // updateTaskScore
      .addCase(updateTaskScore.fulfilled, (s, a) => {
        if (a.payload?._id) {
          const idx = s.list.findIndex((t) => t._id === a.payload._id);
          if (idx !== -1) s.list[idx] = { ...s.list[idx], scoring: a.payload.scoring };
        }
      })
      // deleteTask
      .addCase(deleteTask.fulfilled, (s, a) => {
        s.list = s.list.filter((t) => t._id !== a.payload);
        s.total -= 1;
        s.overdueAlerts = s.overdueAlerts.filter((t) => t._id !== a.payload);
      });
  },
});

export const { computeOverdueAlerts, clearOverdueAlert } = slice.actions;
export default slice.reducer;
