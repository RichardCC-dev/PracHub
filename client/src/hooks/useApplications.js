import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMyApplications,
  createApplication,
  getApplicationPreview,
  getOfferApplications,
  updateApplicationStatus,
} from '../services/applicationApi';
import useAuthStore from '../store/authStore';

export const APPLICATIONS_KEYS = {
  mine: () => ['applications', 'mine'],
  offerApplicants: (offerId) => ['applications', 'offer', offerId],
  preview: (offerId) => ['applications', 'preview', offerId],
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

/**
 * Obtiene la previsualización de datos antes de postular.
 * @param {number|string} offerId
 */
export function useApplicationPreview(offerId) {
  const { token } = useAuthStore();
  return useQuery({
    queryKey: APPLICATIONS_KEYS.preview(offerId),
    queryFn: () => getApplicationPreview(offerId),
    select: (data) => data?.data ?? data,
    enabled: !!token && !!offerId,
  });
}

/**
 * Obtiene los postulantes de una oferta (empresa).
 * @param {number|string} offerId
 */
export function useOfferApplicants(offerId) {
  const { token, user } = useAuthStore();
  const isCompany = user?.role === 'company';

  return useQuery({
    queryKey: APPLICATIONS_KEYS.offerApplicants(offerId),
    queryFn: () => getOfferApplications(offerId),
    select: (data) => data?.data ?? data?.applications ?? [],
    enabled: !!token && isCompany && !!offerId,
  });
}

/**
 * Mutación para postular a una oferta (one-click apply).
 * Invalida automáticamente la lista de postulaciones del estudiante.
 */
export function useApply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (applicationData) => createApplication(applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEYS.mine() });
    },
  });
}

/**
 * Mutación para cambiar el estado de una postulación (empresa).
 */
export function useUpdateApplicationStatus(offerId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, data }) => updateApplicationStatus(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEYS.offerApplicants(offerId) });
    },
  });
}
