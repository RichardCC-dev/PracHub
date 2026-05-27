import CVWizard from '../components/CVWizard';
import useCVStore from '../store/cvStore';

const SaveIndicator = () => {
  const { isSaving, lastSaved } = useCVStore();

  const formatTime = (date) => {
    if (!date) return null;
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  };

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Guardando...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-emerald-700">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Guardado a las {formatTime(lastSaved)}</span>
      </div>
    );
  }

  return null;
};

const CVBuilderPage = ({ onBack }) => (
  <main className="min-h-screen bg-gray-50">
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 text-base font-black text-white">P</div>
          <span className="text-sm font-bold text-emerald-900 uppercase tracking-widest">PracHub</span>
        </div>
        <div className="flex items-center gap-4">
          <SaveIndicator />
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              ← Volver al panel
            </button>
          )}
        </div>
      </div>
    </header>
    <div className="px-6 py-8 xl:px-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-950">Construye tu CV con IA</h1>
        <p className="mt-1 text-gray-500">Completa cada sección y obtén sugerencias inteligentes en tiempo real.</p>
      </div>
      <CVWizard />
    </div>
  </main>
);

export default CVBuilderPage;
