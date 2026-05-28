import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { getMyOffers, closeOffer } from '../services/offerApi';

const STATUS_CONFIG = {
  pending:  { label: 'Pendiente de revisión', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  approved: { label: 'Aprobada',              bg: 'bg-green-100',  text: 'text-green-800'  },
  rejected: { label: 'Rechazada',             bg: 'bg-red-100',    text: 'text-red-800'    },
  closed:   { label: 'Cerrada',               bg: 'bg-gray-100',   text: 'text-gray-600'   },
};

const CompanyOffersPage = ({ onBack, onCreateOffer, onEditOffer }) => {
  const { token } = useAuthStore();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closingId, setClosingId] = useState(null);

  useEffect(() => {
    if (token) {
      loadOffers();
    }
  }, [token]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyOffers(token);
      setOffers(data.offers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async (offerId) => {
    if (!confirm('¿Estás seguro de cerrar esta oferta? No se podrán recibir más postulaciones.')) return;

    try {
      setClosingId(offerId);
      await closeOffer(token, offerId);
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'closed' } : o));
    } catch (err) {
      alert('Error al cerrar oferta: ' + err.message);
    } finally {
      setClosingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando ofertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-800 transition">
              ← Volver
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mis ofertas</h1>
              <p className="text-sm text-gray-500">{offers.length} oferta{offers.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={onCreateOffer}
            className="px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition"
          >
            + Nueva oferta
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm mb-4">
            {error}
            <button onClick={loadOffers} className="ml-2 underline">Reintentar</button>
          </div>
        )}

        {offers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes ofertas publicadas</h3>
            <p className="text-gray-500 mb-6">Crea tu primera oferta de práctica para empezar a recibir postulaciones.</p>
            <button
              onClick={onCreateOffer}
              className="px-6 py-3 bg-emerald-700 text-white font-semibold rounded-xl hover:bg-emerald-600 transition"
            >
              Crear oferta
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map(offer => {
              const statusCfg = STATUS_CONFIG[offer.status] || STATUS_CONFIG.pending;
              const canEdit = offer.status === 'pending' || offer.status === 'rejected';
              const canClose = offer.status !== 'closed';

              return (
                <div key={offer.id} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{offer.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {offer.modality === 'remote' ? 'Remoto' : offer.modality === 'hybrid' ? 'Híbrido' : 'Presencial'}
                        </span>
                        {offer.area && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{offer.area}</span>
                        )}
                        {offer.duration && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{offer.duration}</span>
                        )}
                        {offer.compensation && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{offer.compensation}</span>
                        )}
                      </div>

                      {offer.status === 'rejected' && offer.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                          <p className="text-xs font-medium text-red-700">Motivo de rechazo:</p>
                          <p className="text-xs text-red-600 mt-0.5">{offer.rejection_reason}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400">
                        Creada: {formatDate(offer.created_at)}
                        {offer.expires_at && ` · Vence: ${formatDate(offer.expires_at)}`}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {canEdit && (
                        <button
                          onClick={() => onEditOffer(offer)}
                          className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          Editar
                        </button>
                      )}
                      {canClose && (
                        <button
                          onClick={() => handleClose(offer.id)}
                          disabled={closingId === offer.id}
                          className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition"
                        >
                          {closingId === offer.id ? 'Cerrando...' : 'Cerrar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default CompanyOffersPage;
