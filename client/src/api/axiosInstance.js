import axios from 'axios';

// Create an axios instance
const api = axios.create({
  baseURL: '/api', // This works because we set up the Proxy in vite.config.js
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Automatically add Token to EVERY request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;