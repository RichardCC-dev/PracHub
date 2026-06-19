import { useState } from 'react';
import { Save, History, Sparkles, Trash2, Loader2, X } from 'lucide-react';
import CVWizard from '../components/CVWizard';
import CVExportPanel from '../components/CVExportPanel';
import CVVersionHistory from '../components/CVVersionHistory';
import CVAnalysisHistoryPanel from '../components/CVAnalysisHistoryPanel';
import useCVStore from '../store/cvStore';

const SaveIndicator = () => {
  const { isSaving, lastSaved } = useCVStore();
  const formatTime = (date) => (date ? date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : null);

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Guardando borrador...</span>
      </div>
    );
  }
  if (lastSaved) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-emerald-700">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span>Borrador guardado {formatTime(lastSaved)}</span>
      </div>
    );
  }
  return null;
};

const CVBuilderPage = () => {
  const { clearResume, isSaving, isSavingVersion, saveNamedVersion, selectedTemplate } = useCVStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showAnalysisHistory, setShowAnalysisHistory] = useState(false);
  const [versionTitle, setVersionTitle] = useState('');
  const [saveOk, setSaveOk] = useState(false);

  const handleClear = async () => {
    setShowClearConfirm(false);
    await clearResume();
  };

  const handleSaveVersion = async () => {
    const ok = await saveNamedVersion(versionTitle.trim() || `Versión ${new Date().toLocaleDateString('es-PE')}`, selectedTemplate);
    if (ok) {
      setShowSaveModal(false);
      setVersionTitle('');
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2500);
    }
  };

  return (
    <main className="min-h-full bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Constructor de CV</h1>
            </div>
            <SaveIndicator />
            <button
              onClick={() => setShowAnalysisHistory(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              <History className="h-3.5 w-3.5" />
              Historial de análisis
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600"
            >
              <Save className="h-3.5 w-3.5" />
              Guardar versión
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpiar CV
            </button>
          </div>
          {saveOk && (
            <p className="mt-2 text-xs font-medium text-emerald-700">✓ Versión guardada en tu historial.</p>
          )}
        </div>
      </header>

      <div className="px-4 py-5 xl:px-8">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-950">Construye tu CV con IA</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Completa cada sección, obtén sugerencias en tiempo real y guarda versiones con un título.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2 mb-5">
          <CVExportPanel />
          <CVVersionHistory />
        </div>
        <CVWizard />
      </div>

      {/* Modal: guardar versión con título */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="h-5 w-5 text-emerald-700" />
                <h3 className="font-bold text-gray-950">Guardar versión del CV</h3>
              </div>
              <button onClick={() => setShowSaveModal(false)} className="rounded p-1 hover:bg-gray-100">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Título de la versión</label>
            <input
              autoFocus
              value={versionTitle}
              onChange={(e) => setVersionTitle(e.target.value)}
              maxLength={120}
              placeholder="Ej. CV para prácticas de datos"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <p className="mt-1 text-xs text-gray-400">Se guardará una copia de tu CV actual en el historial de versiones.</p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={isSavingVersion}
                className="flex-1 rounded-xl bg-emerald-700 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
              >
                {isSavingVersion ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: limpiar CV */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-950">Limpiar todo el CV</h3>
                <p className="text-xs text-gray-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="mb-5 text-sm text-gray-600">
              Se borrarán todos los datos del CV. Guarda una versión antes si deseas conservarla.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleClear} className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Sí, limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel emergente: historial de análisis */}
      <CVAnalysisHistoryPanel open={showAnalysisHistory} onClose={() => setShowAnalysisHistory(false)} />
    </main>
  );
};

export default CVBuilderPage;
