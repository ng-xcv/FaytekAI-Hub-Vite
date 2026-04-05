import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchEvents = createAsyncThunk('calendar/fetchEvents', async (params) => {
  const { data } = await axiosInstance.get('/api/calendar/events', { params });
  return data;
});

const slice = createSlice({
  name: 'calendar',
  initialState: { events: [], isLoading: false, error: null },
  reducers: {
    addEvent: (s, a) => { s.events.push(a.payload); },
    removeEvent: (s, a) => { s.events = s.events.filter(e => e.id !== a.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (s) => { s.isLoading = true; })
      .addCase(fetchEvents.fulfilled, (s, a) => { s.isLoading = false; s.events = a.payload.events || []; })
      .addCase(fetchEvents.rejected, (s, a) => { s.isLoading = false; s.error = a.error.message; });
  },
});
export const { addEvent, removeEvent } = slice.actions;
export default slice.reducer;
