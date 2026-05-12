// server/src/routes/calories.routes.js
// Calorie tracker CRUD + food photo analysis + auto-sync to meal planner.
const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Auth disabled for development
const DEV_USER_ID = 'dev-user';
const DEV_CALORIE_GOAL = 2000;

// ─── GET / — Get entries for a date ────────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
  const { date } = req.query;
  const dateStr = date || new Date().toISOString().split('T')[0];

  const entries = await prisma.calorieEntry.findMany({
    where: { userId: DEV_USER_ID, date: dateStr },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: entries });
}));

// ─── GET /summary — Daily totals ───────────────────────────────────────────
router.get('/summary', asyncHandler(async (req, res) => {
  const { date } = req.query;
  const dateStr = date || new Date().toISOString().split('T')[0];

  const entries = await prisma.calorieEntry.findMany({
    where: { userId: DEV_USER_ID, date: dateStr },
  });

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.calories || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  res.json({
    success: true,
    data: {
      totals,
      entries,
      calorieGoal: DEV_CALORIE_GOAL,
      remaining: Math.max(0, DEV_CALORIE_GOAL - totals.calories),
    },
  });
}));

// ─── POST / — Add a calorie entry (manual) ─────────────────────────────────
router.post('/', asyncHandler(async (req, res) => {
  const { date, mealType, foodName, quantity, unit, calories, protein, carbs, fat, fromPhoto, autoLog } = req.body;

  const entry = await prisma.calorieEntry.create({
    data: {
      userId: DEV_USER_ID,
      date: date || new Date().toISOString().split('T')[0],
      mealType: mealType || 'Snack',
      foodName,
      quantity: quantity || 1,
      unit: unit || 'serving',
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      fromPhoto: fromPhoto || false,
    },
  });

  // Auto-log to meal planner if requested (fromPhoto or autoLog flag)
  if (autoLog || fromPhoto) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const dayKey = days[today.getDay()];

    // Get Monday of current week
    const monday = new Date(today);
    const diff = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    // Upsert meal slot
    const slot = await prisma.mealSlot.upsert({
      where: {
        userId_weekStart_day_mealType: {
          userId: DEV_USER_ID,
          weekStart: monday,
          day: dayKey,
          mealType: entry.mealType,
        },
      },
      create: {
        userId: DEV_USER_ID,
        weekStart: monday,
        day: dayKey,
        mealType: entry.mealType,
        synced: true,
      },
      update: { synced: true },
    });

    // Add dish to the slot
    await prisma.mealSlotDish.create({
      data: {
        mealSlotId: slot.id,
        customName: entry.foodName,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        sortOrder: 0,
      },
    });
  }

  res.status(201).json({ success: true, data: entry });
}));

// ─── DELETE /:id — Delete an entry ────────────────────────────────────────
router.delete('/:id', asyncHandler(async (req, res) => {
  const entry = await prisma.calorieEntry.deleteMany({
    where: { id: req.params.id, userId: DEV_USER_ID },
  });
  if (entry.count === 0) {
    return res.status(404).json({ success: false, error: 'Entry not found' });
  }
  res.json({ success: true, data: null });
}));

module.exports = router;