import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { PATH_AUTH } from '../routes/paths';
import LoadingScreen from '../components/LoadingScreen';

export default function AuthGuard({ children }) {
  const { isAuthenticated, isInitialized } = useAuth();
  if (!isInitialized) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to={PATH_AUTH.login} replace />;
  return children;
}
