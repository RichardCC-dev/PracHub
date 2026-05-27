import { useEffect } from 'react';
import useCVStore from '../store/cvStore';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTemplateName = (templateId) => {
  const templates = {
    harvard: 'Harvard',
    'investment-banking': 'Investment Banking',
  };
  return templates[templateId] || templateId || 'Plantilla desconocida';
};

const CVVersionHistory = () => {
  const {
    versions,
    isLoadingVersions,
    versionsError,
    isRestoring,
    showRestoreConfirm,
    versionToRestore,
    fetchVersions,
    openRestoreConfirm,
    closeRestoreConfirm,
    restoreVersion,
    deleteVersion,
  } = useCVStore();

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleRestore = async () => {
    if (versionToRestore) {
      await restoreVersion(versionToRestore.id);
    }
  };

  if (isLoadingVersions && versions.length === 0) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
          <span className="ml-2 text-xs text-gray-500">Cargando historial...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Historial</p>
          <h2 className="mt-0.5 text-base font-bold text-gray-950">Versiones guardadas</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          {versions.length} {versions.length === 1 ? 'versión' : 'versiones'}
        </span>
      </div>

      {versionsError && (
        <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {versionsError}
        </div>
      )}

      {versions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 py-6 text-center">
          <p className="text-sm font-medium text-gray-700">Sin versiones aún</p>
          <p className="mt-0.5 text-xs text-gray-400">Exporta tu CV para guardar la primera.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className={`flex items-center justify-between rounded-xl border px-3 py-2 transition ${
                index === 0
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : 'border-gray-100 bg-white hover:border-emerald-100'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-gray-900">{formatDate(version.created_at)}</span>
                  <span className="text-xs text-gray-400">{formatTime(version.created_at)}</span>
                  {index === 0 && (
                    <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">Reciente</span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                  <span>{version.completionPercentage ?? 0}% completo</span>
                  {version.template && <span>· {getTemplateName(version.template)}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  onClick={() => openRestoreConfirm(version)}
                  disabled={isRestoring}
                  className="rounded-lg border border-emerald-200 bg-white px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                >
                  Restaurar
                </button>
                <button
                  onClick={() => deleteVersion(version.id)}
                  disabled={isRestoring || isLoadingVersions}
                  className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-400 transition hover:border-red-200 hover:text-red-500 disabled:opacity-50"
                  title="Eliminar"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRestoreConfirm && versionToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-center text-lg font-bold text-gray-900">
              ¿Restaurar esta versión?
            </h3>
            <p className="mt-2 text-center text-sm text-gray-500">
              Vas a restaurar la versión del{' '}
              <strong className="text-gray-900">
                {formatDate(versionToRestore.created_at)}
              </strong>{' '}
              a las{' '}
              <strong className="text-gray-900">
                {formatTime(versionToRestore.created_at)}
              </strong>.
            </p>
            <p className="mt-1 text-center text-sm text-amber-600">
              Esto sobrescribirá tu CV actual. Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeRestoreConfirm}
                disabled={isRestoring}
                className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestore}
                disabled={isRestoring}
                className="flex-1 rounded-2xl bg-emerald-800 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isRestoring ? 'Restaurando...' : 'Sí, restaurar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CVVersionHistory;
