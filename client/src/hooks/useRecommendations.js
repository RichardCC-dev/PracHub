import { useQuery } from '@tanstack/react-query';
import { getRecommendedOffers } from '../services/recommendationApi';
import useAuthStore from '../store/authStore';

export const RECOMMENDATIONS_KEYS = {
  all: ['recommendations'],
};

/**
 * Obtiene el ranking de ofertas recomendadas para el estudiante autenticado.
 * Solo se activa si hay un token válido de rol estudiante.
 */
export function useRecommendations() {
  const { token, user } = useAuthStore();
  const isStudent = user?.role === 'student';

  return useQuery({
    queryKey: RECOMMENDATIONS_KEYS.all,
    queryFn: getRecommendedOffers,
    select: (data) => data?.data ?? [],
    enabled: !!token && isStudent,
    staleTime: 1000 * 60 * 5, // 5 minutos: cálculo TF-IDF es costoso
    retry: false,              // No reintentar si el CV no existe
  });
}
