import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protege rutas exclusivas de estudiantes.
 * Redirige a "/dashboard" si el usuario autenticado no tiene rol "student".
 */
const StudentRoute = ({ children }) => {
  const { token, user, isInitialized, isLoading, authVerified } = useAuthStore();

  if (!isInitialized || isLoading) return <LoadingSpinner />;

  if (authVerified) {
    if (user?.role !== 'student') return <Navigate to="/dashboard" replace />;
    return children;
  }

  if (token && !authVerified) return <LoadingSpinner message="Verificando sesión..." />;

  return <Navigate to="/" replace />;
};

export default StudentRoute;
