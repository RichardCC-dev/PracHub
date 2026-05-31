import React from 'react';

const ScoreBadge = ({ score, size = 'md' }) => {
  if (score == null) return <span className="text-gray-400 text-sm">—</span>;
  const color = score >= 75 ? 'text-green-700 bg-green-50 border-green-200'
    : score >= 55 ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
    : 'text-red-700 bg-red-50 border-red-200';
  const sizeCls = size === 'lg' ? 'text-3xl font-bold px-4 py-2' : 'text-sm font-semibold px-2.5 py-0.5';
  return (
    <span className={`rounded-full border ${color} ${sizeCls}`}>{score}%</span>
  );
};

const TrendBar = ({ trend }) => {
  if (!trend || trend.length < 2) return null;
  const max = Math.max(...trend.map(t => t.score ?? 0), 1);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Tendencia de puntuación (últimas sesiones)</h3>
      <div className="flex items-end space-x-2 h-24">
        {trend.map((t, i) => {
          const height = max > 0 ? Math.round(((t.score ?? 0) / max) * 100) : 0;
          const color = (t.score ?? 0) >= 75 ? 'bg-green-500'
            : (t.score ?? 0) >= 55 ? 'bg-yellow-400'
            : 'bg-red-400';
          return (
            <div key={t.id} className="flex flex-col items-center flex-1 group relative">
              <div
                className={`w-full rounded-t-sm ${color} transition-all duration-300`}
                style={{ height: `${height}%`, minHeight: '4px' }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {t.score}% · {t.role}
              </div>
              <span className="text-xs text-gray-400 mt-1">{i + 1}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-1 text-center">Sesión más reciente →</p>
    </div>
  );
};

const SimulationProgressStats = ({ stats }) => {
  if (!stats) return null;

  const { totalSessions, completedSessions, averageScore, highestScore, lowestScore, trend, roleBreakdown, bestRole, worstRole } = stats;

  if (completedSessions === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="text-4xl mb-3">📈</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Sin datos de progreso aún</h3>
        <p className="text-sm text-gray-500">
          Completa tu primera simulación para ver tus estadísticas aquí.
          {totalSessions > 0 && ` Tienes ${totalSessions} sesión${totalSessions > 1 ? 'es' : ''} en progreso.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs superiores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Sesiones totales</p>
          <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
          <p className="text-xs text-gray-400 mt-1">{completedSessions} completadas</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Promedio general</p>
          <ScoreBadge score={averageScore} size="lg" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mayor puntuación</p>
          <p className="text-3xl font-bold text-green-700">{highestScore ?? '—'}%</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Menor puntuación</p>
          <p className="text-3xl font-bold text-orange-500">{lowestScore ?? '—'}%</p>
        </div>
      </div>

      {/* Gráfico de tendencia */}
      {trend && trend.length >= 2 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <TrendBar trend={trend} />
        </div>
      )}

      {/* Mejor y peor rol */}
      {(bestRole || worstRole) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bestRole && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">🏆</div>
              <div className="min-w-0">
                <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">Mejor categoría</p>
                <p className="text-base font-bold text-green-900 truncate mt-0.5">{bestRole.role}</p>
                <p className="text-sm text-green-700 mt-1">Promedio: <span className="font-bold">{bestRole.averageScore}%</span> · {bestRole.sessions} sesión{bestRole.sessions > 1 ? 'es' : ''}</p>
              </div>
            </div>
          )}
          {worstRole && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">📌</div>
              <div className="min-w-0">
                <p className="text-xs text-orange-700 font-semibold uppercase tracking-wide">A mejorar</p>
                <p className="text-base font-bold text-orange-900 truncate mt-0.5">{worstRole.role}</p>
                <p className="text-sm text-orange-700 mt-1">Promedio: <span className="font-bold">{worstRole.averageScore}%</span> · {worstRole.sessions} sesión{worstRole.sessions > 1 ? 'es' : ''}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desglose por rol */}
      {roleBreakdown && roleBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Desglose por rol simulado</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {roleBreakdown.map((r) => {
              const pct = r.averageScore ?? 0;
              const barColor = pct >= 75 ? 'bg-green-500' : pct >= 55 ? 'bg-yellow-400' : 'bg-red-400';
              return (
                <div key={r.role} className="px-6 py-3 flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.role}</p>
                    <p className="text-xs text-gray-400">{r.sessions} sesión{r.sessions > 1 ? 'es' : ''}</p>
                  </div>
                  <div className="w-32 flex items-center space-x-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className={`${barColor} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationProgressStats;
