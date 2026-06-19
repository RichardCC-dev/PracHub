import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Building2, MapPin, Clock, Briefcase, DollarSign, Calendar,
  Loader2, AlertCircle, Sparkles, CheckCircle2, Send,
} from 'lucide-react';
import { getOfferById } from '../services/offerApi';
import { useMyApplications, APPLICATIONS_KEYS } from '../hooks/useApplications';
import ApplyModal from '../components/ApplyModal';
import CVAnalyzer from '../components/CVAnalyzer';
import FollowCompanyButton from '../components/FollowCompanyButton';
import {
  formatModality, companyName, careerTagsToArray, formatDate, formatApplicationStatus,
} from '../utils/format';

const MetaChip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
    <Icon className="h-4 w-4 text-gray-500" />
    {children}
  </span>
);

const OfferDetailPage = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const { data: applications = [] } = useMyApplications();
  const application = applications.find((a) => String(a.offerId) === String(offerId));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getOfferById(offerId)
      .then((res) => { if (!cancelled) setOffer(res?.data?.offer || null); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [offerId]);

  const handleApplySuccess = () => {
    queryClient.invalidateQueries({ queryKey: APPLICATIONS_KEYS.mine() });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
          Cargando oferta...
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto mb-3 h-12 w-12 text-red-400" />
        <h2 className="text-lg font-semibold text-gray-900">No se pudo cargar la oferta</h2>
        <p className="mt-1 text-gray-500">{error || 'La oferta no existe o ya no está disponible.'}</p>
        <button
          onClick={() => navigate('/offers')}
          className="mt-5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Volver a prácticas
        </button>
      </div>
    );
  }

  const statusBadge = application ? formatApplicationStatus(application.status) : null;
  const tags = careerTagsToArray(offer.careerTags);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Encabezado */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {offer.company?.logoUrl ? (
            <img src={offer.company.logoUrl} alt={companyName(offer.company)} className="h-16 w-16 rounded-xl object-contain bg-gray-50" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Building2 className="h-7 w-7" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-950">{offer.title}</h1>
            <p className="mt-0.5 font-medium text-emerald-700">{companyName(offer.company)}</p>
            {offer.company?.industry && <p className="text-sm text-gray-500">{offer.company.industry}</p>}
          </div>
          {offer.company?.id && <FollowCompanyButton companyId={offer.company.id} />}
        </div>

        {/* Meta */}
        <div className="mt-5 flex flex-wrap gap-2">
          <MetaChip icon={Briefcase}>{formatModality(offer.modality)}</MetaChip>
          {offer.area && <MetaChip icon={MapPin}>{offer.area}</MetaChip>}
          {offer.duration && <MetaChip icon={Clock}>{offer.duration}</MetaChip>}
          {offer.compensation && <MetaChip icon={DollarSign}>{offer.compensation}</MetaChip>}
          {offer.expiresAt && <MetaChip icon={Calendar}>Postula hasta {formatDate(offer.expiresAt)}</MetaChip>}
        </div>

        {statusBadge && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm text-gray-700">Ya postulaste a esta oferta —</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge.color}`}>{statusBadge.label}</span>
          </div>
        )}
      </div>

      {/* Descripción / requisitos */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {offer.description && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-2 font-bold text-gray-900">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{offer.description}</p>
            </section>
          )}
          {offer.requirements && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-2 font-bold text-gray-900">Requisitos</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{offer.requirements}</p>
            </section>
          )}
          {tags.length > 0 && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-bold text-gray-900">Carreras afines</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((t, i) => (
                  <span key={i} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">{t}</span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Acciones */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <button
              onClick={() => setApplyOpen(true)}
              disabled={!!application}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {application ? 'Ya postulaste' : 'Postular ahora'}
            </button>
            <button
              onClick={() => setAnalysisOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
            >
              <Sparkles className="h-4 w-4" />
              Analizar mi CV para esta oferta
            </button>
            <p className="text-center text-xs text-gray-400">
              Revisa la compatibilidad de tu CV antes de postular.
            </p>
          </div>
        </aside>
      </div>

      {/* Modal de postulación */}
      <ApplyModal
        offerId={offer.id}
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        onSuccess={handleApplySuccess}
      />

      {/* Modal de análisis de CV */}
      {analysisOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-3xl">
            <CVAnalyzer offer={offer} onClose={() => setAnalysisOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetailPage;
