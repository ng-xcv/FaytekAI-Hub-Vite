import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchEvents = createAsyncThunk('calendar/fetchAll', async (params) => {
  const { data } = await axiosInstance.get('/api/calendar', { params });
  return Array.isArray(data) ? data : (data.events || []);
});

export const createEvent = createAsyncThunk('calendar/create', async (payload) => {
  const { data } = await axiosInstance.post('/api/calendar', payload);
  return data.data || data;
});

export const updateEvent = createAsyncThunk('calendar/update', async ({ id, payload }) => {
  const { data } = await axiosInstance.put(`/api/calendar/${id}`, payload);
  return data.data || data;
});

export const deleteEvent = createAsyncThunk('calendar/delete', async (id) => {
  await axiosInstance.delete(`/api/calendar/${id}`);
  return id;
});

export const syncOutlook = createAsyncThunk('calendar/syncOutlook', async () => {
  const { data } = await axiosInstance.post('/api/calendar/sync/outlook');
  return data;
});

const slice = createSlice({
  name: 'calendar',
  initialState: {
    events: [],
    isLoading: false,
    isSyncing: false,
    error: null,
    lastSync: null,
  },
  reducers: {
    addEvent: (s, a) => {
      if (a.payload?._id) s.events.push(a.payload);
    },
    removeEvent: (s, a) => {
      s.events = s.events.filter(e => e._id !== a.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (s) => { s.isLoading = true; })
      .addCase(fetchEvents.fulfilled, (s, a) => {
        s.isLoading = false;
        s.events = a.payload;
      })
      .addCase(fetchEvents.rejected, (s, a) => {
        s.isLoading = false;
        s.error = a.error.message;
      })
      .addCase(createEvent.fulfilled, (s, a) => {
        if (a.payload?._id) s.events.push(a.payload);
      })
      .addCase(updateEvent.fulfilled, (s, a) => {
        if (a.payload?._id) {
          const idx = s.events.findIndex(e => e._id === a.payload._id);
          if (idx !== -1) s.events[idx] = a.payload;
        }
      })
      .addCase(deleteEvent.fulfilled, (s, a) => {
        s.events = s.events.filter(e => e._id !== a.payload);
      })
      .addCase(syncOutlook.pending, (s) => { s.isSyncing = true; })
      .addCase(syncOutlook.fulfilled, (s) => {
        s.isSyncing = false;
        s.lastSync = new Date().toISOString();
      })
      .addCase(syncOutlook.rejected, (s) => { s.isSyncing = false; });
  },
});

export const { addEvent, removeEvent } = slice.actions;
export default slice.reducer;
