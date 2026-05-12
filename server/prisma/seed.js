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
  await prisma.mealSlotDish.deleteMany();
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
      dietaryPreferences: ['balanced'],
      cuisinePreferences: ['Vietnamese', 'Italian'],
      allergies: [],
      familySize: 3,
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
      tags: ['Italian', 'Chicken', 'Pasta'],
      ingredients: recipe1Ingredients,
      steps: recipe1Steps,
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
      tags: ['Seafood', 'Tacos', 'Quick'],
      ingredients: recipe2Ingredients,
      steps: recipe2Steps,
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
      tags: ['Seafood', 'Quick', 'Healthy'],
      ingredients: recipe3Ingredients,
      steps: recipe3Steps,
      source: 'MANUAL',
      isFavorite: false,
    },
  });

  console.log('[seed]   Created 3 sample recipes');

  // ─── Pantry Items ────────────────────────────────────────────

  console.log('[seed] Creating pantry items...');

  const pantryItems = [
    // Vietnamese-style ingredients for Mâm cơm
    { name: 'Chicken Breast', category: 'Proteins', quantity: 1.2, unit: 'kg', expiry: daysFromNow(5) },
    { name: 'Pork Belly', category: 'Proteins', quantity: 500, unit: 'g', expiry: daysFromNow(4) },
    { name: 'Shrimp', category: 'Proteins', quantity: 300, unit: 'g', expiry: daysFromNow(2) },
    { name: 'Firm Tofu', category: 'Proteins', quantity: 2, unit: 'pieces', expiry: daysFromNow(7) },
    { name: 'Garlic', category: 'Vegetables', quantity: 5, unit: 'cloves', expiry: daysFromNow(21) },
    { name: 'Green Onion', category: 'Vegetables', quantity: 1, unit: 'bunch', expiry: daysFromNow(5) },
    { name: 'Morning Glory (Rau Muống)', category: 'Vegetables', quantity: 500, unit: 'g', expiry: daysFromNow(3) },
    { name: 'Bok Choy', category: 'Vegetables', quantity: 300, unit: 'g', expiry: daysFromNow(4) },
    { name: 'Tomato', category: 'Fruits', quantity: 4, unit: 'pieces', expiry: daysFromNow(10) },
    { name: 'Lemon', category: 'Fruits', quantity: 4, unit: 'pieces', expiry: daysFromNow(14) },
    { name: 'Jasmine Rice', category: 'Grains', quantity: 5, unit: 'kg', expiry: daysFromNow(180) },
    { name: 'Rice Noodles', category: 'Grains', quantity: 1, unit: 'kg', expiry: daysFromNow(90) },
    { name: 'Eggs', category: 'Proteins', quantity: 12, unit: 'pieces', expiry: daysFromNow(21) },
    { name: 'Fish Sauce', category: 'OilsAndCondiments', quantity: 500, unit: 'ml', expiry: daysFromNow(180) },
    { name: 'Soy Sauce', category: 'OilsAndCondiments', quantity: 300, unit: 'ml', expiry: daysFromNow(120) },
    { name: 'Cooking Oil', category: 'OilsAndCondiments', quantity: 1, unit: 'L', expiry: daysFromNow(90) },
    { name: 'Oyster Sauce', category: 'OilsAndCondiments', quantity: 200, unit: 'ml', expiry: daysFromNow(60) },
    { name: 'Onion', category: 'Vegetables', quantity: 5, unit: 'pieces', expiry: daysFromNow(30) },
  ];

  for (const item of pantryItems) {
    await prisma.pantryItem.create({
      data: { userId, ...item },
    });
  }

  console.log(`[seed]   Created ${pantryItems.length} pantry items`);

  // ─── Weekly Meal Plan (Multi-dish "Mâm cơm Việt" style) ────────

  console.log('[seed] Creating weekly meal plan with Vietnamese multi-dish meals...');

  const today = new Date();
  const monday = getMondayOfWeek(today);

  /**
   * Helper: Create a meal slot with multiple dishes.
   */
  const createMealSlot = async (day, mealType, dishes, synced = false) => {
    const slot = await prisma.mealSlot.create({
      data: { userId, weekStart: monday, day, mealType, synced },
    });
    for (const dish of dishes) {
      await prisma.mealSlotDish.create({
        data: {
          mealSlotId: slot.id,
          recipeId: dish.recipeId || null,
          customName: dish.customName || null,
          calories: dish.calories || 0,
          protein: dish.protein || 0,
          carbs: dish.carbs || 0,
          fat: dish.fat || 0,
          sortOrder: dish.sortOrder || 0,
        },
      });
    }
    return slot;
  };

  // Monday Lunch — Traditional Vietnamese mâm cơm
  await createMealSlot('Mon', 'Lunch', [
    { customName: 'Steamed Jasmine Rice (Cơm trắng)', calories: 200, protein: 4, carbs: 44, fat: 0, sortOrder: 0 },
    { customName: 'Morning Glory Soup (Canh rau muống)', calories: 85, protein: 3, carbs: 8, fat: 2, sortOrder: 1 },
    { customName: 'Braised Pork Belly (Thịt kho tàu)', calories: 380, protein: 22, carbs: 8, fat: 30, sortOrder: 2 },
    { customName: 'Stir-fried Tofu with Tomato Sauce', calories: 180, protein: 12, carbs: 10, fat: 10, sortOrder: 3 },
  ]);

  // Monday Dinner
  await createMealSlot('Mon', 'Dinner', [
    { customName: 'Steamed Jasmine Rice (Cơm trắng)', calories: 200, protein: 4, carbs: 44, fat: 0, sortOrder: 0 },
    { recipeId: recipe1.id, calories: 520, protein: 38, carbs: 12, fat: 34, sortOrder: 1 },
    { customName: 'Stir-fried Bok Choy with Garlic', calories: 80, protein: 3, carbs: 6, fat: 5, sortOrder: 2 },
  ]);

  // Tuesday Lunch
  await createMealSlot('Tue', 'Lunch', [
    { customName: 'Steamed Jasmine Rice (Cơm trắng)', calories: 200, protein: 4, carbs: 44, fat: 0, sortOrder: 0 },
    { customName: 'Sour Fish Soup (Canh chua cá)', calories: 150, protein: 18, carbs: 10, fat: 4, sortOrder: 1 },
    { recipeId: recipe3.id, calories: 450, protein: 42, carbs: 8, fat: 28, sortOrder: 2 },
    { customName: 'Pickled Vegetables (Dưa chua)', calories: 30, protein: 1, carbs: 6, fat: 0, sortOrder: 3 },
  ]);

  // Tuesday Dinner
  await createMealSlot('Tue', 'Dinner', [
    { customName: 'Steamed Jasmine Rice (Cơm trắng)', calories: 200, protein: 4, carbs: 44, fat: 0, sortOrder: 0 },
    { customName: 'Vegetable Soup (Canh rau củ)', calories: 90, protein: 3, carbs: 12, fat: 2, sortOrder: 1 },
    { recipeId: recipe2.id, calories: 380, protein: 28, carbs: 32, fat: 18, sortOrder: 2 },
    { customName: 'Fried Egg (Trứng chiên)', calories: 120, protein: 8, carbs: 1, fat: 9, sortOrder: 3 },
  ]);

  // Wednesday Lunch
  await createMealSlot('Wed', 'Lunch', [
    { customName: 'Steamed Jasmine Rice (Cơm trắng)', calories: 200, protein: 4, carbs: 44, fat: 0, sortOrder: 0 },
    { customName: 'Shrimp and Tofu Soup', calories: 120, protein: 14, carbs: 6, fat: 4, sortOrder: 1 },
    { customName: 'Caramelized Chicken (Gà kho gừng)', calories: 350, protein: 35, carbs: 10, fat: 18, sortOrder: 2 },
    { customName: 'Boiled Morning Glory (Rau muống luộc)', calories: 50, protein: 2, carbs: 6, fat: 0, sortOrder: 3 },
  ]);

  // Wednesday Dinner
  await createMealSlot('Wed', 'Dinner', [
    { customName: 'Steamed Jasmine Rice (Cơm trắng)', calories: 200, protein: 4, carbs: 44, fat: 0, sortOrder: 0 },
    { customName: 'Crab and Asparagus Soup (Súp măng cua)', calories: 180, protein: 12, carbs: 15, fat: 8, sortOrder: 1 },
    { recipeId: recipe1.id, calories: 520, protein: 38, carbs: 12, fat: 34, sortOrder: 2 },
  ]);

  // Thursday — breakfast & lunch
  await createMealSlot('Thu', 'Breakfast', [
    { customName: 'Chicken Pho (Phở gà)', calories: 450, protein: 28, carbs: 55, fat: 12, sortOrder: 0 },
  ]);

  await createMealSlot('Thu', 'Lunch', [
    { customName: 'Steamed Jasmine Rice (Cơm trắng)', calories: 200, protein: 4, carbs: 44, fat: 0, sortOrder: 0 },
    { customName: 'Stir-fried Beef with Onion (Bò xào hành)', calories: 320, protein: 30, carbs: 12, fat: 18, sortOrder: 1 },
    { customName: 'Tomato and Egg Soup (Canh cà chua trứng)', calories: 110, protein: 7, carbs: 8, fat: 5, sortOrder: 2 },
  ]);

  console.log('[seed]   Created multi-dish Vietnamese meal slots');

  // ─── Calorie Entries (Today) ─────────────────────────────────

  console.log('[seed] Creating calorie entries for today...');

  const todayDate = daysFromNow(0);

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
      filters: { mealType: 'Dinner', cookTime: 30, skill: 'Medium', chefMode: 'gourmet' },
      resultName: 'Creamy Tuscan Chicken',
      resultData: generationResultData,
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