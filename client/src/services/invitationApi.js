import { API_URL, getToken, authHeaders, parseResponse } from './apiBase';

/**
 * API client para invitaciones a postular (HU-18)
 * Base: /api/invitations
 */

/**
 * Enviar invitación a postular a un candidato
 * @param {number} studentId - ID del candidato
 * @param {number} offerId - ID de la oferta
 * @param {string} recruiterMessage - Mensaje personalizado (max 300)
 * @returns {Promise}
 */
export async function sendInvitation(studentId, offerId, recruiterMessage) {
  const response = await fetch(`${API_URL}/invitations/send`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      studentId,
      offerId,
      recruiterMessage,
    }),
  });
  return parseResponse(response);
}

/**
 * Listar invitaciones del estudiante actual
 * @param {string} status - PENDING | ACCEPTED | DECLINED (default: PENDING)
 * @returns {Promise}
 */
export async function getInvitations(status = 'PENDING') {
  const response = await fetch(
    `${API_URL}/invitations?status=${status}`,
    {
      method: 'GET',
      headers: authHeaders(),
    }
  );
  return parseResponse(response);
}

/**
 * Responder a una invitación (aceptar o declinar)
 * @param {number} invitationId - ID de la invitación
 * @param {string} response - ACCEPTED | DECLINED
 * @returns {Promise}
 */
export async function respondToInvitation(invitationId, response) {
  const result = await fetch(`${API_URL}/invitations/${invitationId}/respond`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ response }),
  });
  return parseResponse(result);
}

/**
 * Obtener estadísticas de invitaciones para una oferta
 * @param {number} offerId - ID de la oferta
 * @returns {Promise}
 */
export async function getInvitationStats(offerId) {
  const response = await fetch(
    `${API_URL}/invitations/stats/${offerId}`,
    {
      method: 'GET',
      headers: authHeaders(),
    }
  );
  return parseResponse(response);
}
