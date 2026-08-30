import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('campus_resolve_auth');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          if (parsed.state?.token) {
            config.headers.Authorization = `Bearer ${parsed.state.token}`;
          }
        } catch (e) {
          console.error('Error reading auth token from storage:', e);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/register';
      if (!isAuthPage) {
        localStorage.removeItem('campus_resolve_auth');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
