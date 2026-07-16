import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Clock } from 'lucide-react';

const ScoreCircle = ({ score }) => {
  if (score == null) return null;
  const color = score >= 75 ? '#15803d' : score >= 55 ? '#d97706' : '#dc2626';
  const bg = score >= 75 ? '#f0fdf4' : score >= 55 ? '#fffbeb' : '#fef2f2';
  return (
    <div
      className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-sm"
      style={{ borderColor: color, backgroundColor: bg }}
    >
      <span className="text-base font-bold" style={{ color }}>{score}%</span>
    </div>
  );
};

const formatDuration = (createdAt, updatedAt) => {
  const start = new Date(createdAt);
  const end = new Date(updatedAt);
  const diffMs = end - start;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return '< 1 min';
  return `${minutes} min`;
};

const countMessages = (chatHistory) => {
  if (!chatHistory) return 0;
  try {
    const arr = Array.isArray(chatHistory) ? chatHistory : JSON.parse(chatHistory || '[]');
    return arr.filter(m => m && m.content && m.content.trim()).length;
  } catch {
    return 0;
  }
};

const SimulationHistoryCard = ({ sim, onView }) => {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = sim.status === 'completed';

  const formattedDate = new Date(sim.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const messageCount = countMessages(sim.chatHistory);
  const duration = formatDuration(sim.createdAt, sim.updatedAt);

  // Parsear feedback completo
  let parsedFeedback = null;
  let summaryText = sim.aiFeedbackSummary;
  if (summaryText && summaryText.startsWith('{')) {
    try {
      const parsed = JSON.parse(summaryText);
      if (parsed.general) {
        summaryText = parsed.general;
        parsedFeedback = parsed;
      }
    } catch {
      // Ignorar, dejamos text original
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-5 flex items-start space-x-4">
        {isCompleted && <ScoreCircle score={sim.overallScore} />}
        {!isCompleted && (
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-yellow-50 border-4 border-yellow-300 flex items-center justify-center">
            <span className="text-yellow-600 text-xl">⏳</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-base font-bold text-gray-900 truncate">{sim.simulatedRole}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isCompleted ? 'Completada' : 'En progreso'}
            </span>
          </div>

          {/* Metadata: fecha, duración, mensajes */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-2">
            <span>{formattedDate}</span>
            {isCompleted && (
              <>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {duration}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {messageCount} mensajes
                </span>
              </>
            )}
          </div>

          {/* Carrera, sector y empresa */}
          {(sim.career || sim.sector || sim.companyName) && (
            <div className="flex flex-wrap gap-2 mb-2">
              {sim.companyName && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                  {sim.companyName}
                </span>
              )}
              {sim.career && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {sim.career}
                </span>
              )}
              {sim.sector && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {sim.sector}
                </span>
              )}
            </div>
          )}

          {/* Resumen (siempre visible si está completado) */}
          {isCompleted && summaryText && (
            <div className="mt-2">
              <p className={`text-sm text-gray-600 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
                {summaryText}
              </p>
              {(summaryText.length > 120 || parsedFeedback?.detailed?.length > 0) && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-xs text-emerald-700 font-medium mt-1.5 hover:underline"
                >
                  {expanded ? (
                    <>Ver menos <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Ver análisis completo <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Análisis detallado desplegable */}
          {expanded && parsedFeedback?.detailed?.length > 0 && (
            <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Desglose por pregunta ({parsedFeedback.detailed.length})
              </h4>
              {parsedFeedback.detailed.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    <span className="text-emerald-700 mr-1">P{idx + 1}:</span>{item.question}
                  </p>
                  <p className="text-sm text-gray-600 mb-2 border-l-2 border-emerald-300 pl-3 italic">
                    {item.answer}
                  </p>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase">Puntuación</span>
                    <span className={`text-sm font-bold ${item.score >= 70 ? 'text-emerald-600' : item.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                      {item.score}/100
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold mr-1">Feedback:</span>{item.feedback}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onView(sim)}
          className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isCompleted ? 'Ver resultados' : 'Continuar'}
        </button>
      </div>
    </div>
  );
};

export default SimulationHistoryCard;
