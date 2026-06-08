const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () =>
  localStorage.getItem('prachub_token') ?? sessionStorage.getItem('prachub_token');

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Error en la solicitud.');
  return data;
};

// Seguir/Dejar de seguir empresas
export const followCompany = async (companyId) => {
  const response = await fetch(`${API_URL}/saved-companies/${companyId}/follow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

export const unfollowCompany = async (companyId) => {
  const response = await fetch(`${API_URL}/saved-companies/${companyId}/unfollow`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

export const isFollowingCompany = async (companyId) => {
  const response = await fetch(`${API_URL}/saved-companies/${companyId}/is-following`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

// Empresas seguidas
export const getFollowedCompanies = async (includeOffers = true) => {
  const response = await fetch(
    `${API_URL}/saved-companies?includeOffers=${includeOffers}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` },
    }
  );
  return parseResponse(response);
};

export const getFollowedCompaniesCount = async () => {
  const response = await fetch(`${API_URL}/saved-companies/count`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

// Feed de empresas seguidas
export const getFollowedCompaniesFeed = async (options = {}) => {
  const { limit = 20, offset = 0 } = options;
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });

  const response = await fetch(`${API_URL}/saved-companies/feed?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

// Sugerencias de empresas
export const getSuggestedCompanies = async (limit = 5) => {
  const response = await fetch(`${API_URL}/saved-companies/suggested?limit=${limit}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

// Preferencias de notificaciones
export const updateNotificationPreference = async (companyId, notificationsEnabled) => {
  const response = await fetch(`${API_URL}/saved-companies/${companyId}/notifications`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ notificationsEnabled }),
  });
  return parseResponse(response);
};
