// server/src/routes/ai.routes.js
// AI-powered feature endpoints: food recognition, receipt scanning,
// meal plan suggestion, Vietnamese meal generation.
const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { uploadCalories, uploadPantry } = require('../middleware/upload');
const geminiService = require('../services/gemini.service');

// Auth disabled for development

// ─── Food Recognition (Vision) ──────────────────────────────────────────────
// POST /api/v1/ai/analyze-food
router.post('/analyze-food', uploadCalories.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Image file is required' });
  }

  const fs = require('fs');
  const imageBuffer = fs.readFileSync(req.file.path);
  const result = await geminiService.analyzeFoodImage(imageBuffer, req.file.mimetype);

  // Attach the uploaded image URL to the response
  result.imageUrl = `/uploads/calories/${req.file.filename}`;

  res.json({ success: true, data: result });
}));

// ─── Receipt / Grocery Scanner (Vision) ─────────────────────────────────────
// POST /api/v1/ai/scan-receipt
router.post('/scan-receipt', uploadPantry.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Image file is required' });
  }

  const fs = require('fs');
  const imageBuffer = fs.readFileSync(req.file.path);
  const result = await geminiService.analyzeReceiptImage(imageBuffer, req.file.mimetype);

  result.imageUrl = `/uploads/pantry/${req.file.filename}`;

  res.json({ success: true, data: result });
}));

// ─── Vietnamese Multi-Dish Meal Generation (Text) ──────────────────────────
// POST /api/v1/ai/generate-vietnamese-meal
router.post('/generate-vietnamese-meal', asyncHandler(async (req, res) => {
  const { ingredients, mealType, servings, preferences } = req.body;

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ success: false, error: 'At least one ingredient is required' });
  }

  const result = await geminiService.generateVietnameseMeal({
    ingredients,
    mealType: mealType || 'Dinner',
    servings: servings || 2,
    preferences: preferences || {},
  });

  res.json({ success: true, data: result });
}));

// ─── Weekly Meal Plan AI Suggestion (Text) ─────────────────────────────────
// POST /api/v1/ai/suggest-meal-plan
router.post('/suggest-meal-plan', asyncHandler(async (req, res) => {
  const { pantryItems, preferences, existingPlan, familySize, weekStart } = req.body;

  const result = await geminiService.generateWeeklyMealPlan({
    pantryItems: pantryItems || [],
    preferences: preferences || {},
    existingPlan: existingPlan || {},
    familySize: familySize || req.user?.familySize || 2,
    weekStart: weekStart || new Date().toISOString().split('T')[0],
  });

  res.json({ success: true, data: result });
}));

module.exports = router;