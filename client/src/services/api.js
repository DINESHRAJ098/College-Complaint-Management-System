import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('agentflow-auth');
      if (stored) {
        try {
          const { state } = JSON.parse(stored);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch {}
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('agentflow-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
