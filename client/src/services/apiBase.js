/**
 * @module apiBase
 * Helpers compartidos para todos los módulos de servicios del frontend.
 *
 * Importar desde aquí evita duplicar API_URL, getToken y parseResponse
 * en cada archivo de servicios.
 */

/** URL base de la API, configurable vía variable de entorno. */
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Lee el JWT desde localStorage (sesión persistente) o sessionStorage (sesión temporal).
 * @returns {string|null}
 */
export const getToken = () =>
  localStorage.getItem('prachub_token') ?? sessionStorage.getItem('prachub_token');

/**
 * Construye los headers de autorización para una petición fetch.
 * @param {boolean} [withContentType=false] - Si true, añade Content-Type: application/json.
 * @returns {Record<string, string>}
 */
export const authHeaders = (withContentType = false) => {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(withContentType ? { 'Content-Type': 'application/json' } : {}),
  };
};

/**
 * Parsea la respuesta de fetch y lanza un Error si el servidor devolvió un status de error.
 * @param {Response} response
 * @returns {Promise<any>}
 */
export const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'No se pudo completar la solicitud.');
  }
  return data;
};
