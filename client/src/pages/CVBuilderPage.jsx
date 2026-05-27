import CVWizard from '../components/CVWizard';

const CVBuilderPage = () => {
  const handleGoBack = () => {
    // Cambiar la página directamente sin router
    globalThis.location.href = '/welcome';
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Botón de retroceder */}
      <button
        onClick={handleGoBack}
        className="fixed top-4 left-4 z-50 rounded-full bg-white p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        title="Volver al dashboard"
      >
        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>

      <section className="grid min-h-screen lg:grid-cols-[0.4fr_1.6fr]">
        <aside className="hidden bg-emerald-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-black text-emerald-950">P</div>
            <h2 className="mt-10 text-5xl font-bold leading-tight">Construye tu CV con IA.</h2>
            <p className="mt-6 max-w-md text-lg text-emerald-50/80">Llena cada sección y obtén sugerencias inteligentes para destacar como profesional.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-100">Asistente IA</p>
            <p className="mt-3 text-2xl font-semibold">Sugerencias en tiempo real, sin perder lo que ya escribiste.</p>
          </div>
        </aside>

        <div className="flex items-start justify-center px-2 py-6 overflow-y-auto">
          <div className="w-full max-w-7xl">
            <CVWizard />
          </div>
        </div>
      </section>
    </main>
  );
};

export default CVBuilderPage;
