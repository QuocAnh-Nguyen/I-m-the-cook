// src/services/dashboardService.js
// Dashboard API calls.
import api from './api';

export const getDashboardStats = () => api.get('/dashboard/stats');