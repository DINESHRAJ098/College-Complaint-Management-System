import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import { joinUserRoom, joinRoleRoom } from '../services/socket';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { user, token } = res.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          // Join socket rooms
          if (user?.id) joinUserRoom(user.id);
          if (user?.role) joinRoleRoom(user.role);

          return { success: true, user };
        } catch (err) {
          set({
            isLoading: false,
            error: err.message || 'Login failed. Check your credentials.'
          });
          return { success: false, error: err.message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', userData);
          const { user, token } = res.data;
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          if (user?.id) joinUserRoom(user.id);
          if (user?.role) joinRoleRoom(user.role);

          return { success: true, user };
        } catch (err) {
          set({
            isLoading: false,
            error: err.message || 'Registration failed.'
          });
          return { success: false, error: err.message };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null
        });
      },

      fetchMe: async () => {
        if (!get().token) return;
        try {
          const res = await api.get('/auth/me');
          if (res.data) {
            set({ user: res.data });
          }
        } catch (err) {
          console.warn('Failed to refresh user profile');
        }
      },

      updateUser: (updatedData) => {
        set((state) => ({
          user: { ...state.user, ...updatedData }
        }));
      }
    }),
    {
      name: 'campus_resolve_auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
