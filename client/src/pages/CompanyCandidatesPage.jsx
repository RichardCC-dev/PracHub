import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, ChevronRight, Loader2, Briefcase } from 'lucide-react';
import { getMyOffers } from '../services/offerApi';
import { getOfferApplications } from '../services/applicationApi';
import useAuthStore from '../store/authStore';

const STATUS_BADGE = {
  approved: { label: 'Aprobada', bg: 'bg-green-100', text: 'text-green-800' },
  closed:   { label: 'Cerrada',  bg: 'bg-gray-100',  text: 'text-gray-600'  },
};

const APP_STATUS_COLORS = {
  enviada:   'bg-blue-100 text-blue-700',
  revision:  'bg-yellow-100 text-yellow-700',
  aceptada:  'bg-green-100 text-green-700',
  descartada:'bg-red-100 text-red-700',
};

const APP_STATUS_LABELS = {
  enviada:   'Enviada',
  revision:  'En revisión',
  aceptada:  'Aceptada',
  descartada:'Descartada',
};

const CompanyCandidatesPage = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [offers, setOffers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const offersData = await getMyOffers(token);
      const eligible = (offersData.offers || []).filter(
        (o) => o.status === 'approved' || o.status === 'closed'
      );
      setOffers(eligible);

      // Cargar stats de postulantes en paralelo
      const statsMap = {};
      await Promise.all(
        eligible.map(async (offer) => {
          try {
            const data = await getOfferApplications(offer.id);
            const apps = data.data || [];
            const counts = { total: apps.length, enviada: 0, revision: 0, aceptada: 0, descartada: 0 };
            apps.forEach((a) => { if (counts[a.status] !== undefined) counts[a.status]++; });
            statsMap[offer.id] = counts;
          } catch {
            statsMap[offer.id] = { total: 0, enviada: 0, revision: 0, aceptada: 0, descartada: 0 };
          }
        })
      );
      setStats(statsMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-gray-600">Cargando ofertas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Gestión de candidatos</h1>
            <p className="text-sm text-gray-500">{offers.length} oferta{offers.length !== 1 ? 's' : ''} con postulaciones activas</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
            <button onClick={loadData} className="ml-2 underline">Reintentar</button>
          </div>
        )}

        {offers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay ofertas aprobadas</h3>
            <p className="text-gray-500 mb-6">
              Necesitas tener al menos una oferta aprobada para ver candidatos.
            </p>
            <button
              onClick={() => navigate('/company/offers')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Ver mis ofertas
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => {
              const s = stats[offer.id] || { total: 0, enviada: 0, revision: 0, aceptada: 0, descartada: 0 };
              const badge = STATUS_BADGE[offer.status];

              return (
                <div
                  key={offer.id}
                  onClick={() => navigate(`/company/offers/${offer.id}/candidates`)}
                  className="bg-white rounded-xl shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-blue-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{offer.title}</h3>
                        {badge && (
                          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{offer.area} · {offer.modality}</p>

                      {/* Stats de postulantes */}
                      <div className="flex flex-wrap gap-2">
                        <span className="flex items-center gap-1 text-sm font-medium text-gray-700">
                          <Users className="w-4 h-4" />
                          {s.total} postulante{s.total !== 1 ? 's' : ''}
                        </span>
                        {Object.entries(APP_STATUS_LABELS).map(([key, label]) =>
                          s[key] > 0 ? (
                            <span key={key} className={`text-xs px-2 py-0.5 rounded-full ${APP_STATUS_COLORS[key]}`}>
                              {s[key]} {label}
                            </span>
                          ) : null
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 self-center" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyCandidatesPage;
