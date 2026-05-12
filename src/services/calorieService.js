// src/services/calorieService.js
// Calorie Tracker API calls.
import api from './api';

export const getEntries = (date) => api.get('/calories', { params: { date } });
export const getSummary = (date) => api.get('/calories/summary', { params: { date } });

/**
 * Add a calorie entry, optionally auto-logging to the meal planner.
 * @param {object} entry
 * @param {boolean} entry.autoLog - If true, creates a MealSlotDish automatically
 */
export const addEntry = (entry) => api.post('/calories', entry);
export const deleteEntry = (id) => api.delete(`/calories/${id}`);