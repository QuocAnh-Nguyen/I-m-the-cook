// src/services/mealPlanService.js
// Meal Planner API calls — multi-dish support.
import api from './api';

/**
 * Get the weekly meal plan for a given date's week.
 * @param {string} date - ISO date (defaults to today)
 * @returns {Promise<{ data: Array, weekStart: string }>}
 */
export const getWeekPlan = (date) => api.get('/meal-plan/week', { params: { date } });

/**
 * Assign/update a meal slot with dishes.
 * @param {object} slot
 * @param {string} slot.weekStart - ISO date of Monday
 * @param {string} slot.day - "Mon" | "Tue" | ...
 * @param {string} slot.mealType - "Breakfast" | "Lunch" | "Dinner" | "Snack"
 * @param {Array} slot.dishes - Array of dish objects
 */
export const assignSlot = (slot) => api.put('/meal-plan/slot', slot);

/**
 * Remove a meal slot entirely.
 */
export const removeSlot = (slotId) => api.delete(`/meal-plan/slot/${slotId}`);

/**
 * Add a single dish to an existing meal slot.
 */
export const addDish = (slotId, dish) => api.post(`/meal-plan/slot/${slotId}/dish`, dish);

/**
 * Remove a single dish from a meal slot.
 */
export const removeDish = (dishId) => api.delete(`/meal-plan/dish/${dishId}`);