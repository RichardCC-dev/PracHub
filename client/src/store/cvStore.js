import { create } from 'zustand';
import { getResume, updateResumeSection, improveField, improveSection } from '../services/api';

const useCVStore = create((set) => ({
  resume: null,
  isLoading: false,
  error: null,
  suggestion: null,
  activeSection: null,

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
    set({ isLoading: true, error: null });
    try {
      const data = await updateResumeSection(section, payload);
      set({ resume: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
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
    const currentState = useCVStore.getState();
    if (!currentState.suggestion) return;
    
    const improvedData = currentState.suggestion.improved;
    
    // Actualizar estado local primero
    set((state) => {
      const updated = {
        ...state.resume,
        [section]: improvedData,
      };
      return { resume: updated, suggestion: null, activeSection: null };
    });
    
    // Guardar cambios en la base de datos
    await updateResumeSection(section, improvedData);
    
    // Refrescar datos para actualizar vista previa
    await get().fetchResume();
  },

  clearSuggestion: () => set({ suggestion: null, activeSection: null }),
}));

export default useCVStore;
