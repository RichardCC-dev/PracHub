import { API_URL, getToken, parseResponse } from './apiBase';

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
