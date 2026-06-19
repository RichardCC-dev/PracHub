import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Loader2, Briefcase, ChevronRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getMyOffers, closeOffer } from '../services/offerApi';
import { getOfferApplications } from '../services/applicationApi';
import { formatModality, formatDate, APPLICATION_STATUS } from '../utils/format';

const STATUS_CONFIG = {
  pending:  { label: 'Pendiente de revisión', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  approved: { label: 'Aprobada',              bg: 'bg-green-100',  text: 'text-green-800'  },
  rejected: { label: 'Rechazada',             bg: 'bg-red-100',    text: 'text-red-800'    },
  closed:   { label: 'Cerrada',               bg: 'bg-gray-100',   text: 'text-gray-600'   },
};

const CompanyOffersPage = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [offers, setOffers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closingId, setClosingId] = useState(null);

  const loadOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyOffers(token);
      const list = data.offers || [];
      setOffers(list);

      // Cargar conteo de postulantes por oferta (aprobadas/cerradas)
      const eligible = list.filter((o) => o.status === 'approved' || o.status === 'closed');
      const statsMap = {};
      await Promise.all(
        eligible.map(async (offer) => {
          try {
            const res = await getOfferApplications(offer.id);
            const apps = res.data || res.applications || [];
            const counts = { total: apps.length, enviada: 0, revision: 0, aceptada: 0, descartada: 0 };
            apps.forEach((a) => { if (counts[a.status] !== undefined) counts[a.status]++; });
            statsMap[offer.id] = counts;
          } catch {
            statsMap[offer.id] = { total: 0 };
          }
        })
      );
      setStats(statsMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) loadOffers(); }, [token, loadOffers]);

  const handleClose = async (offerId) => {
    if (!confirm('¿Cerrar esta oferta? No se podrán recibir más postulaciones.')) return;
    try {
      setClosingId(offerId);
      await closeOffer(token, offerId);
      setOffers((prev) => prev.map((o) => (o.id === offerId ? { ...o, status: 'closed' } : o)));
    } catch (err) {
      alert('Error al cerrar oferta: ' + err.message);
    } finally {
      setClosingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-600">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" /> Cargando ofertas...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ofertas y candidatos</h1>
          <p className="text-sm text-gray-500">{offers.length} oferta{offers.length !== 1 ? 's' : ''} · gestiona publicaciones y postulantes</p>
        </div>
        <button
          onClick={() => navigate('/company/offers/new')}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" /> Nueva oferta
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error} <button onClick={loadOffers} className="ml-2 underline">Reintentar</button>
        </div>
      )}

      {offers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Briefcase className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">No tienes ofertas publicadas</h3>
          <p className="mb-6 text-gray-500">Crea tu primera oferta para empezar a recibir postulaciones.</p>
          <button onClick={() => navigate('/company/offers/new')} className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white hover:bg-emerald-600">
            Crear oferta
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const cfg = STATUS_CONFIG[offer.status] || STATUS_CONFIG.pending;
            const canEdit = offer.status === 'pending' || offer.status === 'rejected';
            const canClose = offer.status !== 'closed';
            const hasCandidates = offer.status === 'approved' || offer.status === 'closed';
            const s = stats[offer.id] || { total: 0 };

            return (
              <div key={offer.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">{formatModality(offer.modality)}</span>
                      {offer.area && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{offer.area}</span>}
                      {offer.duration && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{offer.duration}</span>}
                      {offer.compensation && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">{offer.compensation}</span>}
                    </div>

                    {offer.status === 'rejected' && offer.rejection_reason && (
                      <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                        <p className="text-xs font-medium text-red-700">Motivo de rechazo:</p>
                        <p className="mt-0.5 text-xs text-red-600">{offer.rejection_reason}</p>
                      </div>
                    )}

                    {/* Resumen de candidatos (unificado) */}
                    {hasCandidates && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                          <Users className="h-4 w-4" /> {s.total || 0} postulante{(s.total || 0) !== 1 ? 's' : ''}
                        </span>
                        {Object.entries(APPLICATION_STATUS).map(([key, cfgA]) =>
                          s[key] > 0 ? (
                            <span key={key} className={`rounded-full px-2 py-0.5 text-xs ${cfgA.color}`}>{s[key]} {cfgA.label}</span>
                          ) : null
                        )}
                      </div>
                    )}

                    <p className="mt-3 text-xs text-gray-400">
                      Creada: {formatDate(offer.created_at)}{offer.expires_at && ` · Vence: ${formatDate(offer.expires_at)}`}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {hasCandidates && (
                      <button
                        onClick={() => navigate(`/company/offers/${offer.id}/candidates`)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition hover:bg-blue-700"
                      >
                        <Users className="h-4 w-4" /> Ver candidatos <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => navigate('/company/offers/edit', { state: { offer } })}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
                      >
                        Editar
                      </button>
                    )}
                    {canClose && (
                      <button
                        onClick={() => handleClose(offer.id)}
                        disabled={closingId === offer.id}
                        className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
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
    </div>
  );
};

export default CompanyOffersPage;
