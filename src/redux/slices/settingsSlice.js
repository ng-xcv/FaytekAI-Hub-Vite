import { createSlice } from '@reduxjs/toolkit';

// Lire themeMode depuis localStorage au boot
const savedTheme = (() => {
  try { return localStorage.getItem('faytekAI_themeMode') || 'dark'; } catch { return 'dark'; }
})();

const slice = createSlice({
  name: 'settings',
  initialState: { themeMode: savedTheme },
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
