const HomePage = ({ onLogin, onRegister }) => (
  <main className="min-h-screen bg-gray-50">
    <section className="grid min-h-screen lg:grid-cols-[1fr_1fr]">

      {/* Panel izquierdo — branding */}
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
            Conecta tu talento con prácticas profesionales reales.
          </h1>
          <p className="mt-5 max-w-md text-lg text-emerald-50/75">
            Construye tu CV con IA, practica entrevistas y postula a las mejores empresas desde una sola plataforma.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: 'Empresas', value: '200+' },
              { label: 'Estudiantes', value: '5 000+' },
              { label: 'Prácticas activas', value: '1 200+' },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center backdrop-blur">
                <p className="text-2xl font-bold text-emerald-300">{value}</p>
                <p className="mt-1 text-xs text-emerald-100/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
        
      </aside>

      {/* Panel derecho — CTAs */}
      <div className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-md space-y-6">

          <div className="text-center">
            <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-950 text-3xl font-black text-white">
              P
            </div>
            <h2 className="text-3xl font-bold text-gray-950">Bienvenido a PracHub</h2>
            <p className="mt-2 text-gray-500">¿Eres nuevo o ya tienes una cuenta?</p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl shadow-emerald-950/10 space-y-4">

            <button
              onClick={onLogin}
              className="w-full rounded-2xl bg-emerald-800 px-5 py-4 text-base font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              Iniciar sesión
            </button>

            <button
              onClick={onRegister}
              className="w-full rounded-2xl border-2 border-emerald-800 px-5 py-4 text-base font-semibold text-emerald-900 transition hover:bg-emerald-50 active:scale-[0.98]"
            >
              Crear cuenta
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-1 border-t border-gray-200" />
              <span className="mx-4 text-xs text-gray-400">próximamente</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <button
              disabled
              className="w-full cursor-not-allowed rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm font-medium text-gray-400"
            >
              Continuar con Google
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            Al registrarte aceptas los Términos de uso y la Política de privacidad de PracHub.
          </p>
        </div>
      </div>

    </section>
  </main>
);

export default HomePage;
