import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import NotificationBell from '../components/NotificationBell';

const FeatureCard = ({ icon, title, description, badge, onClick, disabled }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={`group relative w-full text-left rounded-3xl border p-6 transition-all duration-200 ${
      disabled
        ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
        : 'border-emerald-100 bg-white shadow-md shadow-emerald-950/5 hover:shadow-xl hover:shadow-emerald-950/10 hover:border-emerald-300 hover:-translate-y-0.5 cursor-pointer'
    }`}
  >
    <div className="flex items-start gap-4">
      <div className={`flex-shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${disabled ? 'bg-gray-100' : 'bg-emerald-50 group-hover:bg-emerald-100 transition-colors'}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-gray-950">{title}</h3>
          {badge && (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              badge === 'Activo' ? 'bg-emerald-100 text-emerald-700' :
              badge === 'Verificado' ? 'bg-emerald-100 text-emerald-700' :
              badge === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
              'bg-gray-100 text-gray-500'
            }`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
      {!disabled && (
        <div className="flex-shrink-0 self-center text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
          →
        </div>
      )}
    </div>
  </button>
);

const WelcomePage = ({ onLogout, onEditProfile, onGoToCVBuilder, onGoToAdmin, onGoToOffers, onGoToStudentOffers }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const isCompany = user?.role === 'company';
  const isStudent = user?.role === 'student';
  const companyProfile = user?.companyProfile;
  const studentProfile = user?.studentProfile;

  const displayName = isCompany
    ? companyProfile?.legalName || 'Empresa'
    : studentProfile?.firstName || 'Estudiante';

  const verificationStatus = companyProfile?.verificationStatus;
  const verificationBadge =
    verificationStatus === 'verified' ? 'Verificado' :
    verificationStatus === 'pending' ? 'Pendiente' : null;

  const studentFeatures = [
    {
      icon: '📄',
      title: 'Construir CV con IA',
      description: 'Crea y mejora tu hoja de vida con sugerencias inteligentes en tiempo real.',
      badge: 'Activo',
      onClick: onGoToCVBuilder,
      disabled: false,
    },
    {
      icon: '🎯',
      title: 'Ver prácticas disponibles',
      description: 'Explora ofertas de prácticas profesionales según tu carrera y disponibilidad.',
      badge: 'Activo',
      onClick: onGoToStudentOffers,
      disabled: false,
    },
    {
      icon: '🤖',
      title: 'Simulación de entrevista con IA',
      description: 'Practica entrevistas técnicas y de recursos humanos con retroalimentación inteligente.',
      badge: 'Próximamente',
      disabled: true,
    },
    {
      icon: '👤',
      title: 'Mi perfil',
      description: 'Actualiza tus datos personales, carrera y disponibilidad.',
      badge: 'Próximamente',
      disabled: true,
    },
  ];

  const companyFeatures = [
    {
      icon: '🏢',
      title: 'Perfil de empresa',
      description: 'Edita la información, logo y cultura de tu empresa.',
      badge: 'Activo',
      onClick: onEditProfile,
      disabled: false,
    },
    {
      icon: '📢',
      title: 'Gestionar mis ofertas',
      description: companyProfile?.canPublishOffers
        ? 'Crea y publica nuevas ofertas de prácticas profesionales.'
        : 'Disponible tras completar la verificación legal de tu empresa.',
      badge: companyProfile?.canPublishOffers ? 'Activo' : 'Pendiente verificación',
      onClick: onGoToOffers,
      disabled: !companyProfile?.canPublishOffers,
    },
    {
      icon: '👥',
      title: 'Ver candidatos',
      description: 'Gestiona y revisa los postulantes a tus ofertas publicadas.',
      badge: 'Activo',
      onClick: () => navigate('/company/candidates'),
      disabled: !companyProfile?.canPublishOffers,
    },
  ];

  const features = isCompany ? companyFeatures : studentFeatures;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 text-base font-black text-white">P</div>
            <span className="text-sm font-bold text-emerald-900 uppercase tracking-widest">PracHub</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-emerald-950 text-white px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-2">
            {isCompany ? 'Panel de empresa' : 'Panel de estudiante'}
          </p>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold lg:text-4xl">¡Bienvenido, {displayName}!</h1>
              <p className="mt-2 text-emerald-100/75 text-lg max-w-xl">
                {isCompany
                  ? 'Gestiona el perfil de tu empresa, publica ofertas y conecta con talento.'
                  : 'Explora prácticas, construye tu CV con IA y entrena tus entrevistas.'}
              </p>
            </div>
            {isCompany && verificationBadge && (
              <span className={`self-start inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
                verificationBadge === 'Verificado' ? 'bg-emerald-800 text-emerald-100' : 'bg-amber-900/60 text-amber-200'
              }`}>
                {verificationBadge === 'Verificado' ? '✓ ' : '⏳ '}{verificationBadge}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-lg font-bold text-gray-950 mb-5">¿Qué quieres hacer hoy?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>

        {/* Info extra empresa */}
        {isCompany && companyProfile && (
          <div className="mt-8 rounded-3xl bg-white border border-gray-100 p-6 shadow-sm">
            <h3 className="font-bold text-gray-950 mb-3">Datos de la empresa</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
              <span>RUC: <span className="font-medium text-gray-900">{companyProfile.taxId}</span></span>
              <span>Sector: <span className="font-medium text-gray-900">{companyProfile.industry}</span></span>
              <span>Responsable: <span className="font-medium text-gray-900">{companyProfile.responsibleName}</span></span>
              <span>Correo: <span className="font-medium text-gray-900">{user?.email}</span></span>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">PracHub © 2026 — Versión beta.</p>
      </div>
    </main>
  );
};

export default WelcomePage;
