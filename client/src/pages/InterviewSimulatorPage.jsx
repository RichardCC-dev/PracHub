import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, Sparkles, Clock, Target, TrendingUp, ArrowRight, RotateCcw, BarChart3, Building2, GraduationCap, Briefcase } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useSimulationStore from '../store/simulationStore';
import SimulationChat from '../components/SimulationChat';
import { getAllOffers } from '../services/offerApi';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { token, user } = useAuthStore();
  const {
    startNewSimulation,
    currentSimulation,
    clearCurrentSimulation,
    fetchSimulationDetails,
    isLoading,
    error: storeError
  } = useSimulationStore();

  const [view, setView] = useState('setup');
  const [localError, setLocalError] = useState(null);
  const [companies, setCompanies] = useState([]);

  // Carrera del perfil del estudiante (auto-llenado)
  const studentCareer = user?.studentProfile?.career || '';

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      career: studentCareer,
    },
  });

  // ── Cargar empresas desde ofertas públicas ──
  useEffect(() => {
    getAllOffers()
      .then((data) => {
        // La API devuelve { success, data: { offers: [...] } }
        const offers = data?.data?.offers || data?.offers || data?.data || [];
        const companyMap = new Map();
        offers.forEach((offer) => {
          if (offer.company && !companyMap.has(offer.company.id)) {
            companyMap.set(offer.company.id, {
              id: offer.company.id,
              name: offer.company.tradeName || offer.company.legalName,
            });
          }
        });
        setCompanies(Array.from(companyMap.values()).sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => { /* silencioso */ });
  }, []);

  // ── Cargar simulación desde historial (Continuar / Ver resultados) ──
  useEffect(() => {
    const state = location.state;
    if (state?.fromHistory && state?.simulationId) {
      setView('chat');
      setLocalError(null);
      fetchSimulationDetails(state.simulationId, token).catch((err) => {
        setLocalError(err.message || 'Error al cargar la simulación.');
        setView('setup');
      });
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, fetchSimulationDetails, token]);

  useEffect(() => {
    if (currentSimulation && view === 'setup') {
      setView('chat');
    }
  }, [currentSimulation, view]);

  const onStartSubmit = async (data) => {
    setLocalError(null);
    try {
      await startNewSimulation(
        data.simulatedRole,
        token,
        data.career || null,
        data.sector || null,
        data.companyId || null,
      );
      setView('chat');
    } catch (error) {
      console.error('Error starting simulation:', error);
      setLocalError(error.message || 'Error al iniciar simulación.');
    }
  };

  const handleEndSimulation = () => {
    navigate('/simulator/history');
  };

  const handleBackToSetup = () => {
    clearCurrentSimulation();
    setLocalError(null);
    setView('setup');
  };

  // Empresas filtradas para el selector
  const companyOptions = useMemo(() => companies, [companies]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Simulador de Entrevistas</h1>
            <p className="text-sm text-gray-500">Practica con un entrevistador de IA antes de tu entrevista real</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToSetup}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'setup' ? 'bg-emerald-100 text-emerald-800' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <RotateCcw className="w-4 h-4" />
            Nueva
          </button>
          <button
            onClick={() => navigate('/simulator/history')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
          >
            <BarChart3 className="w-4 h-4" />
            Mi progreso
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
        <div className="space-y-6">
          {/* Hero */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">Entrevista simulada con IA</h2>
                <p className="text-emerald-50 text-sm leading-relaxed mb-4">
                  Conversemos como en una entrevista real. El entrevistador de IA adaptará las preguntas
                  a tu perfil y al final recibirás una puntuación con retroalimentación detallada por cada respuesta.
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4" />
                    ~10-15 min
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                    <Target className="w-4 h-4" />
                    Mínimo 3 min para score
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
                    <TrendingUp className="w-4 h-4" />
                    Análisis por pregunta
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Configura tu simulación</h3>
            <p className="text-gray-500 text-sm mb-6">
              Personaliza la entrevista para que se ajuste a tu perfil y objetivos.
            </p>

            <form onSubmit={handleSubmit(onStartSubmit)} className="space-y-5">
              {/* Rol — input de texto */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  ¿A qué puesto postulas? <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. Desarrollador Frontend, Analista de Datos, Practicante de Marketing..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-shadow"
                  {...register("simulatedRole", { required: "Indica el puesto para continuar" })}
                  disabled={isLoading}
                />
                {errors.simulatedRole && (
                  <p className="mt-1 text-xs text-red-600">{errors.simulatedRole.message}</p>
                )}
              </div>

              {/* Empresa — selector */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  ¿A qué empresa postulas? <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white transition-shadow"
                  {...register("companyId", { required: "Selecciona una empresa para continuar" })}
                  disabled={isLoading || companyOptions.length === 0}
                >
                  <option value="">— Selecciona una empresa —</option>
                  {companyOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {companyOptions.length === 0 && (
                  <p className="mt-1 text-xs text-gray-400">Cargando empresas disponibles...</p>
                )}
                {errors.companyId && (
                  <p className="mt-1 text-xs text-red-600">{errors.companyId.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  La IA adaptará su estilo y preguntas según la empresa seleccionada.
                </p>
              </div>

              {/* Carrera — auto-llenada, editable */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  Tu carrera <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Tu carrera universitaria"
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-emerald-50/30 transition-shadow"
                  {...register("career", { required: "Indica tu carrera para continuar" })}
                  disabled={isLoading}
                />
                {studentCareer && (
                  <p className="mt-1 text-xs text-emerald-600">
                    Detectada desde tu perfil: {studentCareer}
                  </p>
                )}
                {errors.career && (
                  <p className="mt-1 text-xs text-red-600">{errors.career.message}</p>
                )}
              </div>

              {/* Sector — selector */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  Sector de empresa <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white transition-shadow"
                  {...register("sector", { required: "Selecciona un sector para continuar" })}
                  disabled={isLoading}
                >
                  <option value="">— Selecciona un sector —</option>
                  {COMPANY_SECTORS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.sector && (
                  <p className="mt-1 text-xs text-red-600">{errors.sector.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-700 text-white py-3.5 px-4 rounded-full font-bold hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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
                  <>
                    Comenzar entrevista
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View: Chat */}
      {view === 'chat' && currentSimulation && (
        <SimulationChat
          simulationId={currentSimulation.id}
          onEndSimulation={handleEndSimulation}
        />
      )}

      {/* View: Chat pero cargando desde historial */}
      {view === 'chat' && !currentSimulation && (
        <div className="flex flex-col items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-emerald-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-500 mt-3">Cargando simulación...</p>
        </div>
      )}

    </div>
  );
};

export default InterviewSimulatorPage;
