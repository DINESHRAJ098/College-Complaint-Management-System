import { create } from 'zustand';
import api from '../services/api';

export const useComplaintStore = create((set, get) => ({
  complaints: [],
  selectedComplaint: null,
  comments: [],
  pagination: { page: 1, total: 0, totalPages: 1, limit: 20 },
  filters: {
    search: '',
    category: 'all',
    status: 'all',
    priority: 'all',
    department: 'all',
    isEscalated: 'false'
  },
  isLoading: false,
  error: null,
  departments: [],

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters }
    }));
    get().fetchComplaints(1);
  },

  resetFilters: () => {
    set({
      filters: {
        search: '',
        category: 'all',
        status: 'all',
        priority: 'all',
        department: 'all',
        isEscalated: 'false'
      }
    });
    get().fetchComplaints(1);
  },

  fetchComplaints: async (page = 1) => {
    set({ isLoading: true, error: null });
    const { filters } = get();
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters
      });

      const res = await api.get(`/complaints?${queryParams.toString()}`);
      set({
        complaints: res.data || [],
        pagination: res.pagination || { page: 1, total: 0, totalPages: 1 },
        isLoading: false
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || 'Failed to fetch complaints'
      });
    }
  },

  fetchComplaintById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/complaints/${id}`);
      set({
        selectedComplaint: res.data,
        comments: res.comments || [],
        isLoading: false
      });
      return res.data;
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || 'Failed to fetch complaint details'
      });
      return null;
    }
  },

  fetchDepartments: async () => {
    try {
      const res = await api.get('/departments');
      set({ departments: res.data || [] });
    } catch (err) {
      console.warn('Failed to load departments');
    }
  },

  addRealtimeComment: (comment) => {
    set((state) => ({
      comments: [...state.comments, comment]
    }));
  },

  updateRealtimeComplaint: (updatedComplaint) => {
    set((state) => ({
      complaints: state.complaints.map((c) =>
        c._id === updatedComplaint._id ? { ...c, ...updatedComplaint } : c
      ),
      selectedComplaint:
        state.selectedComplaint?._id === updatedComplaint._id
          ? { ...state.selectedComplaint, ...updatedComplaint }
          : state.selectedComplaint
    }));
  }
}));
