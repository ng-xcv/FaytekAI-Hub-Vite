import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { PATH_AFTER_LOGIN } from '../config';

export default function GuestGuard({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={PATH_AFTER_LOGIN} replace />;
  return children;
}
