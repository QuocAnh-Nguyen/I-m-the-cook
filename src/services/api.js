// src/services/api.js
// ============================================================================
// Axios API client — base instance with auth interceptors.
// All API calls go through this instance.
//
// In development (CRA): uses /api/v1 with the built-in proxy to localhost:5000
// In production:       uses REACT_APP_API_URL env var (e.g., https://chefone-api.onrender.com/api/v1)
// ============================================================================
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
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