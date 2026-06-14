/**
 * @module messageApi
 * Servicios de mensajería directa (HU-24, HU-25, HU-26).
 */
import { API_URL, authHeaders, parseResponse } from './apiBase';

/**
 * Envía un mensaje directo a otro usuario.
 * @param {number} receiverId - ID del usuario receptor
 * @param {string} content - Contenido del mensaje (máx. 2000 chars)
 */
export const sendMessage = async (receiverId, content) => {
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ receiverId, content }),
  });
  return parseResponse(response);
};

/**
 * Obtiene la bandeja de entrada: lista de conversaciones con el último
 * mensaje y conteo de no leídos por conversación.
 */
export const getInbox = async () => {
  const response = await fetch(`${API_URL}/messages/inbox`, {
    headers: authHeaders(),
  });
  return parseResponse(response);
};

/**
 * Obtiene el conteo total de mensajes no leídos del usuario autenticado.
 */
export const getUnreadMessageCount = async () => {
  const response = await fetch(`${API_URL}/messages/unread-count`, {
    headers: authHeaders(),
  });
  return parseResponse(response);
};

/**
 * Obtiene el historial de mensajes de una conversación específica.
 * @param {number} userId - ID del otro participante
 * @param {{ limit?: number, offset?: number }} options
 */
export const getConversation = async (userId, options = {}) => {
  const { limit = 50, offset = 0 } = options;
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const response = await fetch(`${API_URL}/messages/conversation/${userId}?${params}`, {
    headers: authHeaders(),
  });
  return parseResponse(response);
};

/**
 * Marca como leídos todos los mensajes no leídos de una conversación.
 * @param {number} userId - ID del remitente cuyos mensajes se marcan como leídos
 */
export const markConversationRead = async (userId) => {
  const response = await fetch(`${API_URL}/messages/conversation/${userId}/read`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return parseResponse(response);
};

/**
 * Busca usuarios del sistema por nombre o email para iniciar conversaciones (HU-26).
 * @param {string} query - Texto a buscar (mín. 2 caracteres)
 * @param {number} limit - Máximo de resultados (default 10, máx. 20)
 */
export const searchUsers = async (query, limit = 10) => {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await fetch(`${API_URL}/messages/users/search?${params}`, {
    headers: authHeaders(),
  });
  return parseResponse(response);
};
