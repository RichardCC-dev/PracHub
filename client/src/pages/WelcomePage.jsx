import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, FileText, Bot, BarChart3, Building2, Bell,
  MessageSquare, Sparkles, ChevronRight, FileCheck2, Users, ClipboardList,
  CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useMessageStore from '../store/messageStore';
import useSavedCompanyStore from '../store/savedCompanyStore';
import { useMyApplications } from '../hooks/useApplications';
import { useRecommendations } from '../hooks/useRecommendations';
import { usePublicOffers, useMyOffers } from '../hooks/useOffers';
import { getResume } from '../services/api';
import { getOfferApplications } from '../services/applicationApi';
import StatCard from '../components/ui/StatCard';
import { companyName, formatModality } from '../utils/format';

// ─────────────────────────────────────────────────────────────────────────────
// Estudiante
// ─────────────────────────────────────────────────────────────────────────────
const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('empleos');
  const [search, setSearch] = useState('');
  const [cvCompletion, setCvCompletion] = useState(null);

  const unreadMessages = useMessageStore((s) => s.unreadCount);
  const { followedCompanies, followedCount, fetchFollowedCompanies, fetchFollowedCount } = useSavedCompanyStore();
  const { data: applications = [] } = useMyApplications();
  const { data: recommendations = [] } = useRecommendations();
  const { data: offers = [] } = usePublicOffers();

  const s = user?.studentProfile || {};
  const firstName = s.firstName || 'Estudiante';

  useEffect(() => {
    fetchFollowedCount();
    fetchFollowedCompanies().catch(() => {});
    getResume().then((r) => setCvCompletion(r?.completionPercentage ?? 0)).catch(() => setCvCompletion(0));
  }, [fetchFollowedCount, fetchFollowedCompanies]);

  const goSearch = (e) => {
    e.preventDefault();
    navigate('/offers', { state: { search } });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr_260px]">
        {/* Columna izquierda: perfil + CV */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
              {firstName.charAt(0)}
            </div>
            <h2 className="mt-3 font-bold text-gray-900">{firstName} {s.lastName || ''}</h2>
            <p className="text-sm text-gray-500">{s.career || 'Busco mi primera práctica'}</p>
            <button
              onClick={() => navigate('/cv-builder')}
              className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Ir a mi CV
            </button>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Estado de mi CV</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">{cvCompletion ?? '—'}%</span>
              <span className="mb-1 text-xs text-gray-500">completo</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${cvCompletion || 0}%` }} />
            </div>
          </div>
        </aside>

        {/* Columna central: buscador + recomendadas/empresas */}
        <section className="space-y-6">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-700 p-6 text-white shadow-sm">
            <p className="text-sm text-emerald-200">¡Hola, {firstName}!</p>
            <h1 className="text-xl font-bold sm:text-2xl">
              ¿Qué práctica buscas? Hay {offers.length} esperándote
            </h1>
            <form onSubmit={goSearch} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Puesto, empresa o palabra clave"
                  className="w-full rounded-xl border-0 py-2.5 pl-10 pr-4 text-gray-800 focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <button type="submit" className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-emerald-800 hover:bg-emerald-50">
                Buscar
              </button>
            </form>
          </div>

          {/* Tabs */}
          <div>
            <div className="mb-4 flex gap-6 border-b border-gray-200">
              <button
                onClick={() => setTab('empleos')}
                className={`-mb-px border-b-2 px-1 py-2 text-sm font-semibold ${tab === 'empleos' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Empleos recomendados
              </button>
              <button
                onClick={() => setTab('empresas')}
                className={`-mb-px border-b-2 px-1 py-2 text-sm font-semibold ${tab === 'empresas' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                Empresas que sigo
              </button>
            </div>

            {tab === 'empleos' ? (
              <div className="space-y-3">
                {recommendations.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                    <Sparkles className="mx-auto mb-2 h-10 w-10 text-violet-300" />
                    <p className="text-sm text-gray-600">Completa tu CV para recibir recomendaciones con IA.</p>
                    <button onClick={() => navigate('/offers')} className="mt-3 text-sm font-semibold text-emerald-700 hover:underline">
                      Explorar prácticas →
                    </button>
                  </div>
                ) : (
                  <>
                    {recommendations.slice(0, 5).map((rec) => (
                      <button
                        key={rec.offer?.id}
                        onClick={() => navigate(`/offers/${rec.offer.id}`)}
                        className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            {Number.isFinite(rec.matchScore) && (
                              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">{rec.matchScore}% match</span>
                            )}
                          </div>
                          <p className="truncate font-semibold text-gray-900">{rec.offer?.title}</p>
                          <p className="truncate text-sm text-emerald-700">{companyName(rec.offer?.company)}</p>
                          <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{formatModality(rec.offer?.modality)}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                      </button>
                    ))}
                    <button onClick={() => navigate('/offers')} className="text-sm font-semibold text-emerald-700 hover:underline">
                      Ver todas las prácticas →
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {followedCompanies.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                    <Building2 className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                    <p className="text-sm text-gray-600">Aún no sigues empresas.</p>
                    <button onClick={() => navigate('/offers')} className="mt-3 text-sm font-semibold text-emerald-700 hover:underline">
                      Descubrir empresas →
                    </button>
                  </div>
                ) : (
                  <>
                    {followedCompanies.slice(0, 6).map((item) => (
                      <div key={item.id || item.company?.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-gray-900">{companyName(item.company)}</p>
                          <p className="truncate text-xs text-gray-500">{item.company?.industry}</p>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => navigate('/company-feed')} className="text-sm font-semibold text-emerald-700 hover:underline">
                      Ver feed de empresas →
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Accesos rápidos */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: FileText, label: 'Mi CV', to: '/cv-builder' },
              { icon: Bot, label: 'Simulador', to: '/simulator' },
              { icon: BarChart3, label: 'Mi progreso', to: '/simulator/history' },
              { icon: Bell, label: 'Alertas', to: '/alert-settings' },
            ].map((q) => (
              <button key={q.label} onClick={() => navigate(q.to)} className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 text-center text-sm font-medium text-gray-700 shadow-sm transition hover:shadow-md">
                <q.icon className="h-6 w-6 text-emerald-600" />
                {q.label}
              </button>
            ))}
          </div>
        </section>

        {/* Columna derecha: Mi actividad */}
        <aside className="space-y-3">
          <h3 className="px-1 text-sm font-bold text-gray-900">Mi actividad</h3>
          <StatCard icon={FileCheck2} label="Postulaciones" value={applications.length} accent="blue" onClick={() => navigate('/my-applications')} />
          <StatCard icon={MessageSquare} label="Mensajes sin leer" value={unreadMessages} accent="emerald" onClick={() => navigate('/inbox')} />
          <StatCard icon={Building2} label="Empresas que sigo" value={followedCount} accent="violet" onClick={() => navigate('/followed-companies')} />
          <StatCard icon={Sparkles} label="Recomendadas" value={recommendations.length} accent="amber" onClick={() => navigate('/offers')} />
        </aside>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Empresa
// ─────────────────────────────────────────────────────────────────────────────
const CompanyDashboard = ({ user }) => {
  const navigate = useNavigate();
  const c = user?.companyProfile || {};
  const { data: offers = [] } = useMyOffers();
  const [applicationsTotal, setApplicationsTotal] = useState(null);
  const unreadMessages = useMessageStore((s) => s.unreadCount);

  const approved = offers.filter((o) => o.status === 'approved').length;
  const pending = offers.filter((o) => o.status === 'pending').length;

  useEffect(() => {
    let cancelled = false;
    const eligible = offers.filter((o) => o.status === 'approved' || o.status === 'closed');
    if (eligible.length === 0) { setApplicationsTotal(0); return undefined; }
    Promise.all(eligible.map((o) => getOfferApplications(o.id).then((d) => (d.data || d.applications || []).length).catch(() => 0)))
      .then((counts) => { if (!cancelled) setApplicationsTotal(counts.reduce((a, b) => a + b, 0)); });
    return () => { cancelled = true; };
  }, [offers]);

  const verified = c.verificationStatus === 'verified' || c.isVerified;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Datos de la empresa */}
      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        {c.logoUrl ? (
          <img src={c.logoUrl} alt={companyName(c)} className="h-16 w-16 rounded-xl object-contain bg-gray-50" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Building2 className="h-7 w-7" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-950">{companyName(c)}</h1>
          <p className="text-sm text-gray-500">{c.industry || 'Empresa'}{c.city ? ` · ${c.city}` : ''}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {verified ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          {verified ? 'Verificada' : 'Pendiente de verificación'}
        </span>
      </div>

      {/* Métricas generales */}
      <h3 className="mb-3 text-sm font-bold text-gray-900">Métricas generales</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={ClipboardList} label="Ofertas publicadas" value={offers.length} accent="emerald" onClick={() => navigate('/company/offers')} />
        <StatCard icon={CheckCircle2} label="Ofertas activas" value={approved} accent="blue" />
        <StatCard icon={Clock} label="En revisión" value={pending} accent="amber" />
        <StatCard icon={Users} label="Postulaciones" value={applicationsTotal ?? '…'} accent="violet" onClick={() => navigate('/company/offers')} />
      </div>

      {!c.canPublishOffers && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <p className="text-sm text-amber-700">
            Tu empresa debe completar la verificación legal para poder publicar ofertas.
          </p>
        </div>
      )}

      {/* Accesos rápidos */}
      <h3 className="mb-3 mt-8 text-sm font-bold text-gray-900">Accesos rápidos</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button onClick={() => navigate('/company/offers')} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:shadow-md">
          <ClipboardList className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="font-bold text-gray-900">Ofertas y candidatos</p>
            <p className="text-sm text-gray-500">Publica ofertas y revisa a tus postulantes.</p>
          </div>
        </button>
        <button onClick={() => navigate('/inbox')} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:shadow-md">
          <MessageSquare className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="font-bold text-gray-900">Mensajes {unreadMessages > 0 && <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{unreadMessages}</span>}</p>
            <p className="text-sm text-gray-500">Contacta a los candidatos de tus ofertas.</p>
          </div>
        </button>
        <button onClick={() => navigate('/company/profile')} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:shadow-md">
          <Building2 className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="font-bold text-gray-900">Perfil de empresa</p>
            <p className="text-sm text-gray-500">Edita tu información, logo y cultura.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

const WelcomePage = () => {
  const { user } = useAuthStore();
  if (user?.role === 'company') return <CompanyDashboard user={user} />;
  return <StudentDashboard user={user} />;
};

export default WelcomePage;
