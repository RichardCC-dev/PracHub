import { useQuery } from '@tanstack/react-query';
import { getMyApplications } from '../services/applicationApi';
import useAuthStore from '../store/authStore';

export const APPLICATIONS_KEYS = {
  mine: () => ['applications', 'mine'],
};

/**
 * Obtiene las postulaciones del estudiante autenticado.
 */
export function useMyApplications() {
  const { token, user } = useAuthStore();
  const isStudent = user?.role === 'student';

  return useQuery({
    queryKey: APPLICATIONS_KEYS.mine(),
    queryFn: getMyApplications,
    select: (data) => data?.data ?? [],
    enabled: !!token && isStudent,
  });
}
