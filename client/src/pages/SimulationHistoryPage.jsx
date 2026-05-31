import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useSimulationStore from '../store/simulationStore';
import SimulationProgressStats from '../components/SimulationProgressStats';
import SimulationHistoryCard from '../components/SimulationHistoryCard';

const TAB_HISTORY = 'history';
const TAB_PROGRESS = 'progress';

const SimulationHistoryPage = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const {
    simulationsHistory,
    simulationStats,
    currentSimulation,
    fetchHistory,
    fetchStats,
    fetchSimulationDetails,
    isLoading,
    error: storeError,
  } = useSimulationStore();

  const [activeTab, setActiveTab] = useState(TAB_PROGRESS);
  const [localError, setLocalError] = useState(null);
  const [loadedTabs, setLoadedTabs] = useState(new Set());

  useEffect(() => {
    if (!token) return;
    if (activeTab === TAB_PROGRESS && !loadedTabs.has(TAB_PROGRESS)) {
      setLocalError(null);
      fetchStats(token)
        .then(() => setLoadedTabs(prev => new Set(prev).add(TAB_PROGRESS)))
        .catch(err => setLocalError(err.message));
    }
    if (activeTab === TAB_HISTORY && !loadedTabs.has(TAB_HISTORY)) {
      setLocalError(null);
      fetchHistory(token)
        .then(() => setLoadedTabs(prev => new Set(prev).add(TAB_HISTORY)))
        .catch(err => setLocalError(err.message));
    }
  }, [token, activeTab]);

  const handleViewSimulation = (sim) => {
    setLocalError(null);
    fetchSimulationDetails(sim.id, token)
      .then(() =>
        navigate('/simulator', {
          state: {
            fromHistory: true,
            simulationId: sim.id,
            initialView: 'chat',
          },
        })
      )
      .catch(err => setLocalError(err.message || 'Error al cargar la simulación.'));
  };

  const displayError = localError || storeError;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progreso e Historial</h1>
          <p className="text-sm text-gray-500 mt-0.5">Revisa tu evolución entre sesiones de simulación.</p>
        </div>
        <button
          onClick={() => navigate('/simulator')}
          className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors"
        >
          + Nueva simulación
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { key: TAB_PROGRESS, label: 'Mi Progreso' },
          { key: TAB_HISTORY, label: 'Historial de Sesiones' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {displayError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
          <p className="text-sm text-red-700">{displayError}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <svg className="animate-spin h-8 w-8 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {/* Tab: Progreso */}
      {!isLoading && activeTab === TAB_PROGRESS && (
        <SimulationProgressStats stats={simulationStats} />
      )}

      {/* Tab: Historial */}
      {!isLoading && activeTab === TAB_HISTORY && (
        <>
          {!simulationsHistory || simulationsHistory.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Aún no tienes simulaciones</h3>
              <p className="text-sm text-gray-500 mb-4">Comienza tu primera práctica para registrar tu progreso.</p>
              <button
                onClick={() => navigate('/simulator')}
                className="text-green-700 font-semibold hover:underline text-sm"
              >
                Iniciar una ahora →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {simulationsHistory.map(sim => (
                <SimulationHistoryCard
                  key={sim.id}
                  sim={sim}
                  onView={handleViewSimulation}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SimulationHistoryPage;
