import { create } from 'zustand';
import api from '../services/api';

const useWorkflowStore = create((set, get) => ({
  // Workflows
  workflows: [],
  workflowsTotal: 0,
  currentWorkflow: null,
  workflowsLoading: false,

  // Executions
  executions: [],
  executionsTotal: 0,
  currentExecution: null,
  executionTimeline: [],
  executionsLoading: false,

  // Dashboard
  dashboardStats: null,

  // Notifications
  notifications: [],

  // Integrations
  integrations: [],

  // Actions
  fetchWorkflows: async (params = {}) => {
    set({ workflowsLoading: true });
    try {
      const { data } = await api.get('/workflows', { params });
      set({ workflows: data.workflows, workflowsTotal: data.total, workflowsLoading: false });
    } catch {
      set({ workflowsLoading: false });
    }
  },

  fetchWorkflow: async (id) => {
    try {
      const { data } = await api.get(`/workflows/${id}`);
      set({ currentWorkflow: data });
      return data;
    } catch {
      return null;
    }
  },

  createWorkflow: async (workflowData) => {
    const { data } = await api.post('/workflows', workflowData);
    set((state) => ({ workflows: [data, ...state.workflows] }));
    return data;
  },

  updateWorkflow: async (id, workflowData) => {
    const { data } = await api.put(`/workflows/${id}`, workflowData);
    set((state) => ({
      currentWorkflow: data,
      workflows: state.workflows.map((w) => (w._id === id ? data : w)),
    }));
    return data;
  },

  deleteWorkflow: async (id) => {
    await api.delete(`/workflows/${id}`);
    set((state) => ({
      workflows: state.workflows.filter((w) => w._id !== id),
    }));
  },

  duplicateWorkflow: async (id) => {
    const { data } = await api.post(`/workflows/${id}/duplicate`);
    set((state) => ({ workflows: [data, ...state.workflows] }));
    return data;
  },

  generateWorkflow: async (prompt) => {
    const { data } = await api.post('/workflows/generate', { prompt });
    set((state) => ({ workflows: [data, ...state.workflows] }));
    return data;
  },

  executeWorkflow: async (id, inputs = {}) => {
    const { data } = await api.post(`/workflows/${id}/execute`, { inputs });
    return data;
  },

  // Dashboard
  fetchDashboard: async () => {
    try {
      const { data } = await api.get('/workflows/dashboard');
      set({ dashboardStats: data });
    } catch {}
  },

  // Executions
  fetchExecutions: async (params = {}) => {
    set({ executionsLoading: true });
    try {
      const { data } = await api.get('/executions', { params });
      set({ executions: data.executions, executionsTotal: data.total, executionsLoading: false });
    } catch {
      set({ executionsLoading: false });
    }
  },

  fetchExecution: async (id) => {
    try {
      const { data } = await api.get(`/executions/${id}`);
      set({ currentExecution: data });
      return data;
    } catch {
      return null;
    }
  },

  fetchTimeline: async (id) => {
    try {
      const { data } = await api.get(`/executions/${id}/timeline`);
      set({ executionTimeline: data });
      return data;
    } catch {
      return [];
    }
  },

  pauseExecution: async (id) => {
    const { data } = await api.post(`/executions/${id}/pause`);
    set((state) => ({
      currentExecution: data,
      executions: state.executions.map((e) => (e._id === id ? data : e)),
    }));
  },

  resumeExecution: async (id) => {
    const { data } = await api.post(`/executions/${id}/resume`);
    set((state) => ({
      currentExecution: data,
      executions: state.executions.map((e) => (e._id === id ? data : e)),
    }));
  },

  cancelExecution: async (id) => {
    const { data } = await api.post(`/executions/${id}/cancel`);
    set((state) => ({
      currentExecution: data,
      executions: state.executions.map((e) => (e._id === id ? data : e)),
    }));
  },

  // Notifications
  fetchNotifications: async () => {
    try {
      const { data } = await api.get('/notifications');
      set({ notifications: data });
    } catch {}
  },

  addNotification: (notification) => {
    set((state) => ({ notifications: [notification, ...state.notifications] }));
  },

  markNotificationRead: async (id) => {
    await api.post(`/notifications/${id}/read`);
    set((state) => ({
      notifications: state.notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    }));
  },

  // Integrations
  fetchIntegrations: async () => {
    try {
      const { data } = await api.get('/integrations');
      set({ integrations: data });
    } catch {}
  },
}));

export default useWorkflowStore;
