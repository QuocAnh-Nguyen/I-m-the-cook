// server/src/routes/dashboard.routes.js
// Dashboard stats — aggregated overview of all modules.
const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Auth disabled for development
const DEV_USER_ID = 'dev-user';

router.get('/stats', asyncHandler(async (req, res) => {
  const userId = DEV_USER_ID;
  const today = new Date().toISOString().split('T')[0];

  // Run all queries in parallel
  const [recipesCount, pantryCount, mealSlotsCount, todayEntries, expiringItems] =
    await Promise.all([
      prisma.recipe.count({ where: { userId } }),
      prisma.pantryItem.count({ where: { userId } }),
      prisma.mealSlot.count({
        where: {
          userId,
          weekStart: {
            gte: (() => {
              const d = new Date();
              const day = d.getDay();
              const diff = d.getDate() - day + (day === 0 ? -6 : 1);
              d.setDate(diff);
              d.setHours(0, 0, 0, 0);
              return d;
            })(),
          },
        },
      }),
      prisma.calorieEntry.findMany({ where: { userId, date: today } }),
      prisma.pantryItem.findMany({
        where: {
          userId,
          expiry: {
            gte: new Date(),
            lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

  const todayCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0);

  res.json({
    success: true,
    data: {
      recipesCreated: recipesCount,
      mealPlans: mealSlotsCount,
      pantryItems: pantryCount,
      caloriesToday: todayCalories,
      expiringPantryItems: expiringItems.length,
      expiringItems: expiringItems.map((i) => i.name),
    },
  });
}));

module.exports = router;