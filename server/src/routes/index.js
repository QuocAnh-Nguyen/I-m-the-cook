const { sendSuccess } = require('../utils/apiResponse');

/**
 * Route aggregator for /api/v1/*.
 * All feature routes are mounted here.
 *
 * Mounted routes:
 *   /ai/*       — AI features (food recognition, receipt scan, meal suggestions)
 *   /recipes/*  — Recipe CRUD + AI generation
 *   /pantry/*   — Pantry item CRUD + scanning
 *   /meal-plan/* — Multi-dish meal planner
 *   /calories/* — Calorie tracker + food photo analysis
 *   /dashboard/* — Aggregated stats
 */
const router = require('express').Router();

// Health check within v1
router.get('/', (req, res) => {
  sendSuccess(res, { message: 'ChefOne API v1' });
});

// Feature routes
router.use('/ai', require('./ai.routes'));
router.use('/recipes', require('./recipes.routes'));
router.use('/pantry', require('./pantry.routes'));
router.use('/meal-plan', require('./mealPlan.routes'));
router.use('/calories', require('./calories.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;