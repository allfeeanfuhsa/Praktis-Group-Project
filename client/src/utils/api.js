import axios from 'axios';

// Base URL - change this to match your backend
const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;