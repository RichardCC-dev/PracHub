import { useQuery } from '@tanstack/react-query';
import { getAllOffers, getMyOffers } from '../services/offerApi';
import useAuthStore from '../store/authStore';

export const OFFERS_KEYS = {
  public: (filters) => ['offers', 'public', filters],
  mine: () => ['offers', 'mine'],
};

/**
 * Obtiene el catálogo de ofertas públicas (estudiantes).
 * @param {object} filters - { modality, search, status }
 */
export function usePublicOffers(filters = {}) {
  return useQuery({
    queryKey: OFFERS_KEYS.public(filters),
    queryFn: () => getAllOffers(filters),
    select: (data) => data?.data?.offers ?? [],
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * Obtiene las ofertas de la empresa autenticada.
 */
export function useMyOffers() {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: OFFERS_KEYS.mine(),
    queryFn: () => getMyOffers(token),
    select: (data) => data?.data?.offers ?? data?.offers ?? [],
    enabled: !!token,
  });
}
