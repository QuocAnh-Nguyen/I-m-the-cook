// src/services/aiService.js
// AI feature API calls: food recognition, receipt scanning,
// meal plan suggestion, Vietnamese meal generation.
import api from './api';

/**
 * Analyze a food image for nutrition recognition.
 * @param {File} imageFile - The food photo file
 * @returns {Promise<{ dishes: Array, totalNutrition: Object, imageUrl: string }>}
 */
export const analyzeFood = (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.post('/ai/analyze-food', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Scan a grocery receipt or basket image and extract items.
 * @param {File} imageFile - The receipt/basket photo
 * @returns {Promise<{ items: Array, imageUrl: string }>}
 */
export const scanReceipt = (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.post('/ai/scan-receipt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Generate a Vietnamese multi-dish meal from ingredients.
 * @param {object} params
 * @param {string[]} params.ingredients
 * @param {string} params.mealType
 * @param {number} params.servings
 * @param {object} params.preferences
 * @returns {Promise<{ mealName, dishes: Array, totalNutrition: Object }>}
 */
export const generateVietnameseMeal = ({ ingredients, mealType, servings, preferences }) =>
  api.post('/ai/generate-vietnamese-meal', { ingredients, mealType, servings, preferences });

/**
 * Get AI-suggested weekly meal plan based on pantry and preferences.
 * @param {object} params
 * @returns {Promise<{ suggestions: Object, rationale: string }>}
 */
export const suggestMealPlan = (params) =>
  api.post('/ai/suggest-meal-plan', params);