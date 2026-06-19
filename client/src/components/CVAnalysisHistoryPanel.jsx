import { useEffect } from 'react';
import { X, History, Loader2, ChevronLeft, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import useCVAnalysisStore from '../store/cvAnalysisStore';

const OBS_STYLE = {
  strength: { icon: CheckCircle, color: 'text-green-600' },
  improvement: { icon: AlertCircle, color: 'text-amber-600' },
  error: { icon: XCircle, color: 'text-red-600' },
};

/**
 * Panel emergente con el Historial de Análisis de CV.
 * Permite ver análisis previos (y sus sugerencias por sección) mientras se
 * edita el CV, para aplicar cambios en tiempo real.
 */
const CVAnalysisHistoryPanel = ({ open, onClose }) => {
  const {
    analysisHistory,
    currentAnalysis,
    isLoadingHistory,
    isLoadingDetails,
    fetchAnalysisHistory,
    fetchAnalysisDetails,
    clearCurrentAnalysis,
  } = useCVAnalysisStore();

  useEffect(() => {
    if (open) fetchAnalysisHistory();
  }, [open, fetchAnalysisHistory]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="absolute inset-0 bg-black/40" aria-label="Cerrar" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-700" />
            <h2 className="font-bold text-gray-900">Historial de Análisis de CV</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {currentAnalysis ? (
            // Detalle del análisis seleccionado
            <div className="space-y-4">
              <button
                onClick={clearCurrentAnalysis}
                className="flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
              >
                <ChevronLeft className="h-4 w-4" /> Volver al historial
              </button>

              <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${currentAnalysis.scoreCategory?.bg} ${currentAnalysis.scoreCategory?.text}`}>
                  {currentAnalysis.overallScore}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{currentAnalysis.scoreCategory?.label}</p>
                  <p className="text-xs text-gray-500">
                    {currentAnalysis.offer ? `Para: ${currentAnalysis.offer.title}` : 'Análisis'}
                  </p>
                </div>
              </div>

              {isLoadingDetails ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-emerald-600" /></div>
              ) : (
                <>
                  {Array.isArray(currentAnalysis.observations) && currentAnalysis.observations.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-bold text-gray-900">Sugerencias por sección</h3>
                      <div className="space-y-2">
                        {currentAnalysis.observations.map((obs, i) => {
                          const st = OBS_STYLE[obs.type] || OBS_STYLE.improvement;
                          const Icon = st.icon;
                          return (
                            <div key={i} className="rounded-lg border border-gray-100 p-3">
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${st.color}`} />
                                <span className="text-sm font-semibold text-gray-800">{obs.section || 'General'}</span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">{obs.message}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {Array.isArray(currentAnalysis.recommendations) && currentAnalysis.recommendations.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-bold text-gray-900">Recomendaciones</h3>
                      <ul className="space-y-1">
                        {currentAnalysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-2 text-sm text-gray-700">
                            <span className="text-emerald-500">•</span>
                            {typeof rec === 'string' ? rec : (rec.message || rec.title || '')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : isLoadingHistory ? (
            <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin text-emerald-600" /></div>
          ) : analysisHistory.length === 0 ? (
            <div className="py-10 text-center">
              <History className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-600">Aún no tienes análisis de CV.</p>
              <p className="mt-1 text-xs text-gray-400">Analiza tu CV desde el detalle de una oferta.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="mb-2 text-xs text-gray-500">Toca un análisis para ver sus sugerencias y aplicarlas a tu CV.</p>
              {analysisHistory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => fetchAnalysisDetails(item.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${item.scoreCategory?.bg} ${item.scoreCategory?.text}`}>
                    {item.overallScore}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.offer ? `Para: ${item.offer.title}` : 'Análisis de CV'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVAnalysisHistoryPanel;
