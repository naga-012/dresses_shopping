import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
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
