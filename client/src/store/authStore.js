import { create } from 'zustand';
import {
  loginUser,
  registerStudent,
  registerCompany,
  requestPasswordReset,
  resetPassword,
} from '../services/api';

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

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: readStorage(KEY_TOKEN),
  isLoading: false,
  error: null,
  login: async (payload, remember = false) => {
    set({ isLoading: true, error: null });
    try {
      const data = await loginUser(payload);
      saveSession(data.token, data.user, remember);
      set({ user: data.user, token: data.token, isLoading: false });
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
      set({ user: data.user, token: data.token, isLoading: false });
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
      set({ user: data.user, token: data.token, isLoading: false });
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
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  logout: () => {
    clearSession();
    set({ user: null, token: null });
  },
  setUser: (user) => {
    const remember = !!localStorage.getItem(KEY_REMEMBER);
    saveSession(readStorage(KEY_TOKEN) || '', user, remember);
    set({ user });
  },
}));

export default useAuthStore;
