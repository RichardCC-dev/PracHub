const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'No se pudo completar la solicitud.');
  }

  return data;
};

export const getPendingOffers = async (token) => {
  const response = await fetch(`${API_URL}/admin/offers/pending`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

export const getOfferStats = async (token) => {
  const response = await fetch(`${API_URL}/admin/offers/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

export const getModerationHistory = async (token, limit = 50) => {
  const response = await fetch(`${API_URL}/admin/offers/history?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

export const approveOffer = async (token, offerId) => {
  const response = await fetch(`${API_URL}/admin/offers/${offerId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

export const rejectOffer = async (token, offerId, rejectionReason) => {
  const response = await fetch(`${API_URL}/admin/offers/${offerId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rejectionReason }),
  });
  return parseResponse(response);
};

export const getCompanies = async (token, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.verificationStatus) params.append('verificationStatus', filters.verificationStatus);
  if (filters.canPublishOffers !== undefined) params.append('canPublishOffers', filters.canPublishOffers);
  if (filters.search) params.append('search', filters.search);

  const response = await fetch(`${API_URL}/admin/companies?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

export const enableCompanyPublishing = async (token, companyId) => {
  const response = await fetch(`${API_URL}/admin/companies/${companyId}/enable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

export const disableCompanyPublishing = async (token, companyId) => {
  const response = await fetch(`${API_URL}/admin/companies/${companyId}/disable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};

export const getOffersByStatus = async (token, status, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const response = await fetch(`${API_URL}/admin/offers/status/${status}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return parseResponse(response);
};
