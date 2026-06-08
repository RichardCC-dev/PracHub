import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  startSimulation,
  sendMessageToSimulation,
  endSimulation,
  getSimulationHistory,
  getSimulationDetails,
  getSimulationStats,
} from '../services/api';
import useAuthStore from '../store/authStore';

export const SIMULATIONS_KEYS = {
  history: () => ['simulations', 'history'],
  stats: () => ['simulations', 'stats'],
  detail: (id) => ['simulations', 'detail', id],
};

/**
 * Obtiene el historial de simulaciones del estudiante.
 */
export function useSimulationHistory() {
  const { token, user } = useAuthStore();
  const isStudent = user?.role === 'student';

  return useQuery({
    queryKey: SIMULATIONS_KEYS.history(),
    queryFn: () => getSimulationHistory(token),
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
    queryFn: () => getSimulationStats(token),
    select: (data) => data?.stats ?? null,
    enabled: !!token && isStudent,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Obtiene el detalle de una simulación específica.
 * @param {number|string} id
 */
export function useSimulationDetail(id) {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: SIMULATIONS_KEYS.detail(id),
    queryFn: () => getSimulationDetails(id, token),
    select: (data) => data?.simulation ?? null,
    enabled: !!token && !!id,
  });
}

/**
 * Mutación para iniciar una nueva simulación.
 * Invalida el historial automáticamente.
 */
export function useStartSimulation() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: ({ role, career, sector }) => startSimulation(role, token, career, sector),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIMULATIONS_KEYS.history() });
    },
  });
}

/**
 * Mutación para enviar un mensaje en una simulación en curso.
 * Invalida el detalle de la simulación para sincronizar el chat.
 */
export function useSendSimulationMessage(simulationId) {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: ({ message }) => sendMessageToSimulation(simulationId, message, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SIMULATIONS_KEYS.detail(simulationId) });
    },
  });
}

/**
 * Mutación para finalizar una simulación y generar el feedback de IA.
 */
export function useEndSimulation() {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  return useMutation({
    mutationFn: (simulationId) => endSimulation(simulationId, token),
    onSuccess: (data) => {
      const id = data?.simulation?.id;
      queryClient.invalidateQueries({ queryKey: SIMULATIONS_KEYS.history() });
      queryClient.invalidateQueries({ queryKey: SIMULATIONS_KEYS.stats() });
      if (id) queryClient.invalidateQueries({ queryKey: SIMULATIONS_KEYS.detail(id) });
    },
  });
}
