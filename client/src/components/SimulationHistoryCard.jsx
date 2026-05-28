import React, { useState } from 'react';

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

const SimulationHistoryCard = ({ sim, onView }) => {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = sim.status === 'completed';

  const formattedDate = new Date(sim.createdAt).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

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
          <p className="text-xs text-gray-400">{formattedDate}</p>

          {isCompleted && sim.aiFeedbackSummary && (
            <div className="mt-2">
              <p className={`text-sm text-gray-600 leading-relaxed ${!expanded ? 'line-clamp-2' : ''}`}>
                {sim.aiFeedbackSummary}
              </p>
              {sim.aiFeedbackSummary.length > 120 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-green-700 font-medium mt-1 hover:underline"
                >
                  {expanded ? 'Ver menos' : 'Ver más'}
                </button>
              )}
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
