// server/src/config/gemini.js
// Google Gemini client initialization for all AI features.

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { env } = require('./env');

/**
 * Singleton Gemini client instance.
 * Used by gemini.service.js for all AI operations:
 * - Food recognition (vision)
 * - Receipt/grocery scanning (vision)
 * - Recipe generation (text)
 * - Vietnamese meal generation (text)
 * - Weekly meal plan suggestion (text)
 */
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

/**
 * The model to use for all operations.
 * gemini-2.0-flash supports both text and vision in a single model.
 */
const MODEL_NAME = env.GEMINI_MODEL || 'gemini-2.0-flash';

/**
 * Get a generative model instance.
 * @param {object} options - Model configuration overrides
 * @returns {GenerativeModel}
 */
const getModel = (options = {}) => {
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      topP: options.topP ?? 0.95,
      topK: options.topK ?? 40,
      maxOutputTokens: options.maxOutputTokens ?? 4096,
      responseMimeType: options.responseMimeType || 'application/json',
    },
    ...options,
  });
};

module.exports = { genAI, getModel, MODEL_NAME };