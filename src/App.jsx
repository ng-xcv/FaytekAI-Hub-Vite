import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import ThemeProvider from './theme';
import { store } from './redux/store';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import Router from './routes';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </ThemeProvider>
    </ReduxProvider>
  );
}
