import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protege rutas exclusivas de empresas.
 * Redirige a "/dashboard" si el usuario autenticado no tiene rol "company".
 */
const CompanyRoute = ({ children }) => {
  const { token, user, isInitialized, isLoading, authVerified } = useAuthStore();

  if (!isInitialized || isLoading) return <LoadingSpinner />;
  if (token && !authVerified) return <LoadingSpinner />;

  if (authVerified) {
    if (!token || !user) return <Navigate to="/" replace />;
    if (user.role !== 'company') return <Navigate to="/dashboard" replace />;
    return children;
  }

  return <Navigate to="/" replace />;
};

export default CompanyRoute;
