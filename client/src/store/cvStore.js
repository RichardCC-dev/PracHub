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

const EMPTY_RESUME_SECTIONS = {
  personal: { fullName: '', email: '', phone: '', linkedin: '' },
  profile: { summary: '' },
  education: { items: [] },
  experience: { items: [] },
  projects: { items: [] },
  certifications: { items: [] },
  skills: { areas: [{ area: '', skills: '' }], soft: '' },
  languages: { list: '' },
};

const JSON_FIELDS = ['profile', 'personal', 'education', 'certifications', 'experience', 'skills', 'languages', 'projects'];

const forceParseField = (value, fieldName) => {
  // Parsear hasta obtener un objeto (maneja double-encoding)
  let parsed = value;
  let iterations = 0;
  while (typeof parsed === 'string' && iterations < 3) {
    try { parsed = JSON.parse(parsed); } catch { parsed = {}; break; }
    iterations++;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    // Valores por defecto seguros según el campo
    if (['education', 'experience', 'projects', 'certifications'].includes(fieldName)) {
      return { items: [] };
    }
    return {};
  }
  return parsed;
};

const parsePlainResume = (raw) => {
  if (!raw || typeof raw !== 'object') return raw;
  const result = { ...raw };
  JSON_FIELDS.forEach((f) => {
    result[f] = forceParseField(result[f], f);
  });
  return result;
};

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
  restoreCount: 0,

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  fetchResume: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getResume();
      set({ resume: parsePlainResume(data), isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearResume: async () => {
    set({ isSaving: true, error: null });
    try {
      for (const [section, value] of Object.entries(EMPTY_RESUME_SECTIONS)) {
        await updateResumeSection(section, value);
      }
      const data = await getResume();
      set((state) => ({
        resume: parsePlainResume(data),
        isSaving: false,
        lastSaved: new Date(),
        restoreCount: state.restoreCount + 1,
      }));
    } catch (error) {
      set({ error: error.message, isSaving: false });
    }
  },

  updateSection: async (section, payload) => {
    set({ isSaving: true, error: null });
    try {
      const data = await updateResumeSection(section, payload);
      set({ resume: parsePlainResume(data), isSaving: false, lastSaved: new Date() });
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
      set((state) => ({
        resume: parsePlainResume(data.resume),
        isRestoring: false,
        showRestoreConfirm: false,
        versionToRestore: null,
        restoreCount: state.restoreCount + 1,
      }));
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
