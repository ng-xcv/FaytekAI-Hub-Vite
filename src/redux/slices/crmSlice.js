import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchContacts = createAsyncThunk('crm/fetchContacts', async (params) => {
  const { data } = await axiosInstance.get('/api/crm/contacts', { params });
  return { contacts: Array.isArray(data) ? data : (data.contacts || []), total: data.total || 0 };
});

export const createContact = createAsyncThunk('crm/createContact', async (payload) => {
  const { data } = await axiosInstance.post('/api/crm/contacts', payload);
  return data.data || data;
});

export const updateContact = createAsyncThunk('crm/updateContact', async ({ id, payload }) => {
  const { data } = await axiosInstance.put(`/api/crm/contacts/${id}`, payload);
  return data.data || data;
});

export const deleteContact = createAsyncThunk('crm/deleteContact', async (id) => {
  await axiosInstance.delete(`/api/crm/contacts/${id}`);
  return id;
});

export const fetchContactInteractions = createAsyncThunk('crm/fetchInteractions', async (contactId) => {
  const { data } = await axiosInstance.get(`/api/crm/contacts/${contactId}/interactions`);
  return { contactId, interactions: Array.isArray(data) ? data : [] };
});

export const createInteraction = createAsyncThunk('crm/createInteraction', async ({ contactId, payload }) => {
  const { data } = await axiosInstance.post(`/api/crm/contacts/${contactId}/interactions`, payload);
  return data.data || data;
});

export const fetchCRMStats = createAsyncThunk('crm/fetchStats', async () => {
  const { data } = await axiosInstance.get('/api/crm/stats');
  return data;
});

export const fetchCampagnes = createAsyncThunk('crm/fetchCampagnes', async () => {
  const { data } = await axiosInstance.get('/api/crm/campagnes');
  return Array.isArray(data) ? data : [];
});

export const createCampagne = createAsyncThunk('crm/createCampagne', async (payload) => {
  const { data } = await axiosInstance.post('/api/crm/campagnes', payload);
  return data.data || data;
});

const slice = createSlice({
  name: 'crm',
  initialState: {
    contacts: [],
    interactions: {},
    campagnes: [],
    stats: null,
    total: 0,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (s) => { s.isLoading = true; })
      .addCase(fetchContacts.fulfilled, (s, a) => {
        s.isLoading = false;
        s.contacts = a.payload.contacts;
        s.total = a.payload.total;
      })
      .addCase(fetchContacts.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.error.message;
      })
      .addCase(createContact.fulfilled, (s, a) => {
        if (a.payload?._id) s.contacts.unshift(a.payload);
      })
      .addCase(updateContact.fulfilled, (s, a) => {
        if (a.payload?._id) {
          const idx = s.contacts.findIndex(c => c._id === a.payload._id);
          if (idx !== -1) s.contacts[idx] = a.payload;
        }
      })
      .addCase(deleteContact.fulfilled, (s, a) => {
        s.contacts = s.contacts.filter(c => c._id !== a.payload);
      })
      .addCase(fetchContactInteractions.fulfilled, (s, a) => {
        s.interactions[a.payload.contactId] = a.payload.interactions;
      })
      .addCase(createInteraction.fulfilled, (s, a) => {
        if (a.payload?.contactId) {
          const list = s.interactions[a.payload.contactId] || [];
          s.interactions[a.payload.contactId] = [a.payload, ...list];
        }
      })
      .addCase(fetchCRMStats.fulfilled, (s, a) => { s.stats = a.payload; })
      .addCase(fetchCampagnes.fulfilled, (s, a) => { s.campagnes = a.payload; })
      .addCase(createCampagne.fulfilled, (s, a) => {
        if (a.payload?._id) s.campagnes.unshift(a.payload);
      });
  },
});

export default slice.reducer;
