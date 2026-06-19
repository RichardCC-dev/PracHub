import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Filter, Building2, Briefcase, Loader2, Sparkles, ChevronRight, X,
} from 'lucide-react';
import { usePublicOffers } from '../hooks/useOffers';
import { useRecommendations } from '../hooks/useRecommendations';
import { useMyApplications } from '../hooks/useApplications';
import {
  MODALITY_OPTIONS, formatModality, companyName, formatApplicationStatus, formatRelativeDate,
} from '../utils/format';

// Tarjeta de oferta recomendada — SOLO información básica (sin requisitos/funciones).
const RecommendedCard = ({ offer, matchScore, onOpen }) => (
  <button
    onClick={onOpen}
    className="flex w-full flex-col gap-2 rounded-xl border border-violet-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
  >
    <div className="flex items-center justify-between gap-2">
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
        <Sparkles className="h-3 w-3" /> {Number.isFinite(matchScore) ? `${matchScore}% match` : 'Recomendada'}
      </span>
      <ChevronRight className="h-4 w-4 text-gray-300" />
    </div>
    <h3 className="line-clamp-2 font-semibold text-gray-900">{offer.title}</h3>
    <div className="flex items-center gap-2 text-sm text-emerald-700">
      <Building2 className="h-4 w-4" />
      {companyName(offer.company)}
    </div>
    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
      <Briefcase className="h-3 w-3" /> {formatModality(offer.modality)}
    </span>
  </button>
);

const OfferCard = ({ offer, status, onOpen }) => {
  const badge = status ? formatApplicationStatus(status) : null;
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-start gap-4 rounded-xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      {offer.company?.logoUrl ? (
        <img src={offer.company.logoUrl} alt={companyName(offer.company)} className="h-12 w-12 rounded-lg object-contain bg-gray-50" />
      ) : (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <Building2 className="h-6 w-6" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900">{offer.title}</h3>
          {badge && <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge.color}`}>{badge.label}</span>}
        </div>
        <p className="text-sm font-medium text-emerald-700">{companyName(offer.company)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5"><Briefcase className="h-3 w-3" />{formatModality(offer.modality)}</span>
          {offer.area && <span className="rounded-full bg-gray-100 px-2 py-0.5">{offer.area}</span>}
          <span>{formatRelativeDate(offer.createdAt)}</span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 flex-shrink-0 self-center text-gray-300" />
    </button>
  );
};

const StudentOffersPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(location.state?.search || '');
  const [selectedModality, setSelectedModality] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const { data: allOffers = [], isLoading } = usePublicOffers();
  const { data: applications = [] } = useMyApplications();
  const { data: recommendations = [] } = useRecommendations();

  const recommendedIds = useMemo(
    () => new Set(recommendations.map((r) => r.offer?.id).filter(Boolean)),
    [recommendations]
  );

  const areas = useMemo(() => {
    const set = new Set(allOffers.map((o) => o.area).filter(Boolean));
    return Array.from(set).sort();
  }, [allOffers]);

  const statusByOffer = useMemo(() => {
    const map = {};
    applications.forEach((a) => { map[a.offerId] = a.status; });
    return map;
  }, [applications]);

  const hasFilters = searchQuery || selectedModality || selectedArea;

  const filteredOffers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allOffers.filter((offer) => {
      if (offer.status !== 'approved') return false;
      const matchesSearch =
        !q ||
        offer.title?.toLowerCase().includes(q) ||
        companyName(offer.company).toLowerCase().includes(q);
      const matchesModality = !selectedModality || offer.modality === selectedModality;
      const matchesArea = !selectedArea || offer.area === selectedArea;
      return matchesSearch && matchesModality && matchesArea;
    });
  }, [allOffers, searchQuery, selectedModality, selectedArea]);

  // En el listado general no repetimos las recomendadas (salvo que haya filtros activos).
  const listOffers = hasFilters
    ? filteredOffers
    : filteredOffers.filter((o) => !recommendedIds.has(o.id));

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedModality('');
    setSelectedArea('');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 text-gray-600">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" /> Cargando ofertas...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Encabezado */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Bolsa de Prácticas</h1>
          <p className="text-sm text-gray-500">
            {listOffers.length} {listOffers.length === 1 ? 'oferta disponible' : 'ofertas disponibles'}
          </p>
        </div>
        <button
          onClick={() => navigate('/my-applications')}
          className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Mis postulaciones
        </button>
      </div>

      {/* Filtros avanzados */}
      <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border py-2 pl-10 pr-4 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="rounded-lg border px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">Todas las modalidades</option>
              {MODALITY_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="rounded-lg border px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">Todas las áreas</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100">
                <X className="h-4 w-4" /> Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recomendadas (IA matching) — solo info básica */}
      {recommendations.length > 0 && !hasFilters && (
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-lg bg-violet-100 p-2"><Sparkles className="h-5 w-5 text-violet-600" /></span>
            <h2 className="text-xl font-bold text-gray-900">Recomendadas para ti</h2>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">IA Matching</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.slice(0, 6).map((rec) => (
              <RecommendedCard
                key={rec.offer?.id}
                offer={rec.offer}
                matchScore={rec.matchScore}
                onOpen={() => navigate(`/offers/${rec.offer.id}`)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Listado general */}
      {listOffers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Briefcase className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p className="font-medium text-gray-700">No hay ofertas que coincidan</p>
          <p className="text-sm text-gray-400">Prueba ajustando los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {listOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              status={statusByOffer[offer.id]}
              onOpen={() => navigate(`/offers/${offer.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentOffersPage;
