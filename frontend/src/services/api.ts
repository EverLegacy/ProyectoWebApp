import axios from 'axios';
import { getOrCreateCorrelationId } from '../lib/datadog';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Correlation-ID'] = getOrCreateCorrelationId();
  return config;
});

export default api;
