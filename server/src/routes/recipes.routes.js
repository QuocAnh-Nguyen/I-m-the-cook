// server/src/routes/recipes.routes.js
// Recipe CRUD + AI generation endpoints.
const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');

// Auth disabled for development

// TODO: Replace with real controller logic once controllers are created
// For now, provide stub responses that the frontend can integrate with.

router.get('/', asyncHandler(async (req, res) => {
  res.json({ success: true, data: [], message: 'Recipes endpoint ready' });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, data: null, message: 'Recipe detail endpoint ready' });
}));

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: req.body, message: 'Recipe created' });
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.body, message: 'Recipe updated' });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  res.json({ success: true, data: null, message: 'Recipe deleted' });
}));

router.post('/generate', asyncHandler(async (req, res) => {
  const geminiService = require('../services/gemini.service');
  const { ingredients, mealType, utensils, time, skill, chefMode, style } = req.body;

  let result;
  if (style === 'vietnamese_meal') {
    result = await geminiService.generateVietnameseMeal({
      ingredients,
      mealType,
      servings: 2,
    });
  } else {
    result = await geminiService.generateRecipe({
      ingredients,
      mealType,
      utensils,
      time,
      skill,
      chefMode,
    });
  }

  res.json({ success: true, data: result });
}));

module.exports = router;