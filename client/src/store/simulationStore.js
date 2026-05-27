import { create } from 'zustand';
import {
  startSimulation,
  sendMessageToSimulation,
  endSimulation,
  getSimulationHistory,
  getSimulationDetails
} from '../services/api';

const useSimulationStore = create((set, get) => ({
  simulationsHistory: [],
  currentSimulation: null,
  isLoading: false,
  error: null,
  
  startNewSimulation: async (role, token, career, sector) => {
    set({ isLoading: true, error: null });
    try {
      const data = await startSimulation(role, token, career, sector);
      set({ currentSimulation: data.simulation, isLoading: false });
      return data.simulation;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  sendMessage: async (id, message, token) => {
    set({ isLoading: true, error: null });
    try {
      const data = await sendMessageToSimulation(id, message, token);
      set({ currentSimulation: data.simulation, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  finishSimulation: async (id, token) => {
    set({ isLoading: true, error: null });
    try {
      const data = await endSimulation(id, token);
      set({ currentSimulation: data.simulation, isLoading: false });
      return data.simulation;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchHistory: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getSimulationHistory(token);
      set({ simulationsHistory: data.simulations, isLoading: false });
      return data.simulations;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchSimulationDetails: async (id, token) => {
    set({ isLoading: true, error: null });
    try {
      const data = await getSimulationDetails(id, token);
      set({ currentSimulation: data.simulation, isLoading: false });
      return data.simulation;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearCurrentSimulation: () => {
    set({ currentSimulation: null });
  }
}));

export default useSimulationStore;
