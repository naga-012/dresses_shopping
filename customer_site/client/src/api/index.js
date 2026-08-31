import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 4000 // 4 second fast timeout to prevent hanging on Vercel DB delays
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
