import { createSlice } from '@reduxjs/toolkit';
const slice = createSlice({
  name: 'settings',
  initialState: { themeMode: 'dark' },
  reducers: {
    setThemeMode: (state, action) => { state.themeMode = action.payload; },
    toggleTheme: (state) => {
      const modes = ['dark', 'light', 'gold'];
      const idx = modes.indexOf(state.themeMode);
      state.themeMode = modes[(idx + 1) % modes.length];
    },
  },
});
export const { setThemeMode, toggleTheme } = slice.actions;
export default slice.reducer;
