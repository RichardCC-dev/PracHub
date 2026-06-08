const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () =>
  localStorage.getItem('prachub_token') ?? sessionStorage.getItem('prachub_token');

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Error en la solicitud.');
  return data;
};

// Configuración de alertas
export const getAlertSettings = async () => {
  const response = await fetch(`${API_URL}/alerts/settings`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

export const updateAlertSettings = async (settings) => {
  const response = await fetch(`${API_URL}/alerts/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(settings),
  });
  return parseResponse(response);
};

// Historial de alertas
export const getAlertHistory = async (options = {}) => {
  const { limit = 50, offset = 0, since } = options;
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (since) params.append('since', since);

  const response = await fetch(`${API_URL}/alerts/history?${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};
