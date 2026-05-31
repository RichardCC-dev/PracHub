import { create } from 'zustand';
import {
  analyzeCV,
  getAnalysisHistory,
  getAnalysisDetails,
  deleteAnalysis,
} from '../services/api';

const SCORE_RANGES = {
  excellent: { min: 80, max: 100, label: 'Excelente', color: 'green', bg: 'bg-green-100', text: 'text-green-700' },
  good: { min: 60, max: 79, label: 'Bueno', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  needsImprovement: { min: 40, max: 59, label: 'Necesita mejoras', color: 'orange', bg: 'bg-orange-100', text: 'text-orange-700' },
  poor: { min: 0, max: 39, label: 'Requiere trabajo', color: 'red', bg: 'bg-red-100', text: 'text-red-700' },
};

const getScoreCategory = (score) => {
  if (score >= SCORE_RANGES.excellent.min) return SCORE_RANGES.excellent;
  if (score >= SCORE_RANGES.good.min) return SCORE_RANGES.good;
  if (score >= SCORE_RANGES.needsImprovement.min) return SCORE_RANGES.needsImprovement;
  return SCORE_RANGES.poor;
};

const useCVAnalysisStore = create((set, get) => ({
  // Estados
  currentAnalysis: null,
  analysisHistory: [],
  selectedOfferId: null,
  isAnalyzing: false,
  isLoadingHistory: false,
  isLoadingDetails: false,
  error: null,
  analysisError: null,

  // Setters
  setSelectedOfferId: (offerId) => set({ selectedOfferId: offerId }),
  clearError: () => set({ error: null, analysisError: null }),
  clearCurrentAnalysis: () => set({ currentAnalysis: null }),

  // Analizar CV
  analyzeCV: async (offerId = null) => {
    set({ isAnalyzing: true, analysisError: null, error: null });
    try {
      const data = await analyzeCV(offerId);
      const analysisWithCategory = {
        ...data.analysis,
        scoreCategory: getScoreCategory(data.analysis.overallScore),
      };
      set({
        currentAnalysis: analysisWithCategory,
        isAnalyzing: false,
      });
      return analysisWithCategory;
    } catch (error) {
      set({ analysisError: error.message, isAnalyzing: false });
      throw error;
    }
  },

  // Obtener historial de análisis
  fetchAnalysisHistory: async (limit = 20) => {
    set({ isLoadingHistory: true, error: null });
    try {
      const data = await getAnalysisHistory(limit);
      const historyWithCategories = data.history.map((item) => ({
        ...item,
        scoreCategory: getScoreCategory(item.overallScore),
      }));
      set({
        analysisHistory: historyWithCategories,
        isLoadingHistory: false,
      });
      return historyWithCategories;
    } catch (error) {
      set({ error: error.message, isLoadingHistory: false });
      throw error;
    }
  },

  // Obtener detalles de un análisis específico
  fetchAnalysisDetails: async (analysisId) => {
    set({ isLoadingDetails: true, error: null });
    try {
      const data = await getAnalysisDetails(analysisId);
      const analysisWithCategory = {
        ...data,
        scoreCategory: getScoreCategory(data.overallScore),
      };
      set({
        currentAnalysis: analysisWithCategory,
        isLoadingDetails: false,
      });
      return analysisWithCategory;
    } catch (error) {
      set({ error: error.message, isLoadingDetails: false });
      throw error;
    }
  },

  // Eliminar un análisis
  deleteAnalysis: async (analysisId) => {
    set({ isLoadingHistory: true, error: null });
    try {
      await deleteAnalysis(analysisId);
      // Actualizar el historial local
      const currentHistory = get().analysisHistory;
      const updatedHistory = currentHistory.filter((item) => item.id !== parseInt(analysisId, 10));
      set({
        analysisHistory: updatedHistory,
        isLoadingHistory: false,
      });
      // Si el análisis eliminado es el actual, limpiarlo
      const currentAnalysis = get().currentAnalysis;
      if (currentAnalysis?.id === parseInt(analysisId, 10)) {
        set({ currentAnalysis: null });
      }
      return true;
    } catch (error) {
      set({ error: error.message, isLoadingHistory: false });
      throw error;
    }
  },

  // Helpers
  getScoreCategory,
  SCORE_RANGES,
}));

export default useCVAnalysisStore;
