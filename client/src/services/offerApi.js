import { API_URL, parseResponse } from './apiBase';

export const createOffer = async (token, offerData) => {
  const response = await fetch(`${API_URL}/offers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(offerData),
  });
  return parseResponse(response);
};

export const getMyOffers = async (token) => {
  const response = await fetch(`${API_URL}/offers/my`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

export const updateOffer = async (token, offerId, offerData) => {
  const response = await fetch(`${API_URL}/offers/${offerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(offerData),
  });
  return parseResponse(response);
};

export const closeOffer = async (token, offerId) => {
  const response = await fetch(`${API_URL}/offers/${offerId}/close`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

/**
 * Obtener todas las ofertas públicas (para estudiantes)
 * @param {object} filters - Filtros opcionales (modality, search, etc.)
 */
export const getAllOffers = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.modality) params.append('modality', filters.modality);
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  
  const queryString = params.toString();
  const url = queryString ? `${API_URL}/offers?${queryString}` : `${API_URL}/offers`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return parseResponse(response);
};
