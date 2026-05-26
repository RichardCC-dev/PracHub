import useAuthStore from '../store/authStore';

const WelcomePage = ({ onLogout, onGoToCVBuilder }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    onLogout();
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
              ¡Bienvenido a PracHub, {user?.studentProfile?.firstName || 'estudiante'}!
            </h1>
            <p className="mt-5 max-w-md text-lg text-emerald-50/75">
              Tu cuenta está activa. Ahora puedes explorar prácticas, mejorar tu CV y entrenar entrevistas con IA.
            </p>
          </div>

        </aside>

        {/* Panel derecho: contenido */}
        <div className="flex items-center justify-center px-6 py-14">
          <div className="w-full max-w-md space-y-6">
            <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10 space-y-4">
              <h2 className="text-2xl font-bold text-gray-950">Tu panel</h2>
              <p className="text-sm text-gray-600">
                Correo: <span className="font-medium text-gray-900">{user?.email}</span>
              </p>
              <p className="text-sm text-gray-600">
                Rol: <span className="font-medium text-gray-900">{user?.role}</span>
              </p>
              <p className="text-sm text-gray-600">
                Verificado: <span className="font-medium text-gray-900">{user?.isEmailVerified ? 'Sí' : 'No'}</span>
              </p>

              <div className="pt-4 space-y-3">
                <button
                  onClick={onGoToCVBuilder}
                  className="w-full rounded-2xl bg-emerald-800 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700"
                >
                  Constructor de CV con IA
                </button>
                <button
                  className="w-full rounded-2xl border border-emerald-800 px-5 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-50"
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
