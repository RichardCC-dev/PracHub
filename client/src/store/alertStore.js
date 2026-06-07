import { create } from 'zustand';
import {
  getAlertSettings,
  updateAlertSettings,
  getAlertHistory,
} from '../services/alertApi';

const useAlertStore = create((set, get) => ({
  // Estado
  settings: null,
  history: [],
  historyPagination: { total: 0, limit: 50, offset: 0 },
  isLoading: false,
  isUpdating: false,
  error: null,

  // Acciones
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAlertSettings();
      set({ settings: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateSettings: async (newSettings) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await updateAlertSettings(newSettings);
      set({ settings: response.data, isUpdating: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, isUpdating: false });
      throw error;
    }
  },

  fetchHistory: async (options = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAlertHistory(options);
      set({
        history: response.data,
        historyPagination: response.pagination,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  // Getters computados
  getFrequencyLabel: () => {
    const frequency = get().settings?.frequency;
    const labels = {
      immediate: 'Inmediata',
      daily: 'Diaria',
      weekly: 'Semanal',
    };
    return labels[frequency] || 'Inmediata';
  },

  getMinCompatibility: () => {
    return get().settings?.minCompatibility || 70;
  },

  areAlertsEnabled: () => {
    const settings = get().settings;
    if (!settings) return false;
    return settings.emailEnabled || settings.platformEnabled;
  },

  // Helpers
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      settings: null,
      history: [],
      historyPagination: { total: 0, limit: 50, offset: 0 },
      isLoading: false,
      isUpdating: false,
      error: null,
    }),
}));

export default useAlertStore;
