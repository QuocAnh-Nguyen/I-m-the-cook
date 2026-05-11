// server/prisma/seed.js
// Seeds the database with a demo user and sample data for development.
//
// Usage: node prisma/seed.js
// Or via npm: npm run db:seed

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

const getMondayOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  return d;
};

const daysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
};

const dateString = (date) => {
  return date.toISOString().split('T')[0];
};

// ─────────────────────────────────────────────────────────────────
// Main seed function
// ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('[seed] Clearing existing data...');

  // Order matters: delete children first to avoid FK violations
  await prisma.generationHistory.deleteMany();
  await prisma.mealSlot.deleteMany();
  await prisma.calorieEntry.deleteMany();
  await prisma.shoppingItem.deleteMany();
  await prisma.pantryItem.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.user.deleteMany();

  console.log('[seed] Creating demo user...');

  const passwordHash = await bcrypt.hash('demo1234', 12);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@chefone.app',
      passwordHash,
      name: 'Demo Chef',
      calorieGoal: 2000,
      proteinGoal: 150,
      carbsGoal: 250,
      fatGoal: 65,
    },
  });

  const userId = demoUser.id;
  console.log(`[seed]   Demo user created: ${demoUser.id}`);

  // ─── Sample Recipes ──────────────────────────────────────────

  console.log('[seed] Creating sample recipes...');

  const recipe1Ingredients = [
    { amount: '4', unit: 'pieces', name: 'Chicken Breast' },
    { amount: '3', unit: 'cloves', name: 'Garlic' },
    { amount: '200', unit: 'ml', name: 'Heavy Cream' },
    { amount: '50', unit: 'g', name: 'Parmesan Cheese' },
    { amount: '1', unit: 'cup', name: 'Sun-dried Tomatoes' },
    { amount: '2', unit: 'cups', name: 'Fresh Spinach' },
    { amount: '2', unit: 'tbsp', name: 'Olive Oil' },
    { amount: '1', unit: 'tsp', name: 'Italian Seasoning' },
  ];

  const recipe1Steps = [
    'Season chicken breasts with salt, pepper, and Italian seasoning.',
    'Heat olive oil in a large skillet over medium-high heat. Sear chicken 4-5 min per side until golden. Remove and set aside.',
    'In the same skillet, sauté minced garlic for 1 minute until fragrant.',
    'Add sun-dried tomatoes and spinach. Cook until spinach wilts (~2 min).',
    'Pour in heavy cream and grated Parmesan. Stir until cheese melts and sauce thickens.',
    'Return chicken to the skillet. Spoon sauce over the top. Simmer 5 min.',
    'Serve over pasta, rice, or with crusty bread.',
  ];

  const recipe1 = await prisma.recipe.create({
    data: {
      userId,
      name: 'Creamy Tuscan Chicken',
      prepTime: '10 min',
      cookTime: '25 min',
      servings: 4,
      difficulty: 'Medium',
      calories: 520,
      protein: 38,
      carbs: 12,
      fat: 34,
      fiber: 2,
      tags: JSON.stringify(['Italian', 'Chicken', 'Pasta']),
      ingredients: JSON.stringify(recipe1Ingredients),
      steps: JSON.stringify(recipe1Steps),
      source: 'MANUAL',
      isFavorite: true,
    },
  });

  const recipe2Ingredients = [
    { amount: '500', unit: 'g', name: 'Shrimp' },
    { amount: '2', unit: 'pieces', name: 'Avocado' },
    { amount: '8', unit: 'pieces', name: 'Corn Tortillas' },
    { amount: '1', unit: 'cup', name: 'Shredded Cabbage' },
    { amount: '2', unit: 'tbsp', name: 'Lime Juice' },
    { amount: '3', unit: 'tbsp', name: 'Sour Cream' },
    { amount: '1', unit: 'tsp', name: 'Chili Powder' },
    { amount: '0.25', unit: 'cup', name: 'Fresh Cilantro' },
  ];

  const recipe2Steps = [
    'Season shrimp with chili powder, salt, and lime juice.',
    'Heat a skillet over medium-high heat. Cook shrimp 2-3 min per side until pink.',
    'Warm corn tortillas in a dry pan or directly over a gas flame.',
    'Slice avocado into thin strips.',
    'Assemble tacos: tortilla, shredded cabbage, shrimp, avocado slices.',
    'Top with a dollop of sour cream and fresh cilantro.',
    'Serve with lime wedges on the side.',
  ];

  const recipe2 = await prisma.recipe.create({
    data: {
      userId,
      name: 'Avocado Shrimp Tacos',
      prepTime: '15 min',
      cookTime: '8 min',
      servings: 4,
      difficulty: 'Easy',
      calories: 380,
      protein: 28,
      carbs: 32,
      fat: 18,
      fiber: 6,
      tags: JSON.stringify(['Seafood', 'Tacos', 'Quick']),
      ingredients: JSON.stringify(recipe2Ingredients),
      steps: JSON.stringify(recipe2Steps),
      source: 'AI_GENERATED',
      isFavorite: true,
    },
  });

  const recipe3Ingredients = [
    { amount: '2', unit: 'pieces', name: 'Salmon Fillets' },
    { amount: '1', unit: 'piece', name: 'Lemon' },
    { amount: '3', unit: 'cloves', name: 'Garlic' },
    { amount: '2', unit: 'tbsp', name: 'Butter' },
    { amount: '1', unit: 'tbsp', name: 'Fresh Dill' },
    { amount: '1', unit: 'tbsp', name: 'Olive Oil' },
    { amount: '1', unit: 'cup', name: 'Asparagus' },
  ];

  const recipe3Steps = [
    'Preheat oven to 400°F (200°C). Line a baking sheet with parchment.',
    'Place salmon fillets and asparagus on the sheet. Drizzle with olive oil.',
    'Melt butter with minced garlic. Pour over salmon.',
    'Top salmon with lemon slices and fresh dill. Season with salt and pepper.',
    'Bake for 15-20 min until salmon flakes easily with a fork.',
    'Serve immediately with roasted asparagus.',
  ];

  const recipe3 = await prisma.recipe.create({
    data: {
      userId,
      name: 'Lemon Herb Salmon',
      prepTime: '10 min',
      cookTime: '20 min',
      servings: 2,
      difficulty: 'Easy',
      calories: 450,
      protein: 42,
      carbs: 8,
      fat: 28,
      fiber: 2,
      tags: JSON.stringify(['Seafood', 'Quick', 'Healthy']),
      ingredients: JSON.stringify(recipe3Ingredients),
      steps: JSON.stringify(recipe3Steps),
      source: 'MANUAL',
      isFavorite: false,
    },
  });

  console.log('[seed]   Created 3 sample recipes');

  // ─── Pantry Items ────────────────────────────────────────────

  console.log('[seed] Creating pantry items...');

  const pantryItems = [
    { name: 'Chicken Breast', category: 'Proteins', quantity: 1.2, unit: 'kg', expiry: daysFromNow(5) },
    { name: 'Garlic', category: 'Vegetables', quantity: 3, unit: 'pieces', expiry: daysFromNow(21) },
    { name: 'Olive Oil', category: 'OilsAndCondiments', quantity: 500, unit: 'ml', expiry: daysFromNow(90) },
    { name: 'Heavy Cream', category: 'Dairy', quantity: 200, unit: 'ml', expiry: daysFromNow(7) },
    { name: 'Parmesan Cheese', category: 'Dairy', quantity: 150, unit: 'g', expiry: daysFromNow(14) },
    { name: 'Fresh Spinach', category: 'Vegetables', quantity: 250, unit: 'g', expiry: daysFromNow(3) },
    { name: 'Lemon', category: 'Fruits', quantity: 4, unit: 'pieces', expiry: daysFromNow(14) },
    { name: 'Rice', category: 'Grains', quantity: 2, unit: 'kg', expiry: daysFromNow(180) },
    { name: 'Eggs', category: 'Proteins', quantity: 12, unit: 'pieces', expiry: daysFromNow(21) },
    { name: 'Butter', category: 'Dairy', quantity: 250, unit: 'g', expiry: daysFromNow(30) },
    { name: 'Onion', category: 'Vegetables', quantity: 5, unit: 'pieces', expiry: daysFromNow(30) },
    { name: 'Tomato Sauce', category: 'OilsAndCondiments', quantity: 400, unit: 'ml', expiry: daysFromNow(60) },
  ];

  for (const item of pantryItems) {
    await prisma.pantryItem.create({
      data: { userId, ...item },
    });
  }

  console.log(`[seed]   Created ${pantryItems.length} pantry items`);

  // ─── Weekly Meal Plan ────────────────────────────────────────

  console.log('[seed] Creating weekly meal plan...');

  const today = new Date();
  const monday = getMondayOfWeek(today);

  const mealSlots = [
    { day: 'Mon', mealType: 'Breakfast', recipeId: null, customName: 'Oatmeal with Berries', calories: 350 },
    { day: 'Mon', mealType: 'Lunch', recipeId: null, customName: 'Chicken Salad Wrap', calories: 480 },
    { day: 'Mon', mealType: 'Dinner', recipeId: recipe1.id, customName: null, calories: 520 },
    { day: 'Tue', mealType: 'Breakfast', recipeId: null, customName: 'Greek Yogurt Parfait', calories: 300 },
    { day: 'Tue', mealType: 'Lunch', recipeId: null, customName: 'Leftover Tuscan Chicken', calories: 520 },
    { day: 'Tue', mealType: 'Dinner', recipeId: recipe3.id, customName: null, calories: 450 },
    { day: 'Wed', mealType: 'Breakfast', recipeId: null, customName: 'Scrambled Eggs on Toast', calories: 400 },
    { day: 'Wed', mealType: 'Lunch', recipeId: recipe2.id, customName: null, calories: 380 },
    { day: 'Wed', mealType: 'Dinner', recipeId: null, customName: 'Grilled Steak with Veggies', calories: 650 },
    { day: 'Thu', mealType: 'Breakfast', recipeId: null, customName: 'Smoothie Bowl', calories: 320 },
    { day: 'Thu', mealType: 'Dinner', recipeId: recipe1.id, customName: null, calories: 520 },
  ];

  for (const slot of mealSlots) {
    await prisma.mealSlot.create({
      data: { userId, weekStart: monday, ...slot },
    });
  }

  console.log(`[seed]   Created ${mealSlots.length} meal slots`);

  // ─── Calorie Entries (Today) ─────────────────────────────────

  console.log('[seed] Creating calorie entries for today...');

  const todayDate = dateString(daysFromNow(0));

  const calorieEntries = [
    { date: todayDate, mealType: 'Breakfast', foodName: 'Oatmeal with Berries', quantity: 1, unit: 'serving', calories: 350, protein: 12, carbs: 55, fat: 8 },
    { date: todayDate, mealType: 'Lunch', foodName: 'Chicken Salad Wrap', quantity: 1, unit: 'serving', calories: 480, protein: 35, carbs: 40, fat: 18 },
    { date: todayDate, mealType: 'Dinner', foodName: 'Creamy Tuscan Chicken', quantity: 1, unit: 'serving', calories: 520, protein: 38, carbs: 12, fat: 34 },
    { date: todayDate, mealType: 'Snack', foodName: 'Protein Bar', quantity: 1, unit: 'pieces', calories: 200, protein: 20, carbs: 22, fat: 6 },
    { date: todayDate, mealType: 'Snack', foodName: 'Apple', quantity: 1, unit: 'pieces', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  ];

  for (const entry of calorieEntries) {
    await prisma.calorieEntry.create({
      data: { userId, ...entry },
    });
  }

  console.log(`[seed]   Created ${calorieEntries.length} calorie entries`);

  // ─── Shopping Items ──────────────────────────────────────────

  console.log('[seed] Creating shopping items...');

  const shoppingItems = [
    { name: 'Chicken Breast', category: 'Proteins', quantity: '500g' },
    { name: 'Fresh Spinach', category: 'Produce', quantity: '1 bag' },
    { name: 'Heavy Cream', category: 'Dairy', quantity: '200ml' },
    { name: 'Garlic', category: 'Produce', quantity: '1 head' },
    { name: 'Lemon', category: 'Produce', quantity: '3 pieces' },
    { name: 'Parmesan Cheese', category: 'Dairy', quantity: '200g' },
    { name: 'Olive Oil', category: 'Pantry', quantity: '500ml', checked: true },
    { name: 'Rice', category: 'Pantry', quantity: '2kg' },
    { name: 'Canned Tomatoes', category: 'Pantry', quantity: '2 cans' },
    { name: 'Butter', category: 'Dairy', quantity: '250g', checked: true },
  ];

  for (const item of shoppingItems) {
    await prisma.shoppingItem.create({
      data: { userId, ...item },
    });
  }

  console.log(`[seed]   Created ${shoppingItems.length} shopping items`);

  // ─── Generation History ──────────────────────────────────────

  console.log('[seed] Creating generation history...');

  const generationResultData = {
    name: 'Creamy Tuscan Chicken',
    prepTime: '10 min',
    cookTime: '25 min',
    servings: 4,
    difficulty: 'Medium',
    calories: 520,
    protein: 38,
    carbs: 12,
    fat: 34,
    ingredients: recipe1Ingredients,
    steps: recipe1Steps,
  };

  await prisma.generationHistory.create({
    data: {
      userId,
      prompt: 'Chicken, garlic, olive oil, spinach, tomatoes, cream',
      filters: JSON.stringify({ mealType: 'Dinner', cookTime: 30, skill: 'Medium', chefMode: 'gourmet' }),
      resultName: 'Creamy Tuscan Chicken',
      resultData: JSON.stringify(generationResultData),
      status: 'SAVED',
      savedRecipeId: recipe1.id,
    },
  });

  console.log('[seed]   Created 1 generation history entry');

  console.log('[seed] Seed complete!');
}

main()
  .catch((e) => {
    console.error('[seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });