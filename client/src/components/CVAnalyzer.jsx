import { useEffect, useState } from 'react';
import {
  Sparkles,
  Target,
  FileText,
  Award,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  History,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import useCVAnalysisStore from '../store/cvAnalysisStore';

const ScoreRing = ({ score, size = 120, strokeWidth = 10 }) => {
  const { getScoreCategory } = useCVAnalysisStore.getState();
  const category = getScoreCategory(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const colorMap = {
    green: '#10B981',
    yellow: '#F59E0B',
    orange: '#F97316',
    red: '#EF4444',
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap[category.color]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{score}</span>
        <span className="text-xs text-gray-500">/100</span>
      </div>
    </div>
  );
};

const SectionScore = ({ label, score, icon: Icon }) => {
  const { getScoreCategory } = useCVAnalysisStore.getState();
  const category = getScoreCategory(score);

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className={`p-2 rounded-lg ${category.bg}`}>
        <Icon className={`w-5 h-5 ${category.text}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className={`text-sm font-semibold ${category.text}`}>{score}/100</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              category.color === 'green'
                ? 'bg-green-500'
                : category.color === 'yellow'
                  ? 'bg-yellow-500'
                  : category.color === 'orange'
                    ? 'bg-orange-500'
                    : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const ObservationCard = ({ observation }) => {
  const [expanded, setExpanded] = useState(false);

  const icons = {
    strength: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    improvement: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  };

  const style = icons[observation.type] || icons.improvement;
  const Icon = style.icon;

  return (
    <div className={`border rounded-lg p-4 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${style.color} flex-shrink-0`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${style.color}`}>
            {observation.section}
          </p>
          <p className="text-sm text-gray-700 mt-1">{observation.message}</p>
        </div>
      </div>
    </div>
  );
};

const RecommendationCard = ({ recommendation, index }) => (
  <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
      <span className="text-xs font-semibold text-emerald-700">{index + 1}</span>
    </div>
    <p className="text-sm text-gray-700">{recommendation}</p>
  </div>
);

const KeywordsAnalysis = ({ keywords }) => (
  <div className="space-y-4">
    {keywords.matched?.length > 0 && (
      <div>
        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Palabras clave presentes
        </h4>
        <div className="flex flex-wrap gap-2">
          {keywords.matched.map((keyword, i) => (
            <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    )}

    {keywords.missing?.length > 0 && (
      <div>
        <h4 className="text-sm font-medium text-amber-700 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Palabras clave faltantes
        </h4>
        <div className="flex flex-wrap gap-2">
          {keywords.missing.map((keyword, i) => (
            <span key={i} className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
              {keyword}
            </span>
          ))}
        </div>
      </div>
    )}

    {keywords.suggestions?.length > 0 && (
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Sugerencias para agregar
        </h4>
        <ul className="space-y-1">
          {keywords.suggestions.map((suggestion, i) => (
            <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const HistoryItem = ({ item, onSelect, onDelete, isSelected }) => {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={() => onSelect(item.id)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${item.scoreCategory.bg} ${item.scoreCategory.text}`}>
            {item.overallScore}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {item.offer ? `Para: ${item.offer.title}` : 'Análisis general'}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleDateString('es-PE', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        {showDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const CVAnalyzer = ({ offers = [], currentOfferId = null }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState(currentOfferId);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    currentAnalysis,
    analysisHistory,
    isAnalyzing,
    isLoadingHistory,
    isLoadingDetails,
    error,
    analyzeCV,
    fetchAnalysisHistory,
    fetchAnalysisDetails,
    deleteAnalysis,
    clearError,
    clearCurrentAnalysis,
  } = useCVAnalysisStore();

  // Cargar historial al montar
  useEffect(() => {
    fetchAnalysisHistory();
  }, [fetchAnalysisHistory]);

  const handleAnalyze = async () => {
    clearError();
    await analyzeCV(selectedOfferId);
  };

  const handleSelectHistory = async (analysisId) => {
    await fetchAnalysisDetails(analysisId);
    setActiveTab('overview');
  };

  const handleDelete = async (analysisId) => {
    if (window.confirm('¿Estás seguro de eliminar este análisis?')) {
      await deleteAnalysis(analysisId);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: Target },
    { id: 'observations', label: 'Observaciones', icon: FileText },
    { id: 'keywords', label: 'Palabras Clave', icon: Sparkles },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Análisis de CV con IA</h3>
            <p className="text-sm text-gray-500">
              Obtén feedback detallado para mejorar tu CV antes de postular
            </p>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-3">
          {offers.length > 0 && (
            <select
              value={selectedOfferId || ''}
              onChange={(e) => setSelectedOfferId(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Análisis general (sin oferta específica)</option>
              {offers.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.title} - {offer.company?.legalName}
                </option>
              ))}
            </select>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analizar CV
                </>
              )}
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <History className="w-4 h-4" />
              Historial
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {selectedOfferId && (
          <p className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
            <Target className="w-3 h-3" />
            El análisis se contextualizará según los requisitos de la oferta seleccionada
          </p>
        )}
      </div>

      {/* Historial (colapsable) */}
      {showHistory && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Historial de análisis</h4>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : analysisHistory.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay análisis previos. ¡Realiza tu primer análisis!
            </p>
          ) : (
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {analysisHistory.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onSelect={handleSelectHistory}
                  onDelete={handleDelete}
                  isSelected={currentAnalysis?.id === item.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700">Error</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Resultados */}
      {currentAnalysis && (
        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Contenido según tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Puntuación global */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 rounded-xl">
                <ScoreRing score={currentAnalysis.overallScore} />
                <div className="text-center sm:text-left">
                  <p className="text-2xl font-bold text-gray-900">
                    {currentAnalysis.scoreCategory?.label}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentAnalysis.offer
                      ? `Análisis contextualizado para: ${currentAnalysis.offer.title}`
                      : 'Análisis general de tu CV'}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(currentAnalysis.createdAt || Date.now()).toLocaleString('es-PE')}
                  </p>
                </div>
              </div>

              {/* Puntuaciones por sección */}
              <div className="grid gap-3 sm:grid-cols-2">
                <SectionScore
                  label="Claridad"
                  score={currentAnalysis.sectionScores?.clarity || 0}
                  icon={FileText}
                />
                <SectionScore
                  label="Impacto"
                  score={currentAnalysis.sectionScores?.impact || 0}
                  icon={TrendingUp}
                />
                <SectionScore
                  label="Ortografía"
                  score={currentAnalysis.sectionScores?.grammar || 0}
                  icon={CheckCircle}
                />
                <SectionScore
                  label="Extensión"
                  score={currentAnalysis.sectionScores?.length || 0}
                  icon={Award}
                />
                <SectionScore
                  label="Palabras Clave"
                  score={currentAnalysis.sectionScores?.keywords || 0}
                  icon={Sparkles}
                />
              </div>

              {/* Recomendaciones principales */}
              {currentAnalysis.recommendations?.length > 0 && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Recomendaciones principales
                  </h4>
                  <div className="space-y-2">
                    {currentAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                      <RecommendationCard key={i} recommendation={rec} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'observations' && (
            <div className="space-y-3">
              {currentAnalysis.observations?.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">¡Excelente! No se encontraron observaciones.</p>
                </div>
              ) : (
                currentAnalysis.observations.map((obs, i) => (
                  <ObservationCard key={i} observation={obs} />
                ))
              )}
            </div>
          )}

          {activeTab === 'keywords' && (
            <div>
              {currentAnalysis.keywordsAnalysis ? (
                <KeywordsAnalysis keywords={currentAnalysis.keywordsAnalysis} />
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No hay análisis de palabras clave disponible.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {!currentAnalysis && !isAnalyzing && !isLoadingDetails && (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Aún no has analizado tu CV
          </h4>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Selecciona una oferta (opcional) y haz clic en &quot;Analizar CV&quot; para recibir feedback
            personalizado de nuestra IA.
          </p>
        </div>
      )}

      {/* Loading estado */}
      {(isAnalyzing || isLoadingDetails) && !currentAnalysis && (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">
            {isAnalyzing ? 'Analizando tu CV con IA...' : 'Cargando análisis...'}
          </p>
          <p className="text-sm text-gray-400 mt-2">Esto puede tomar unos segundos</p>
        </div>
      )}
    </div>
  );
};

export default CVAnalyzer;
