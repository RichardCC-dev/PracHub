import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInvitations,
  sendInvitation,
  respondToInvitation,
} from '../services/invitationApi';

/**
 * Hook para gestionar invitaciones a postular (HU-18)
 * Integración con React Query para server state management
 */

/**
 * useInvitations - Listar invitaciones del estudiante
 * @param {string} status - PENDING | ACCEPTED | DECLINED
 * @param {boolean} enabled - Control de habilitación de la query
 * @returns {object}
 */
export function useInvitations(status = 'PENDING', enabled = true) {
  return useQuery({
    queryKey: ['invitations', status],
    queryFn: () => getInvitations(status),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos (antes: cacheTime)
    enabled,
    retry: 2,
  });
}

/**
 * useSendInvitation - Enviar invitación a postular
 * @returns {object}
 */
export function useSendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, offerId, recruiterMessage }) =>
      sendInvitation(studentId, offerId, recruiterMessage),
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
    retry: 1,
  });
}

/**
 * useRespondToInvitation - Responder a una invitación
 * @returns {object}
 */
export function useRespondToInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId, response }) =>
      respondToInvitation(invitationId, response),
    onSuccess: () => {
      // Invalidar todas las queries de invitaciones
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      // También invalidar aplicaciones si aceptó
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
    retry: 1,
  });
}
