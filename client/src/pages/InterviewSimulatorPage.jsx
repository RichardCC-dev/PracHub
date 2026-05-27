import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import useSimulationStore from '../store/simulationStore';
import SimulationChat from '../components/SimulationChat';

const COMPANY_SECTORS = [
  'Tecnología y Software',
  'Banca y Finanzas',
  'Consultoría',
  'Marketing y Publicidad',
  'Salud y Farmacéutica',
  'Retail y Comercio',
  'Logística y Supply Chain',
  'Telecomunicaciones',
  'Educación',
  'Manufactura e Industria',
  'Gobierno y Sector Público',
  'Medios y Entretenimiento',
  'Legal',
  'Recursos Humanos',
];

const InterviewSimulatorPage = () => {
  const { token } = useAuthStore();
  const { 
    startNewSimulation, 
    fetchHistory,
    fetchSimulationDetails,
    simulationsHistory, 
    currentSimulation,
    clearCurrentSimulation,
    isLoading,
    error: storeError
  } = useSimulationStore();

  const [view, setView] = useState('setup');
  const [localError, setLocalError] = useState(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (token && view === 'history') {
      setLocalError(null);
      fetchHistory(token).catch(err => setLocalError(err.message));
    }
  }, [token, view]);

  const onStartSubmit = async (data) => {
    setLocalError(null);
    try {
      await startNewSimulation(data.simulatedRole, token, data.career || null, data.sector || null);
      setView('chat');
    } catch (error) {
      console.error('Error starting simulation:', error);
      setLocalError(error.message || 'Error al iniciar simulación.');
    }
  };

  const handleEndSimulation = () => {};

  const handleBackToSetup = () => {
    clearCurrentSimulation();
    setLocalError(null);
    setView('setup');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Navigation */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Simulador de Entrevistas con IA</h1>
        <div className="space-x-4">
          <button 
            onClick={handleBackToSetup}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'setup' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Nueva Simulación
          </button>
          <button 
            onClick={() => setView('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'history' ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Mi Historial
          </button>
        </div>
      </div>

      {(localError || storeError) && view !== 'chat' && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
          <p className="text-sm text-red-700">{localError || storeError}</p>
        </div>
      )}

      {/* View: Setup */}
      {view === 'setup' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🎯
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Configura tu simulación</h2>
            <p className="text-gray-500 text-sm">
              Cuéntanos a qué estás postulando para que el entrevistador adapte las preguntas a tu perfil.
            </p>
          </div>

          <form onSubmit={handleSubmit(onStartSubmit)} className="space-y-5">
            {/* Rol */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ¿A qué puesto o rol estás postulando? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Desarrollador Frontend, Analista de Datos, Asistente de Marketing..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                {...register("simulatedRole", { required: "Indica el rol para continuar" })}
                disabled={isLoading}
              />
              {errors.simulatedRole && (
                <p className="mt-1 text-xs text-red-600">{errors.simulatedRole.message}</p>
              )}
            </div>

            {/* Carrera */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ¿Qué carrera estudias? <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Ingeniería de Sistemas, Administración de Empresas, Comunicaciones..."
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                {...register("career")}
                disabled={isLoading}
              />
            </div>

            {/* Sector de empresa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                ¿En qué sector de empresa quieres trabajar? <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white"
                {...register("sector")}
                disabled={isLoading}
              >
                <option value="">— Selecciona un sector —</option>
                {COMPANY_SECTORS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="bg-amber-50 p-4 rounded-md border border-amber-100 flex items-start space-x-3">
              <span className="text-amber-500 text-xl flex-shrink-0">⏱️</span>
              <p className="text-sm text-amber-800">
                <strong>Mínimo 5 minutos de conversación</strong> para recibir tu puntuación y retroalimentación.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-700 text-white py-3 px-4 rounded-md font-bold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Preparando entrevistador...
                </>
              ) : (
                'Comenzar entrevista'
              )}
            </button>
          </form>
        </div>
      )}

      {/* View: Chat */}
      {view === 'chat' && currentSimulation && (
        <SimulationChat 
          simulationId={currentSimulation.id} 
          onEndSimulation={handleEndSimulation} 
        />
      )}

      {/* View: History */}
      {view === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Historial de Prácticas</h2>
            <p className="text-sm text-gray-500 mt-1">Revisa tu progreso y la retroalimentación de sesiones anteriores.</p>
          </div>
          
          {isLoading && !simulationsHistory?.length ? (
            <div className="p-8 text-center text-gray-500">Cargando historial...</div>
          ) : !simulationsHistory || simulationsHistory.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Aún no tienes simulaciones</h3>
              <p className="text-gray-500 mb-4">Empieza tu primera práctica para ver tu progreso aquí.</p>
              <button 
                onClick={handleBackToSetup}
                className="text-green-700 font-semibold hover:underline"
              >
                Iniciar una ahora →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {simulationsHistory.map((sim) => (
                <div key={sim.id} className="p-6 hover:bg-gray-50 transition-colors flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{sim.simulatedRole}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(sim.createdAt).toLocaleDateString('es-ES', { 
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                    <div className="mt-2 flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sim.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sim.status === 'completed' ? 'Completado' : 'En progreso'}
                      </span>
                      {sim.status === 'completed' && sim.overallScore != null && (
                        <span className="text-sm font-medium text-gray-700">
                          Puntuación: <span className={sim.overallScore >= 70 ? 'text-green-600' : 'text-orange-500'}>{sim.overallScore}%</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <button 
                      onClick={() => {
                        setLocalError(null);
                        fetchSimulationDetails(sim.id, token)
                          .then(() => setView('chat'))
                          .catch((err) => setLocalError(err.message || 'Error al cargar detalles.'));
                      }}
                      disabled={isLoading}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {sim.status === 'completed' ? 'Ver Resultados' : 'Continuar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterviewSimulatorPage;
