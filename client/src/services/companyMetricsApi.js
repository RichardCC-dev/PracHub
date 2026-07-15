import { API_URL, authHeaders, parseResponse } from './apiBase';

/**
 * Servicio para obtener métricas de seguidores de empresa.
 * Endpoints: GET /api/company-metrics/*
 */

export const companyMetricsApi = {
  /**
   * Obtiene métricas de seguidores: total y distribución por carrera/universidad
   * @returns {Promise<{totalFollowers, byCareer, byUniversity}>}
   */
  getFollowerMetrics: async () => {
    const response = await fetch(`${API_URL}/company-metrics/followers`, {
      method: 'GET',
      headers: authHeaders(),
    });
    return parseResponse(response);
  },

  /**
   * Obtiene el crecimiento de seguidores en los últimos 30 días
   * @returns {Promise<{growth: Array<{date, dailyFollowers}>}>}
   */
  getFollowerGrowth: async () => {
    const response = await fetch(`${API_URL}/company-metrics/growth`, {
      method: 'GET',
      headers: authHeaders(),
    });
    return parseResponse(response);
  },
};

export default companyMetricsApi;
