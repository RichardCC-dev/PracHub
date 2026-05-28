const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () => {
  return localStorage.getItem('prachub_token') ?? sessionStorage.getItem('prachub_token');
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo completar la solicitud.');
  }
  return data;
};

/**
 * Previsualizar datos antes de postular
 * @param {number} offerId - ID de la oferta
 */
export const getApplicationPreview = async (offerId) => {
  const response = await fetch(`${API_URL}/applications/preview/${offerId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

/**
 * Crear una nueva postulación (One-click apply)
 * @param {object} data - Datos de la postulación
 */
export const createApplication = async (data) => {
  const response = await fetch(`${API_URL}/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return parseResponse(response);
};

/**
 * Obtener postulaciones del estudiante actual
 */
export const getMyApplications = async () => {
  const response = await fetch(`${API_URL}/applications/my-applications`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

/**
 * Verificar si se puede postular a una oferta
 * @param {number} offerId - ID de la oferta
 */
export const canApply = async (offerId) => {
  const response = await fetch(`${API_URL}/applications/can-apply/${offerId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

/**
 * Obtener postulaciones de una oferta (para empresas)
 * @param {number} offerId - ID de la oferta
 */
export const getOfferApplications = async (offerId) => {
  const response = await fetch(`${API_URL}/applications/offer/${offerId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

/**
 * Actualizar estado de una postulación (para empresas)
 * @param {number} applicationId - ID de la postulación
 * @param {object} data - Datos a actualizar
 */
export const updateApplicationStatus = async (applicationId, data) => {
  const response = await fetch(`${API_URL}/applications/${applicationId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  return parseResponse(response);
};
