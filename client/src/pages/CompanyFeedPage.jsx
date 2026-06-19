import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase, Clock, ChevronRight, Rss, Loader2 } from 'lucide-react';
import useSavedCompanyStore from '../store/savedCompanyStore';
import { companyName, formatModality, careerTagsToArray, formatRelativeDate } from '../utils/format';

const OfferCard = ({ offer, onOpen }) => {
  const tags = careerTagsToArray(offer.careerTags).slice(0, 3);
  return (
    <button
      onClick={onOpen}
      className="w-full rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            {offer.company?.logoUrl ? (
              <img src={offer.company.logoUrl} alt={companyName(offer.company)} className="h-8 w-8 rounded-full border border-gray-100 object-cover" />
            ) : (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                <Building2 className="h-4 w-4 text-emerald-600" />
              </div>
            )}
            <span className="text-sm font-medium text-emerald-700">{companyName(offer.company)}</span>
          </div>

          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900">{offer.title}</h3>

          <div className="mb-3 flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{formatModality(offer.modality)}</span>
            {offer.area && <span>{offer.area}</span>}
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatRelativeDate(offer.createdAt)}</span>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag, i) => (
                <span key={i} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 flex-shrink-0 self-center text-gray-300" />
      </div>
    </button>
  );
};

const CompanyFeedPage = () => {
  const navigate = useNavigate();
  const { feedOffers, feedPagination, isLoading, fetchFeed } = useSavedCompanyStore();
  const [page, setPage] = useState(0);
  const LIMIT = 10;

  useEffect(() => {
    fetchFeed({ limit: LIMIT, offset: page * LIMIT });
  }, [fetchFeed, page]);

  const totalPages = Math.ceil((feedPagination?.total || 0) / LIMIT);

  return (
    <main className="min-h-full bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Rss className="h-5 w-5 text-emerald-600" />
              <h1 className="text-xl font-semibold text-gray-900">Feed de empresas seguidas</h1>
            </div>
            <p className="text-sm text-gray-500">Últimas ofertas de las empresas que sigues</p>
          </div>
          <button
            onClick={() => navigate('/followed-companies')}
            className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            <Building2 className="h-4 w-4" />
            Mis empresas
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        ) : feedOffers.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <Rss className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Tu feed está vacío</h3>
            <p className="mx-auto mb-6 max-w-sm text-gray-500">
              Sigue empresas para ver aquí sus últimas ofertas de prácticas.
            </p>
            <button
              onClick={() => navigate('/offers')}
              className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white transition hover:bg-emerald-700"
            >
              Explorar empresas
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">
              {feedPagination?.total ?? feedOffers.length} oferta{(feedPagination?.total ?? feedOffers.length) !== 1 ? 's' : ''} disponibles
            </p>
            <div className="space-y-4">
              {feedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} onOpen={() => navigate(`/offers/${offer.id}`)} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-500">Página {page + 1} de {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default CompanyFeedPage;
