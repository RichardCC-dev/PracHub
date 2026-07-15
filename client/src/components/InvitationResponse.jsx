import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { useRespondToInvitation } from '../hooks/useInvitations';

/**
 * InvitationResponse - Botones para aceptar/declinar invitación
 * Se usa en InvitationCard cuando responseStatus === PENDING
 */
export default function InvitationResponse({ invitationId, onRespond }) {
  const [isResponding, setIsResponding] = useState(null); // 'ACCEPTED' | 'DECLINED' | null
  const { mutate: respondToInvitation, isPending } = useRespondToInvitation();

  const handleRespond = (response) => {
    setIsResponding(response);
    respondToInvitation(
      { invitationId, response },
      {
        onSuccess: () => {
          setIsResponding(null);
          if (onRespond) onRespond(invitationId, response);
        },
        onError: () => {
          setIsResponding(null);
        },
      }
    );
  };

  const isLoading = isPending || isResponding !== null;

  return (
    <div className="flex gap-2 pt-2 border-t border-gray-300">
      {/* Botón Aceptar */}
      <button
        onClick={() => handleRespond('ACCEPTED')}
        disabled={isLoading}
        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Check className="w-4 h-4" />
        <span>{isResponding === 'ACCEPTED' ? 'Aceptando...' : 'Aceptar'}</span>
      </button>

      {/* Botón Declinar */}
      <button
        onClick={() => handleRespond('DECLINED')}
        disabled={isLoading}
        className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <X className="w-4 h-4" />
        <span>{isResponding === 'DECLINED' ? 'Declinando...' : 'Declinar'}</span>
      </button>
    </div>
  );
}
