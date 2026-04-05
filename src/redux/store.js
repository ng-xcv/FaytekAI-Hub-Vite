import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

// Persister themeMode dans localStorage manuellement (sans redux-persist)
store.subscribe(() => {
  try {
    const { themeMode } = store.getState().settings;
    localStorage.setItem('faytekAI_themeMode', themeMode);
  } catch {}
});

// Faux persistor pour compatibilité PersistGate (on va retirer PersistGate de App)
export const persistor = null;
