import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useFollowerMetrics, useFollowerGrowth } from '../hooks/useCompanyMetrics';
import MetricsCard from '../components/MetricsCard';
import FollowersDistribution from '../components/FollowersDistribution';
import CompanyMetricsChart from '../components/CompanyMetricsChart';
import LoadingSpinner from '../components/routing/LoadingSpinner';
import { Users, BookOpen, Building2, RefreshCw } from 'lucide-react';

/**
 * Página: Panel de métricas de seguidores para empresas.
 * Muestra:
 * - Total de seguidores
 * - Distribución por carrera
 * - Distribución por universidad
 * - Gráfico de crecimiento en los últimos 30 días
 */
const CompanyMetricsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: metrics, isLoading, error, refetch } = useFollowerMetrics();
  const { data: growthData, isLoading: growthLoading } = useFollowerGrowth();

  // Verificar que el usuario sea empresa
  useEffect(() => {
    if (user && user.role !== 'company') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (isLoading || growthLoading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 border-2 border-red-200 shadow-sm text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Error al cargar métricas</h2>
          <p className="text-sm text-gray-600 mb-4">
            {error?.message || 'No se pudieron obtener los datos. Intenta de nuevo.'}
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 transition"
          >
            <RefreshCw size={16} />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Calcular estadísticas adicionales
  const uniqueUniversities = metrics?.byUniversity?.length || 0;
  const uniqueCareers = metrics?.byCareer?.length || 0;
  const totalFollowers = metrics?.totalFollowers || 0;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Métricas de Seguidores</h1>
          <p className="text-gray-600 mt-2">
            Visualiza cómo crece tu audiencia y de dónde provienen tus seguidores
          </p>
        </div>

        {/* Tarjetas de métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricsCard
            icon={Users}
            title="Total de Seguidores"
            value={totalFollowers}
            accent="emerald"
            subtitle="Estudiantes que te siguen"
          />
          <MetricsCard
            icon={BookOpen}
            title="Carreras Representadas"
            value={uniqueCareers}
            accent="purple"
            subtitle={uniqueCareers === 1 ? '1 carrera' : `${uniqueCareers} carreras diferentes`}
          />
          <MetricsCard
            icon={Building2}
            title="Universidades"
            value={uniqueUniversities}
            accent="blue"
            subtitle={uniqueUniversities === 1 ? '1 universidad' : `${uniqueUniversities} universidades`}
          />
        </div>

        {/* Gráfico de crecimiento */}
        <div className="mb-8">
          <CompanyMetricsChart growth={growthData?.growth} />
        </div>

        {/* Distribución detallada */}
        <div>
          <FollowersDistribution
            byCareer={metrics?.byCareer}
            byUniversity={metrics?.byUniversity}
            totalFollowers={totalFollowers}
          />
        </div>

        {/* Pie de página con información adicional */}
        <div className="mt-12 rounded-2xl bg-white p-6 border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">💡 Insights</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Los datos se actualizan en tiempo real cuando un estudiante te sigue</li>
                <li>✓ Usa esta información para ajustar el perfil de tus prácticas</li>
                <li>✓ Enfócate en carreras y universidades con mayor demanda</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">📊 Próximas mejoras</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Exportar datos como CSV</li>
                <li>✓ Filtros por rango de fechas personalizado</li>
                <li>✓ Alertas de crecimiento de seguidores</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botón de actualización manual */}
        <div className="mt-6 text-center">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:border-emerald-600 hover:text-emerald-600 transition"
          >
            <RefreshCw size={18} />
            Actualizar datos
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyMetricsPage;
