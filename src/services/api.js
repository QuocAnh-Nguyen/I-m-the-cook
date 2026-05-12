// src/services/api.js
// ============================================================================
// Axios API client — base instance with auth interceptors.
// All API calls go through this instance. Uses CRA proxy to /api/v1.
// ============================================================================
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: attach JWT token ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('chefone_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: unwrap data, handle errors ──────────────────────
api.interceptors.response.use(
  (res) => res.data, // Unwrap: return { success, data, meta } directly
  (err) => {
    // Auth disabled for development — 401 no longer redirects
    return Promise.reject(err.response?.data || err);
  }
);

export default api;