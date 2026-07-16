import { create } from 'zustand';
import {
  loginUser,
  registerStudent,
  registerCompany,
  requestPasswordReset,
  resetPassword,
} from '../services/api';
import queryClient from '../lib/queryClient';
import useSimulationStore from './simulationStore';

const KEY_TOKEN = 'prachub_token';
const KEY_USER = 'prachub_user';
const KEY_REMEMBER = 'prachub_remember';

const readStorage = (key) => {
  try {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch { return null; }
};

const saveSession = (token, user, remember) => {
  const store = remember ? localStorage : sessionStorage;
  const clear = remember ? sessionStorage : localStorage;
  store.setItem(KEY_TOKEN, token);
  store.setItem(KEY_USER, JSON.stringify(user));
  if (remember) localStorage.setItem(KEY_REMEMBER, '1');
  clear.removeItem(KEY_TOKEN);
  clear.removeItem(KEY_USER);
};

const clearSession = () => {
  [localStorage, sessionStorage].forEach(s => {
    s.removeItem(KEY_TOKEN);
    s.removeItem(KEY_USER);
  });
  localStorage.removeItem(KEY_REMEMBER);
};

const getStoredUser = () => {
  try {
    const raw = readStorage(KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

/**
 * Limpia el estado de todos los stores de Zustand al cambiar de usuario.
 * TanStack Query se limpia con queryClient.clear(), pero los stores de Zustand
 * (simulationStore, etc.) mantienen su estado entre sesiones si no se limpian
 * explícitamente.
 */
const clearAllStores = () => {
  queryClient.clear();
  useSimulationStore.getState().clearCurrentSimulation();
};

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isInitialized: false,
  authVerified: false, // Indica si la auth ha sido verificada completamente
  error: null,
  // Exponer saveSession para uso externo (ej: LoginForm con validación de rol)
  saveSession: (token, user, remember) => saveSession(token, user, remember),
  login: async (payload, remember = false) => {
    set({ isLoading: true, error: null });
    try {
      const data = await loginUser(payload);
      // Limpiar estado de stores del usuario anterior (caché de queries + stores Zustand)
      clearAllStores();
      saveSession(data.token, data.user, remember);
      set({ user: data.user, token: data.token, isLoading: false, isInitialized: true, authVerified: true });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  registerStudent: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await registerStudent(payload);
      saveSession(data.token, data.user, false);
      set({ user: data.user, token: data.token, isLoading: false, isInitialized: true, authVerified: true });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  registerCompany: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await registerCompany(payload);
      saveSession(data.token, data.user, false);
      set({ user: data.user, token: data.token, isLoading: false, isInitialized: true, authVerified: true });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  requestPasswordReset: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const data = await requestPasswordReset(payload);
      set({ isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  resetPassword: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await resetPassword(payload);
      saveSession(data.token, data.user, false);
      set({ user: data.user, token: data.token, isLoading: false, isInitialized: true, authVerified: true });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  logout: () => {
    clearSession();
    // Limpiar estado de todos los stores (caché de queries + stores Zustand)
    clearAllStores();
    set({ user: null, token: null, authVerified: false });
  },
  setUser: (user) => {
    const remember = !!localStorage.getItem(KEY_REMEMBER);
    saveSession(readStorage(KEY_TOKEN) || '', user, remember);
    set({ user });
  },
  initialize: () => {
    const token = readStorage(KEY_TOKEN);
    const user = getStoredUser();
    // authVerified solo es true si hay tanto token como user
    const authVerified = !!(token && user);
    set({ token, user, isLoading: false, isInitialized: true, authVerified });
  },
}));

export default useAuthStore;
