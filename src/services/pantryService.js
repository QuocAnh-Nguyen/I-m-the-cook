// src/services/pantryService.js
// Pantry API calls.
import api from './api';

export const getPantryItems = (params) => api.get('/pantry', { params });
export const getPantryStats = () => api.get('/pantry/stats');
export const addPantryItem = (data) => api.post('/pantry', data);
export const addPantryItemsBulk = (items) => api.post('/pantry/bulk', { items });
export const updatePantryItem = (id, data) => api.patch(`/pantry/${id}`, data);
export const deletePantryItem = (id) => api.delete(`/pantry/${id}`);