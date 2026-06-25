import React from 'react';
import { CheckCircle2, XCircle, Briefcase, MapPin, Clock } from 'lucide-react';
import InvitationResponse from './InvitationResponse';

/**
 * InvitationCard - Mostrar una invitación a postular en el Inbox
 * Componente presentacional que muestra:
 * - Nombre de empresa + oferta
 * - Mensaje personalizado del reclutador
 * - Estado (PENDING, ACCEPTED, DECLINED)
 * - Botones de acción (si está en PENDING)
 */
export default function InvitationCard({ invitation, onRespond, isLoading }) {
  const { offer, message, recruiterMessage, responseStatus, createdAt } = invitation;
  const { title, modality, company } = offer;
  const { legalName: companyName, logoUrl } = company;

  // Mapeo de estados a colores
  const statusConfig = {
    PENDING: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
    ACCEPTED: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800' },
    DECLINED: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[responseStatus] || statusConfig.PENDING;

  // Formato de fecha
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`rounded-lg border-2 ${config.border} ${config.bg} p-4 mb-3`}>
      {/* Header: Empresa + Oferta + Estado */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Logo empresa */}
          {logoUrl && (
            <img
              src={logoUrl}
              alt={companyName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}

          {/* Info empresa + oferta */}
          <div className="flex-1">
            <h3 className="font-bold text-emerald-950">{companyName}</h3>
            <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
              <Briefcase className="w-4 h-4" />
              <span>{title}</span>
            </div>
            {modality && (
              <div className="flex items-center gap-2 text-gray-500 text-xs mt-1">
                <MapPin className="w-4 h-4" />
                <span className="capitalize">{modality}</span>
              </div>
            )}
          </div>
        </div>

        {/* Badge estado */}
        <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${config.badge}`}>
          {responseStatus === 'PENDING' && '⏳ Pendiente'}
          {responseStatus === 'ACCEPTED' && '✅ Aceptada'}
          {responseStatus === 'DECLINED' && '❌ Declinada'}
        </span>
      </div>

      {/* Mensaje personalizado del reclutador */}
      {recruiterMessage && (
        <div className="bg-white rounded p-3 mb-3 border-l-4 border-emerald-950">
          <p className="text-sm text-gray-700 italic">"{recruiterMessage}"</p>
          <p className="text-xs text-gray-500 mt-2">
            <Clock className="w-3 h-3 inline mr-1" />
            {formatDate(createdAt)}
          </p>
        </div>
      )}

      {/* Acciones (solo si PENDING) */}
      {responseStatus === 'PENDING' && (
        <InvitationResponse
          invitationId={invitation.id}
          onRespond={onRespond}
          isLoading={isLoading}
        />
      )}

      {/* Confirmación de respuesta */}
      {responseStatus === 'ACCEPTED' && (
        <div className="bg-green-100 border border-green-300 rounded p-2 text-green-800 text-sm">
          ✅ ¡Ya se creó tu postulación automáticamente!
        </div>
      )}

      {responseStatus === 'DECLINED' && (
        <div className="bg-red-100 border border-red-300 rounded p-2 text-red-800 text-sm">
          ❌ Invitación declinada
        </div>
      )}
    </div>
  );
}
