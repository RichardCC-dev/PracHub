import { useState } from 'react';
import CVWizard from '../components/CVWizard';
import CVExportPanel from '../components/CVExportPanel';
import CVVersionHistory from '../components/CVVersionHistory';
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

const CVBuilderPage = ({ onBack }) => {
  const { clearResume, isSaving } = useCVStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClear = async () => {
    setShowClearConfirm(false);
    await clearResume();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950 text-sm font-black text-white">P</div>
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-widest">PracHub</span>
          </div>
          <div className="flex items-center gap-3">
            <SaveIndicator />
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpiar CV
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                ← Volver al panel
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-5 xl:px-8">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-950">Construye tu CV con IA</h1>
            <p className="mt-0.5 text-sm text-gray-500">Completa cada sección y obtén sugerencias inteligentes en tiempo real.</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 mb-5">
          <CVExportPanel />
          <CVVersionHistory />
        </div>
        <CVWizard />
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-950">Limpiar todo el CV</h3>
                <p className="text-xs text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Se borrarán todos los datos del CV. Asegúrate de haber exportado una versión si deseas conservarla.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleClear}
                className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Sí, limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CVBuilderPage;
