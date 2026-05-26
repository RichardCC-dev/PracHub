import { create } from 'zustand';
import {
  loginUser,
  registerStudent,
  registerCompany,
  requestPasswordReset,
  resetPassword,
} from '../services/api';

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('prachub_user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('prachub_token'),
  isLoading: false,
  error: null,
  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await loginUser(payload);
      localStorage.setItem('prachub_token', data.token);
      localStorage.setItem('prachub_user', JSON.stringify(data.user));
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
      localStorage.setItem('prachub_token', data.token);
      localStorage.setItem('prachub_user', JSON.stringify(data.user));
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
      localStorage.setItem('prachub_token', data.token);
      localStorage.setItem('prachub_user', JSON.stringify(data.user));
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
      localStorage.setItem('prachub_token', data.token);
      localStorage.setItem('prachub_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('prachub_token');
    localStorage.removeItem('prachub_user');
    set({ user: null, token: null });
  },
  setUser: (user) => {
    localStorage.setItem('prachub_user', JSON.stringify(user));
    set({ user });
  },
}));

export default useAuthStore;
