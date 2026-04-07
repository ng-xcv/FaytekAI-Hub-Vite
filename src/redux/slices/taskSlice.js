import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// ─── Mapper backend → frontend ────────────────────────────────────────────────
// Le backend utilise les noms FR (titre, statut, priorite, dateEcheance)
// Le frontend a été codé avec des noms EN (title, status, priority, deadline)
// On normalise ici pour que tous les composants fonctionnent sans modification
const normalizeTask = (t) => {
  if (!t) return t;
  return {
    ...t,
    // Aliases EN → permet d'utiliser task.title OU task.titre
    title: t.titre || t.title || '',
    status: t.statut || t.status || 'todo',
    priority: t.priorite !== undefined ? t.priorite : (t.priority !== undefined ? t.priority : 3),
    deadline: t.dateEcheance || t.deadline || null,
    score: t.scoring !== undefined ? t.scoring : (t.score !== undefined ? t.score : 0),
    project: t.projet || t.project || null,
    projectId: t.projet?._id || t.projet || t.projectId || null,
    createdBy: t.creePar || t.createdBy || null,
    assignedTo: t.assigneA || t.assignedTo || null,
    estimatedTime: t.tempsEstime || t.estimatedTime || 0,
    timeSpent: t.tempsPasse || t.timeSpent || 0,
  };
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchTasks = createAsyncThunk('task/fetchAll', async (params) => {
  const { data } = await axiosInstance.get('/api/task', { params });
  const list = Array.isArray(data) ? data : (data.tasks || []);
  return { tasks: list.map(normalizeTask), total: list.length };
});

export const createTask = createAsyncThunk('task/create', async (payload) => {
  // Mapper EN → FR pour l'envoi au backend
  const body = {
    titre: payload.titre || payload.title,
    description: payload.description,
    statut: payload.statut || payload.status || 'todo',
    priorite: payload.priorite !== undefined ? payload.priorite : (payload.priority !== undefined ? payload.priority : 3),
    scoring: payload.scoring || payload.score || 0,
    dateEcheance: payload.dateEcheance || payload.deadline || null,
    workspace: payload.workspace || 'bureau',
    projet: payload.projet || payload.projectId || null,
    tags: payload.tags || [],
    source: payload.source || 'web',
  };
  const { data } = await axiosInstance.post('/api/task', body);
  return normalizeTask(data.tache || data.task || data);
});

export const updateTask = createAsyncThunk('task/update', async ({ id, payload }) => {
  const body = {
    ...payload,
    titre: payload.titre || payload.title,
    statut: payload.statut || payload.status,
    priorite: payload.priorite !== undefined ? payload.priorite : payload.priority,
    dateEcheance: payload.dateEcheance || payload.deadline,
    scoring: payload.scoring !== undefined ? payload.scoring : payload.score,
  };
  const { data } = await axiosInstance.put(`/api/task/${id}`, body);
  return normalizeTask(data.tache || data.task || data);
});

export const updateTaskStatus = createAsyncThunk('task/updateStatus', async ({ id, statut }) => {
  const { data } = await axiosInstance.patch(`/api/task/${id}/statut`, { statut });
  return normalizeTask(data.tache || data.task || data);
});

export const updateTaskScore = createAsyncThunk('task/updateScore', async ({ id, scoring }) => {
  const { data } = await axiosInstance.patch(`/api/task/${id}/scoring`, { scoring });
  return normalizeTask(data.tache || data.task || data);
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
    overdueAlerts: [],
  },
  reducers: {
    computeOverdueAlerts: (state) => {
      const now = new Date().getTime();
      state.overdueAlerts = state.list.filter(
        (t) => t.deadline && new Date(t.deadline).getTime() < now && t.status !== 'done' && t.status !== 'cancelled'
      );
    },
    clearOverdueAlert: (state, action) => {
      state.overdueAlerts = state.overdueAlerts.filter((t) => t._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (s) => { s.isLoading = true; s.error = null; })
      .addCase(fetchTasks.fulfilled, (s, a) => {
        s.isLoading = false;
        s.list = a.payload.tasks;
        s.total = a.payload.total;
        const now = new Date().getTime();
        s.overdueAlerts = s.list.filter(
          (t) => t.deadline && new Date(t.deadline).getTime() < now && t.status !== 'done' && t.status !== 'cancelled'
        );
      })
      .addCase(fetchTasks.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      .addCase(createTask.fulfilled, (s, a) => { if (a.payload?._id) { s.list.unshift(a.payload); s.total += 1; } })
      .addCase(updateTask.fulfilled, (s, a) => {
        if (a.payload?._id) { const idx = s.list.findIndex((t) => t._id === a.payload._id); if (idx !== -1) s.list[idx] = a.payload; }
      })
      .addCase(updateTaskStatus.fulfilled, (s, a) => {
        if (a.payload?._id) { const idx = s.list.findIndex((t) => t._id === a.payload._id); if (idx !== -1) s.list[idx] = a.payload; }
      })
      .addCase(updateTaskScore.fulfilled, (s, a) => {
        if (a.payload?._id) { const idx = s.list.findIndex((t) => t._id === a.payload._id); if (idx !== -1) s.list[idx] = { ...s.list[idx], scoring: a.payload.scoring, score: a.payload.scoring }; }
      })
      .addCase(deleteTask.fulfilled, (s, a) => {
        s.list = s.list.filter((t) => t._id !== a.payload);
        s.total -= 1;
        s.overdueAlerts = s.overdueAlerts.filter((t) => t._id !== a.payload);
      });
  },
});

export const { computeOverdueAlerts, clearOverdueAlert } = slice.actions;
export default slice.reducer;
