import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOffers, getMyOffers, createOffer, updateOffer, closeOffer } from '../services/offerApi';
import useAuthStore from '../store/authStore';

export const OFFERS_KEYS = {
  all: ['offers'],
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

/**
 * Mutación para crear una oferta (empresa).
 * Invalida automáticamente la lista de mis ofertas.
 */
export function useCreateOffer() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation({
    mutationFn: (offerData) => createOffer(token, offerData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OFFERS_KEYS.mine() }),
  });
}

/**
 * Mutación para actualizar una oferta (empresa).
 */
export function useUpdateOffer() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation({
    mutationFn: ({ offerId, data }) => updateOffer(token, offerId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OFFERS_KEYS.mine() }),
  });
}

/**
 * Mutación para cerrar una oferta (empresa).
 */
export function useCloseOffer() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  return useMutation({
    mutationFn: (offerId) => closeOffer(token, offerId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OFFERS_KEYS.mine() }),
  });
}
