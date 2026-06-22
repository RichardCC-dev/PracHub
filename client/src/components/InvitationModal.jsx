import React, { useState, useMemo } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import { useOffers } from '../hooks/useOffers';
import { useSendInvitation } from '../hooks/useInvitations';

/**
 * InvitationModal - Modal para que reclutador envíe invitación a postular
 * Funcionalidad:
 * - Selector de oferta activa
 * - Campo de mensaje personalizado (max 300 chars)
 * - Validaciones
 * - Envío y feedback
 */
export default function InvitationModal({ studentId, isOpen, onClose, onSuccess }) {
  const [selectedOfferId, setSelectedOfferId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { data: offersData, isLoading: offersLoading } = useOffers();
  const { mutate: sendInvitation, isPending } = useSendInvitation();

  // Filtrar solo ofertas activas del reclutador actual
  const offers = useMemo(() => {
    if (!offersData?.data?.offers) return [];
    return offersData.data.offers.filter(offer => offer.status === 'active');
  }, [offersData]);

  const handleSendInvitation = () => {
    // Validaciones
    setError('');

    if (!selectedOfferId) {
      setError('Por favor selecciona una oferta');
      return;
    }

    if (!message.trim()) {
      setError('Por favor escribe un mensaje');
      return;
    }

    if (message.length > 300) {
      setError('El mensaje no puede superar 300 caracteres');
      return;
    }

    // Enviar
    sendInvitation(
      { studentId, offerId: selectedOfferId, recruiterMessage: message.trim() },
      {
        onSuccess: () => {
          // Reset y cerrar
          setSelectedOfferId(null);
          setMessage('');
          setError('');
          onClose();
          if (onSuccess) onSuccess();
        },
        onError: (err) => {
          setError(err.message || 'Error enviando invitación');
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-emerald-950">Invitar a Postular</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Selector de Oferta */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Selecciona una oferta
            </label>
            <select
              value={selectedOfferId || ''}
              onChange={(e) => setSelectedOfferId(parseInt(e.target.value))}
              disabled={offersLoading || offers.length === 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 disabled:opacity-50"
            >
              <option value="">-- Selecciona --</option>
              {offers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.title} ({offer.modality})
                </option>
              ))}
            </select>
            {offers.length === 0 && !offersLoading && (
              <p className="text-xs text-red-600 mt-1">
                No hay ofertas activas disponibles
              </p>
            )}
          </div>

          {/* Mensaje Personalizado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mensaje personalizado (máximo 300 caracteres)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.substring(0, 300))}
              placeholder="Ej: 'Te vemos como un gran fit para nuestro equipo, ¡nos encantaría que postularas!'"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-600 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/300 caracteres
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Nota de info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              ℹ️ El candidato recibirá una notificación con tu mensaje y podrá aceptar o declinar directamente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSendInvitation}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isPending ? 'Enviando...' : 'Enviar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
