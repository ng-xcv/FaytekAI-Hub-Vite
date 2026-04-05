import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchContacts = createAsyncThunk('crm/fetchContacts', async (params) => {
  const { data } = await axiosInstance.get('/api/crm/contacts', { params });
  return data;
});
export const fetchInteractions = createAsyncThunk('crm/fetchInteractions', async (params) => {
  const { data } = await axiosInstance.get('/api/crm/interactions', { params });
  return data;
});
export const createContact = createAsyncThunk('crm/createContact', async (payload) => {
  const { data } = await axiosInstance.post('/api/crm/contacts', payload);
  return data.contact;
});

const slice = createSlice({
  name: 'crm',
  initialState: { contacts: [], interactions: [], total: 0, isLoading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (s) => { s.isLoading = true; })
      .addCase(fetchContacts.fulfilled, (s, a) => { s.isLoading = false; s.contacts = a.payload.contacts || []; s.total = a.payload.total || 0; })
      .addCase(fetchContacts.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; })
      .addCase(fetchInteractions.fulfilled, (s, a) => { s.interactions = a.payload.interactions || []; })
      .addCase(createContact.fulfilled, (s, a) => { s.contacts.unshift(a.payload); });
  },
});
export default slice.reducer;
