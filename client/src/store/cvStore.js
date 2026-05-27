import { create } from 'zustand';
import {
  getResume,
  updateResumeSection,
  improveField,
  improveSection,
  exportResumePdf,
  getResumeVersions,
  restoreResumeVersion,
  deleteResumeVersion,
} from '../services/api';

const useCVStore = create((set, get) => ({
  resume: null,
  isLoading: false,
  isSaving: false,
  isExporting: false,
  lastSaved: null,
  error: null,
  exportError: null,
  suggestion: null,
  activeSection: null,
  selectedTemplate: 'harvard',
  versions: [],
  isLoadingVersions: false,
  versionsError: null,
  isRestoring: false,
  showRestoreConfirm: false,
  versionToRestore: null,

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  fetchResume: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getResume();
      set({ resume: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateSection: async (section, payload) => {
    set({ isSaving: true, error: null });
    try {
      const data = await updateResumeSection(section, payload);
      set({ resume: data, isSaving: false, lastSaved: new Date() });
    } catch (error) {
      set({ error: error.message, isSaving: false });
      throw error;
    }
  },

  requestSuggestion: async (section, field) => {
    set({ isLoading: true, error: null, suggestion: null });
    try {
      const data = await improveField(section, field);
      set({ suggestion: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  requestSectionSuggestion: async (section) => {
    set({ isLoading: true, error: null, suggestion: null, activeSection: section });
    try {
      const data = await improveSection(section);
      set({ suggestion: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false, activeSection: null });
      throw error;
    }
  },

  acceptSuggestion: (section, field) => {
    set((state) => {
      if (!state.suggestion) return state;
      const updated = {
        ...state.resume,
        [section]: {
          ...state.resume[section],
          [field]: state.suggestion.improved,
        },
        completionPercentage: Math.round(
          ((Object.values(updated).filter(Boolean).length - 1) / 6) * 100
        ),
      };
      return { resume: updated, suggestion: null };
    });
  },

  acceptSectionSuggestion: async (section) => {
    set((state) => {
      if (!state.suggestion) return state;
      const updated = {
        ...state.resume,
        [section]: state.suggestion.improved,
      };
      return { resume: updated, suggestion: null, activeSection: null };
    });
    // Refrescar datos para actualizar vista previa
    await get().fetchResume();
  },

  exportPdf: async (template) => {
    set({ isExporting: true, exportError: null });
    try {
      const { blob, filename } = await exportResumePdf(template);
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      globalThis.URL.revokeObjectURL(url);
      set({ isExporting: false });
    } catch (error) {
      set({ exportError: error.message, isExporting: false });
      throw error;
    }
  },

  clearSuggestion: () => set({ suggestion: null, activeSection: null }),

  fetchVersions: async (limit = 20) => {
    set({ isLoadingVersions: true, versionsError: null });
    try {
      const data = await getResumeVersions(limit);
      set({ versions: data, isLoadingVersions: false });
    } catch (error) {
      set({ versionsError: error.message, isLoadingVersions: false });
    }
  },

  openRestoreConfirm: (version) => set({
    showRestoreConfirm: true,
    versionToRestore: version,
  }),

  closeRestoreConfirm: () => set({
    showRestoreConfirm: false,
    versionToRestore: null,
  }),

  restoreVersion: async (versionId) => {
    set({ isRestoring: true, error: null });
    try {
      const data = await restoreResumeVersion(versionId);
      set({
        resume: data.resume,
        isRestoring: false,
        showRestoreConfirm: false,
        versionToRestore: null,
      });
      await get().fetchVersions();
      return true;
    } catch (error) {
      set({ error: error.message, isRestoring: false });
      return false;
    }
  },

  deleteVersion: async (versionId) => {
    set({ isLoadingVersions: true, versionsError: null });
    try {
      await deleteResumeVersion(versionId);
      await get().fetchVersions();
      return true;
    } catch (error) {
      set({ versionsError: error.message, isLoadingVersions: false });
      return false;
    }
  },
}));

export default useCVStore;
