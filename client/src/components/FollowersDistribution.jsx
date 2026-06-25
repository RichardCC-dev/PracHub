import React from 'react';
import { BookOpen, Building2 } from 'lucide-react';

/**
 * Componente que muestra la distribución de seguidores por carrera e universidad.
 * Incluye barra de progreso visual y porcentaje relativo.
 */
const FollowersDistribution = ({ 
  byCareer = [], 
  byUniversity = [], 
  totalFollowers = 0 
}) => {
  const renderDistributionList = (items, title, Icon) => {
    if (!items || items.length === 0) {
      return (
        <div className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-500">
          Sin datos disponibles
        </div>
      );
    }

    // Ordenar por count descendente y limitar a top 10
    const sorted = [...items].sort((a, b) => b.count - a.count).slice(0, 10);
    const maxCount = sorted[0]?.count || 1;

    return (
      <div className="space-y-3">
        {sorted.map((item, idx) => {
          const percentage = totalFollowers > 0 
            ? Math.round((item.count / totalFollowers) * 100) 
            : 0;
          const barWidth = totalFollowers > 0 
            ? (item.count / maxCount) * 100 
            : 0;

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {item.career || item.university || 'No especificado'}
                </span>
                <span className="text-xs font-semibold text-gray-600">
                  {item.count} ({percentage}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Distribución por Carrera */}
      <section className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-purple-100 p-2">
            <BookOpen size={18} className="text-purple-700" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Por Carrera</h3>
        </div>
        {renderDistributionList(byCareer, 'Carrera', BookOpen)}
      </section>

      {/* Distribución por Universidad */}
      <section className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-blue-100 p-2">
            <Building2 size={18} className="text-blue-700" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Por Universidad</h3>
        </div>
        {renderDistributionList(byUniversity, 'Universidad', Building2)}
      </section>
    </div>
  );
};

export default FollowersDistribution;
