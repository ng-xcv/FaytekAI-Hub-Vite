import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

// ─── Mapper backend → frontend ────────────────────────────────────────────────
const normalizeProject = (p) => {
  if (!p) return p;
  return {
    ...p,
    name: p.nom || p.name || '',
    status: p.statut || p.status || 'actif',
    owner: p.proprietaire || p.owner || null,
    members: p.membres || p.members || [],
    budget: p.budgetAlloue || p.budget || 0,
    progress: p.progression !== undefined ? p.progression : (p.progress !== undefined ? p.progress : 0),
    color: p.couleur || p.color || '#4A90D9',
    startDate: p.dateDebut || p.startDate || null,
    endDate: p.dateFin || p.endDate || null,
  };
};

export const fetchProjects = createAsyncThunk('project/fetchAll', async (params) => {
  const { data } = await axiosInstance.get('/api/project', { params });
  const list = Array.isArray(data) ? data : (data.projects || []);
  return { projects: list.map(normalizeProject), total: list.length };
});

export const fetchProjectById = createAsyncThunk('project/fetchById', async (id) => {
  const { data } = await axiosInstance.get(`/api/project/${id}`);
  return normalizeProject(data.data || data);
});

export const createProject = createAsyncThunk('project/create', async (payload) => {
  const body = {
    nom: payload.nom || payload.name,
    description: payload.description,
    workspace: payload.workspace || 'bureau',
    statut: payload.statut || payload.status || 'actif',
    couleur: payload.couleur || payload.color || '#4A90D9',
    dateDebut: payload.dateDebut || payload.startDate,
    dateFin: payload.dateFin || payload.endDate,
  };
  const { data } = await axiosInstance.post('/api/project', body);
  return normalizeProject(data.data || data);
});

export const updateProject = createAsyncThunk('project/update', async ({ id, payload }) => {
  const body = {
    ...payload,
    nom: payload.nom || payload.name,
    statut: payload.statut || payload.status,
  };
  const { data } = await axiosInstance.put(`/api/project/${id}`, body);
  return normalizeProject(data.data || data);
});

export const deleteProject = createAsyncThunk('project/delete', async (id) => {
  await axiosInstance.delete(`/api/project/${id}`);
  return id;
});

const slice = createSlice({
  name: 'project',
  initialState: { list: [], total: 0, current: null, isLoading: false, error: null },
  reducers: { setCurrentProject: (s, a) => { s.current = a.payload; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (s) => { s.isLoading = true; })
      .addCase(fetchProjects.fulfilled, (s, a) => { s.isLoading = false; s.list = a.payload.projects; s.total = a.payload.total; })
      .addCase(fetchProjects.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      .addCase(fetchProjectById.fulfilled, (s, a) => { s.current = a.payload; })
      .addCase(createProject.fulfilled, (s, a) => { if (a.payload?._id) s.list.unshift(a.payload); })
      .addCase(updateProject.fulfilled, (s, a) => {
        if (a.payload?._id) { const idx = s.list.findIndex(p => p._id === a.payload._id); if (idx !== -1) s.list[idx] = a.payload; }
      })
      .addCase(deleteProject.fulfilled, (s, a) => { s.list = s.list.filter(p => p._id !== a.payload); });
  },
});
export const { setCurrentProject } = slice.actions;
export default slice.reducer;
