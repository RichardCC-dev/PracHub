import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protege rutas que requieren cualquier usuario autenticado.
 * Redirige a "/" si no hay sesión activa.
 */
const PrivateRoute = ({ children }) => {
  const { token, user, isInitialized, isLoading, authVerified } = useAuthStore();
  const location = useLocation();

  if (!isInitialized || isLoading) return <LoadingSpinner />;
  if (!authVerified && token) return <LoadingSpinner />;
  if (authVerified && (!token || !user)) return <Navigate to="/" replace state={{ from: location }} />;
  if (!token) return <Navigate to="/" replace state={{ from: location }} />;

  return children;
};

export default PrivateRoute;
