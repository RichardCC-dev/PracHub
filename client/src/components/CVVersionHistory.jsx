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
      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
          <span className="ml-3 text-sm text-gray-500">Cargando historial...</span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Historial de Versiones</p>
          <h2 className="mt-2 text-xl font-bold text-gray-950">Versiones guardadas de tu CV</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Cada vez que exportas tu CV se guarda automáticamente una versión. Puedes restaurar una versión anterior en cualquier momento.
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          {versions.length} {versions.length === 1 ? 'versión' : 'versiones'}
        </span>
      </div>

      {versionsError && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {versionsError}
        </div>
      )}

      {versions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">No hay versiones guardadas</p>
          <p className="mt-1 text-sm text-gray-500">
            Exporta tu CV en PDF para guardar la primera versión.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                index === 0
                  ? 'border-emerald-200 bg-emerald-50/50'
                  : 'border-gray-100 bg-white hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  index === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {formatDate(version.created_at)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatTime(version.created_at)}
                    </span>
                    {index === 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        Más reciente
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {version.completionPercentage ?? 0}% completado
                    </span>
                    {version.template && (
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                        </svg>
                        {getTemplateName(version.template)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openRestoreConfirm(version)}
                  disabled={isRestoring}
                  className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Restaurar
                </button>
                <button
                  onClick={() => deleteVersion(version.id)}
                  disabled={isRestoring || isLoadingVersions}
                  className="rounded-xl border border-gray-200 bg-white p-2 text-gray-400 transition hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Eliminar versión"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
