import { useQuery } from '@tanstack/react-query';
import companyMetricsApi from '../services/companyMetricsApi';

/**
 * Hook para obtener métricas de seguidores de la empresa.
 * Usa TanStack Query para caching y actualización automática.
 */
export const useFollowerMetrics = () => {
  return useQuery({
    queryKey: ['company-metrics', 'followers'],
    queryFn: async () => {
      const data = await companyMetricsApi.getFollowerMetrics();
      return {
        totalFollowers: data.totalFollowers || 0,
        byCareer: data.byCareer || [],
        byUniversity: data.byUniversity || [],
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,  // 10 minutos (antiguo cacheTime)
    retry: 2,
    enabled: true,
  });
};

/**
 * Hook para obtener crecimiento de seguidores (últimos 30 días).
 * Usa TanStack Query para caching y actualización automática.
 */
export const useFollowerGrowth = () => {
  return useQuery({
    queryKey: ['company-metrics', 'growth'],
    queryFn: async () => {
      const data = await companyMetricsApi.getFollowerGrowth();
      return {
        growth: data.growth || [],
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000,   // 30 minutos
    retry: 2,
    enabled: true,
  });
};

export default { useFollowerMetrics, useFollowerGrowth };
