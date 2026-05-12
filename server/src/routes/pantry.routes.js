// server/src/routes/pantry.routes.js
// Pantry item CRUD + grocery scanning endpoints.
const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Auth disabled for development
const DEV_USER_ID = 'dev-user';

// List all pantry items
router.get('/', asyncHandler(async (req, res) => {
  const { category, search } = req.query;

  const where = { userId: DEV_USER_ID };
  if (category && category !== 'All') {
    where.category = category;
  }
  if (search) {
    where.name = { contains: search };
  }

  const items = await prisma.pantryItem.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: items });
}));

// Get pantry stats
router.get('/stats', asyncHandler(async (req, res) => {
  const items = await prisma.pantryItem.findMany({ where: { userId: DEV_USER_ID } });
  const now = new Date();
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const expiringSoon = items.filter((i) => new Date(i.expiry) <= threeDays && new Date(i.expiry) >= now).length;
  const expired = items.filter((i) => new Date(i.expiry) < now).length;

  res.json({
    success: true,
    data: { total: items.length, expiringSoon, expired },
  });
}));

// Add a pantry item
router.post('/', asyncHandler(async (req, res) => {
  const { name, category, quantity, unit, expiry } = req.body;
  const item = await prisma.pantryItem.create({
    data: {
      userId: DEV_USER_ID,
      name,
      category: category || 'Other',
      quantity: quantity || 1,
      unit: unit || 'pieces',
      expiry: new Date(expiry),
    },
  });
  res.status(201).json({ success: true, data: item });
}));

// Bulk add pantry items (from receipt scanning)
router.post('/bulk', asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, error: 'Items array is required' });
  }

  const created = [];
  for (const item of items) {
    const expiryDays = item.estimatedExpiryDays || 7;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);

    const created_item = await prisma.pantryItem.create({
      data: {
        userId: DEV_USER_ID,
        name: item.name,
        category: item.category || 'Other',
        quantity: item.quantity || 1,
        unit: item.unit || 'pieces',
        expiry,
      },
    });
    created.push(created_item);
  }

  res.status(201).json({ success: true, data: created });
}));

// Update a pantry item
router.patch('/:id', asyncHandler(async (req, res) => {
  const item = await prisma.pantryItem.updateMany({
    where: { id: req.params.id, userId: DEV_USER_ID },
    data: req.body,
  });
  if (item.count === 0) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  const updated = await prisma.pantryItem.findUnique({ where: { id: req.params.id } });
  res.json({ success: true, data: updated });
}));

// Delete a pantry item
router.delete('/:id', asyncHandler(async (req, res) => {
  const item = await prisma.pantryItem.deleteMany({
    where: { id: req.params.id, userId: DEV_USER_ID },
  });
  if (item.count === 0) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }
  res.json({ success: true, data: null });
}));

module.exports = router;