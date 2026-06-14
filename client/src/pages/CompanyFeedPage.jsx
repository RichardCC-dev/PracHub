import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Briefcase, MapPin, Clock, ChevronRight, Rss } from 'lucide-react';
import useSavedCompanyStore from '../store/savedCompanyStore';
import ApplyModal from '../components/ApplyModal';

const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
};

const OfferCard = ({ offer, onApply }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        {/* Empresa */}
        <div className="flex items-center gap-2 mb-1">
          {offer.company?.logoUrl ? (
            <img
              src={offer.company.logoUrl}
              alt={offer.company.legalName}
              className="w-8 h-8 rounded-full object-cover border border-gray-100"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
          )}
          <span className="text-sm font-medium text-emerald-700">
            {offer.company?.tradeName || offer.company?.legalName}
          </span>
        </div>

        {/* Título de la oferta */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
          {offer.title}
        </h3>

        {/* Metadatos */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
          {offer.modality && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              {offer.modality}
            </span>
          )}
          {offer.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {offer.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDate(offer.createdAt)}
          </span>
        </div>

        {/* Descripción truncada */}
        {offer.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{offer.description}</p>
        )}

        {/* Tags de carrera */}
        {offer.careerTags && (
          <div className="flex flex-wrap gap-1">
            {(Array.isArray(offer.careerTags)
              ? offer.careerTags
              : String(offer.careerTags).split(',')
            )
              .slice(0, 3)
              .map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {String(tag).trim()}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Acción */}
      <div className="flex-shrink-0">
        <button
          onClick={() => onApply(offer)}
          className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Postular
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const CompanyFeedPage = () => {
  const navigate = useNavigate();
  const { feedOffers, feedPagination, isLoading, fetchFeed } = useSavedCompanyStore();
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [page, setPage] = useState(0);

  const LIMIT = 10;

  useEffect(() => {
    fetchFeed({ limit: LIMIT, offset: page * LIMIT });
  }, [fetchFeed, page]);

  const totalPages = Math.ceil((feedPagination?.total || 0) / LIMIT);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Volver al inicio"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Rss className="w-5 h-5 text-emerald-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Feed de empresas seguidas
                </h1>
              </div>
              <p className="text-sm text-gray-500">
                Últimas ofertas de las empresas que sigues
              </p>
            </div>
            <button
              onClick={() => navigate('/followed-companies')}
              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <Building2 className="w-4 h-4" />
              Mis empresas
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
              <p className="text-sm text-gray-500">Cargando feed...</p>
            </div>
          </div>
        ) : feedOffers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Rss className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Tu feed está vacío
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Sigue empresas para ver aquí sus últimas ofertas de prácticas en tiempo real.
            </p>
            <button
              onClick={() => navigate('/offers')}
              className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Explorar empresas
            </button>
          </div>
        ) : (
          <>
            {/* Contador */}
            <p className="text-sm text-gray-500 mb-4">
              {feedPagination?.total ?? feedOffers.length} oferta
              {(feedPagination?.total ?? feedOffers.length) !== 1 ? 's' : ''} disponibles
            </p>

            {/* Lista de ofertas */}
            <div className="space-y-4">
              {feedOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onApply={setSelectedOffer}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-500">
                  Página {page + 1} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de postulación */}
      {selectedOffer && (
        <ApplyModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onSuccess={() => setSelectedOffer(null)}
        />
      )}
    </main>
  );
};

export default CompanyFeedPage;
