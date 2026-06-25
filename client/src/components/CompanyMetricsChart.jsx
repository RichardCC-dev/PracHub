import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * Componente que muestra el gráfico de crecimiento de seguidores.
 * Utiliza Recharts para la visualización.
 */
const CompanyMetricsChart = ({ growth = [] }) => {
  if (!growth || growth.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="rounded-lg bg-amber-100 p-2">
            <TrendingUp size={18} className="text-amber-700" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Crecimiento (Últimos 30 días)</h3>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p className="text-center">Sin datos disponibles aún</p>
        </div>
      </div>
    );
  }

  // Procesar datos: convertir fecha string a formato más legible
  const chartData = growth.map(item => ({
    date: new Date(item.date).toLocaleDateString('es-PE', { 
      month: 'short', 
      day: 'numeric' 
    }),
    followers: item.dailyFollowers,
  }));

  // Calcular acumulativo
  let cumulative = 0;
  const cumulativeData = chartData.map(item => ({
    ...item,
    cumulative: (cumulative += item.followers),
  }));

  return (
    <div className="rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="rounded-lg bg-amber-100 p-2">
          <TrendingUp size={18} className="text-amber-700" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Crecimiento (Últimos 30 días)</h3>
          <p className="text-xs text-gray-600 mt-1">Nuevos seguidores por día</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={cumulativeData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
            }}
            labelStyle={{ color: '#fff' }}
            formatter={(value) => [value, 'Seguidores']}
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs text-gray-600">Total nuevos</p>
          <p className="text-xl font-bold text-emerald-700">
            {cumulativeData[cumulativeData.length - 1]?.cumulative || 0}
          </p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-gray-600">Promedio/día</p>
          <p className="text-xl font-bold text-blue-700">
            {Math.round(
              (cumulativeData[cumulativeData.length - 1]?.cumulative || 0) / chartData.length
            ) || 0}
          </p>
        </div>
        <div className="rounded-lg bg-purple-50 p-3">
          <p className="text-xs text-gray-600">Días activos</p>
          <p className="text-xl font-bold text-purple-700">
            {chartData.filter(d => d.followers > 0).length}/{chartData.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyMetricsChart;
