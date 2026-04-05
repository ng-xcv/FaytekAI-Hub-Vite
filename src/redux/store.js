import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import rootReducer from './rootReducer';

// Custom localStorage wrapper — évite les problèmes ESM/Vite avec redux-persist/lib/storage
const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => { localStorage.setItem(key, value); return Promise.resolve(); },
  removeItem: (key) => { localStorage.removeItem(key); return Promise.resolve(); },
};

const persistConfig = { key: 'faytekAI', storage, whitelist: ['settings'] };
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] } }),
});

export const persistor = persistStore(store);
