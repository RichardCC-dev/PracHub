const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const getToken = () =>
  localStorage.getItem('prachub_token') ?? sessionStorage.getItem('prachub_token');

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Error en la solicitud.');
  return data;
};

export const getMyNotifications = async () => {
  const response = await fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

export const getUnreadCount = async () => {
  const response = await fetch(`${API_URL}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};

export const markAllNotificationsAsRead = async () => {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return parseResponse(response);
};
