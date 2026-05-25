import { create } from 'zustand';
import { registerStudent } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('prachub_token'),
  isLoading: false,
  error: null,
  registerStudent: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const data = await registerStudent(payload);
      localStorage.setItem('prachub_token', data.token);
      set({ user: data.user, token: data.token, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('prachub_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
