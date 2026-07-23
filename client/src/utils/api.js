import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 2.1: Send HttpOnly cookies with every request
});

// Request interceptor: attach Authorization header from localStorage (backward compat)
// Once fully migrated to cookie-only auth, this interceptor can be removed.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: if the server returns 401, clear stale local state.
// The user will be redirected to login by the PrivateRoute / authContext.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;