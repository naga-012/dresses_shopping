import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('render.com')) {
      return 'https://saha-backend-api.onrender.com/api';
    }
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://customersite-psi.vercel.app/api';
    }
  }
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000
});

API.interceptors.request.use((config) => {
  let token = localStorage.getItem('mensverse_token');
  if (!token) {
    token = 'demo_token_' + Date.now();
    localStorage.setItem('mensverse_token', token);
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
