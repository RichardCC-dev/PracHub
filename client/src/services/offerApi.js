const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'No se pudo completar la solicitud.');
  }
  return data;
};

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
