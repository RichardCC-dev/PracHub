import useAuthStore from '../store/authStore';

const WelcomePage = ({ onLogout }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const isCompany = user?.role === 'company';
  const companyProfile = user?.companyProfile;
  const studentProfile = user?.studentProfile;

  const getWelcomeTitle = () => {
    if (isCompany && companyProfile) {
      return `¡Bienvenido a PracHub, ${companyProfile.legalName}!`;
    }
    return `¡Bienvenido a PracHub, ${studentProfile?.firstName || 'estudiante'}!`;
  };

  const getWelcomeSubtitle = () => {
    if (isCompany && companyProfile) {
      if (companyProfile.verificationStatus === 'pending') {
        return 'Tu empresa está pendiente de verificación legal. Puedes preparar ofertas pero no publicarlas hasta que completes la verificación.';
      }
      if (companyProfile.verificationStatus === 'verified') {
        return 'Tu empresa está verificada. Ya puedes publicar ofertas de prácticas y gestionar candidatos.';
      }
      return 'Tu cuenta está activa. Completa el perfil de tu empresa para comenzar a publicar ofertas.';
    }
    return 'Tu cuenta está activa. Ahora puedes explorar prácticas, mejorar tu CV y entrenar entrevistas con IA.';
  };

  const getVerificationStatusBadge = () => {
    if (!isCompany || !companyProfile) return null;

    const statusConfig = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pendiente de verificación legal' },
      verified: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Verificado legalmente' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rechazado' },
    };

    const config = statusConfig[companyProfile.verificationStatus] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
        {/* Panel izquierdo: branding */}
        <aside className="flex flex-col justify-between bg-emerald-950 p-10 text-white lg:p-16">
          <div>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-emerald-950">
              P
            </div>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
              PracHub
            </p>
          </div>

          <div>
            <h1 className="text-4xl font-bold leading-tight lg:text-5xl">
              {getWelcomeTitle()}
            </h1>
            <p className="mt-5 max-w-md text-lg text-emerald-50/75">
              {getWelcomeSubtitle()}
            </p>
          </div>

        </aside>

        {/* Panel derecho: contenido */}
        <div className="flex items-center justify-center px-6 py-14">
          <div className="w-full max-w-md space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-950">Tu panel</h2>
                {getVerificationStatusBadge()}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Correo: <span className="font-medium text-gray-900">{user?.email}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Rol: <span className="font-medium text-gray-900">{isCompany ? 'Empresa' : 'Estudiante'}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Correo verificado: <span className="font-medium text-gray-900">{user?.isEmailVerified ? 'Sí' : 'No'}</span>
                </p>

                {isCompany && companyProfile && (
                  <>
                    <p className="text-sm text-gray-600">
                      RUC: <span className="font-medium text-gray-900">{companyProfile.taxId}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Sector: <span className="font-medium text-gray-900">{companyProfile.industry}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Responsable: <span className="font-medium text-gray-900">{companyProfile.responsibleName}</span>
                    </p>
                    {companyProfile.canPublishOffers && (
                      <p className="text-sm text-emerald-600 font-medium">
                        ✅ Puedes publicar ofertas
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="pt-4 space-y-3">
                {isCompany ? (
                  <>
                    <button
                      className="w-full rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:bg-gray-400"
                      disabled={!companyProfile?.canPublishOffers}
                      title={!companyProfile?.canPublishOffers ? 'Pendiente de verificación legal de empresa' : ''}
                    >
                      {companyProfile?.canPublishOffers ? 'Publicar oferta' : 'Publicar oferta (verificación legal pendiente)'}
                    </button>
                    <button
                      className="w-full rounded-2xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50"
                      disabled
                    >
                      Ver candidatos (próximamente)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="w-full rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
                      disabled
                    >
                      Ver prácticas (próximamente)
                    </button>
                    <button
                      className="w-full rounded-2xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50"
                      disabled
                    >
                      Mi perfil (próximamente)
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full rounded-2xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cerrar sesión
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              PracHub © 2026 — Versión beta.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default WelcomePage;
