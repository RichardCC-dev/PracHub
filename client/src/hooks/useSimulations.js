import { useQuery } from '@tanstack/react-query';
import { getSimulationHistory, getSimulationStats } from '../services/api';
import useAuthStore from '../store/authStore';

export const SIMULATIONS_KEYS = {
  history: () => ['simulations', 'history'],
  stats: () => ['simulations', 'stats'],
};

/**
 * Obtiene el historial de simulaciones del estudiante.
 */
export function useSimulationHistory() {
  const { token, user } = useAuthStore();
  const isStudent = user?.role === 'student';

  return useQuery({
    queryKey: SIMULATIONS_KEYS.history(),
    queryFn: () => getSimulationHistory(),
    select: (data) => data?.simulations ?? [],
    enabled: !!token && isStudent,
  });
}

/**
 * Obtiene las estadísticas de simulaciones del estudiante.
 */
export function useSimulationStats() {
  const { token, user } = useAuthStore();
  const isStudent = user?.role === 'student';

  return useQuery({
    queryKey: SIMULATIONS_KEYS.stats(),
    queryFn: () => getSimulationStats(),
    select: (data) => data?.stats ?? null,
    enabled: !!token && isStudent,
    staleTime: 1000 * 60 * 5,
  });
}
