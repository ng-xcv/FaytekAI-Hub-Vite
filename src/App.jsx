import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { SnackbarProvider } from 'notistack';
import ThemeProvider from './theme';
import { store, persistor } from './redux/store';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import Router from './routes';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <PermissionsProvider>
                <SnackbarProvider
                  maxSnack={3}
                  autoHideDuration={3000}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <Router />
                </SnackbarProvider>
              </PermissionsProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </PersistGate>
    </ReduxProvider>
  );
}
