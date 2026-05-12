// src/services/recipeService.js
// Recipe CRUD + AI generation API calls.
import api from './api';

export const getRecipes = (params) => api.get('/recipes', { params });
export const getRecipe = (id) => api.get(`/recipes/${id}`);
export const createRecipe = (data) => api.post('/recipes', data);
export const updateRecipe = (id, data) => api.patch(`/recipes/${id}`, data);
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);

/**
 * Generate a recipe via AI (single dish or Vietnamese multi-dish meal).
 * @param {object} wizardData - Full wizard state
 * @param {string} style - "single_dish" | "vietnamese_meal"
 */
export const generateRecipe = (wizardData) =>
  api.post('/recipes/generate', wizardData);