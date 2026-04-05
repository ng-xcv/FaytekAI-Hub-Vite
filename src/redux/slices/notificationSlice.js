import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchNotifications = createAsyncThunk('notification/fetchAll', async () => {
  const { data } = await axiosInstance.get('/api/notifications');
  return data;
});
export const markAsRead = createAsyncThunk('notification/markRead', async (id) => {
  await axiosInstance.patch(`/api/notifications/${id}/read`);
  return id;
});
export const markAllAsRead = createAsyncThunk('notification/markAllRead', async () => {
  await axiosInstance.patch('/api/notifications/read-all');
});

const slice = createSlice({
  name: 'notification',
  initialState: { list: [], unreadCount: 0, isLoading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.list = a.payload.notifications || [];
        s.unreadCount = s.list.filter(n => !n.lu).length;
      })
      .addCase(markAsRead.fulfilled, (s, a) => {
        const n = s.list.find(x => x._id === a.payload);
        if (n) { n.lu = true; s.unreadCount = Math.max(0, s.unreadCount - 1); }
      })
      .addCase(markAllAsRead.fulfilled, (s) => {
        s.list.forEach(n => { n.lu = true; });
        s.unreadCount = 0;
      });
  },
});
export default slice.reducer;
