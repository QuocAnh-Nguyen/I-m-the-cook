// server/src/routes/mealPlan.routes.js
// Weekly meal plan CRUD with multi-dish support (MealSlot + MealSlotDish).
const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Auth disabled for development
const DEV_USER_ID = 'dev-user';

// ─── Helper: Get Monday of the week containing a date ──────────────────────
const getMondayOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ─── GET /week — Get all meal slots for a week ─────────────────────────────
router.get('/week', asyncHandler(async (req, res) => {
  const { date } = req.query;
  const monday = getMondayOfWeek(date || new Date());

  const slots = await prisma.mealSlot.findMany({
    where: { userId: DEV_USER_ID, weekStart: monday },
    include: {
      dishes: {
        orderBy: { sortOrder: 'asc' },
        include: { recipe: true },
      },
    },
  });

  res.json({ success: true, data: slots, weekStart: monday.toISOString() });
}));

// ─── PUT /slot — Assign or update a meal slot (upsert with dishes) ────────
router.put('/slot', asyncHandler(async (req, res) => {
  const { weekStart, day, mealType, dishes } = req.body;

  const monday = getMondayOfWeek(weekStart || new Date());

  // Upsert the meal slot
  const slot = await prisma.mealSlot.upsert({
    where: {
      userId_weekStart_day_mealType: {
        userId: DEV_USER_ID,
        weekStart: monday,
        day,
        mealType,
      },
    },
    create: { userId: DEV_USER_ID, weekStart: monday, day, mealType },
    update: {},
  });

  // Remove existing dishes for this slot
  await prisma.mealSlotDish.deleteMany({ where: { mealSlotId: slot.id } });

  // Create new dishes
  if (dishes && dishes.length > 0) {
    for (let i = 0; i < dishes.length; i++) {
      await prisma.mealSlotDish.create({
        data: {
          mealSlotId: slot.id,
          recipeId: dishes[i].recipeId || null,
          customName: dishes[i].customName || null,
          calories: dishes[i].calories || 0,
          protein: dishes[i].protein || 0,
          carbs: dishes[i].carbs || 0,
          fat: dishes[i].fat || 0,
          sortOrder: i,
        },
      });
    }
  }

  // Return the updated slot with dishes
  const updated = await prisma.mealSlot.findUnique({
    where: { id: slot.id },
    include: {
      dishes: {
        orderBy: { sortOrder: 'asc' },
        include: { recipe: true },
      },
    },
  });

  res.json({ success: true, data: updated });
}));

// ─── DELETE /slot/:id — Remove a meal slot ────────────────────────────────
router.delete('/slot/:id', asyncHandler(async (req, res) => {
  const slot = await prisma.mealSlot.deleteMany({
    where: { id: req.params.id, userId: DEV_USER_ID },
  });
  if (slot.count === 0) {
    return res.status(404).json({ success: false, error: 'Meal slot not found' });
  }
  res.json({ success: true, data: null });
}));

// ─── POST /slot/:slotId/dish — Add a dish to an existing slot ──────────────
router.post('/slot/:slotId/dish', asyncHandler(async (req, res) => {
  const { slotId } = req.params;
  const { recipeId, customName, calories, protein, carbs, fat } = req.body;

  // Verify ownership
  const slot = await prisma.mealSlot.findFirst({
    where: { id: slotId, userId: DEV_USER_ID },
  });
  if (!slot) {
    return res.status(404).json({ success: false, error: 'Meal slot not found' });
  }

  const maxOrder = await prisma.mealSlotDish.aggregate({
    where: { mealSlotId: slotId },
    _max: { sortOrder: true },
  });

  const dish = await prisma.mealSlotDish.create({
    data: {
      mealSlotId: slotId,
      recipeId: recipeId || null,
      customName: customName || null,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      sortOrder: (maxOrder._max.sortOrder || -1) + 1,
    },
    include: { recipe: true },
  });

  res.status(201).json({ success: true, data: dish });
}));

// ─── DELETE /dish/:id — Remove a dish from a slot ─────────────────────────
router.delete('/dish/:id', asyncHandler(async (req, res) => {
  // Verify ownership through the parent slot
  const dish = await prisma.mealSlotDish.findUnique({
    where: { id: req.params.id },
    include: { mealSlot: true },
  });
  if (!dish || dish.mealSlot.userId !== DEV_USER_ID) {
    return res.status(404).json({ success: false, error: 'Dish not found' });
  }

  await prisma.mealSlotDish.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: null });
}));

module.exports = router;