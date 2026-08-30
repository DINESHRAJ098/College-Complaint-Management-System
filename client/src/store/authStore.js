import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          set({ user: data.user, token: data.token, isLoading: false });
          return data;
        } catch (err) {
          const message = err.response?.data?.error || 'Login failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          set({ user: data.user, token: data.token, isLoading: false });
          return data;
        } catch (err) {
          const message = err.response?.data?.error || 'Registration failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      fetchProfile: async () => {
        const token = get().token;
        if (!token) return;
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get('/auth/me');
          set({ user: data });
        } catch {
          set({ user: null, token: null });
        }
      },

      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'agentflow-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);

// Initialize API token from stored state
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('agentflow-auth');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      }
    } catch {}
  }
}

export default useAuthStore;
