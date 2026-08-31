import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token into requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('saha_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (!window.location.pathname.includes('/login')) {
        console.warn('Unauthorized admin access attempt detected. Redirecting to login...');
        localStorage.removeItem('saha_admin_token');
        localStorage.removeItem('saha_admin_user');
        sessionStorage.removeItem('saha_admin_token');
        sessionStorage.removeItem('saha_admin_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
