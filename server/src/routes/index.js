const { sendSuccess } = require('../utils/apiResponse');

/**
 * Route aggregator for /api/v1/*.
 * All feature routes are mounted here.
 */
const router = require('express').Router();

// Health check within v1
router.get('/', (req, res) => {
  sendSuccess(res, { message: 'ChefOne API v1' });
});

// Feature routes will be mounted here as they are built:
// router.use('/auth', require('./auth.routes'));
// router.use('/recipes', require('./recipes.routes'));
// router.use('/pantry', require('./pantry.routes'));
// router.use('/meal-plan', require('./mealPlan.routes'));
// router.use('/calories', require('./calories.routes'));
// router.use('/nutrition', require('./nutrition.routes'));
// router.use('/shopping', require('./shopping.routes'));
// router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;