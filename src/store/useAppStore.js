/**
 * ============================================================================
 * ChefOne — Global State Management with Zustand
 * ============================================================================
 *
 * State Management Solution: ZUSTAND
 * 
 * Why Zustand?
 * - Minimal boilerplate compared to Redux Toolkit
 * - No need for providers/context wrappers
 * - Built-in selector support for performance
 * - Works seamlessly with React 19
 * - Supports middleware (persist, devtools) out of the box
 *
 * Architecture:
 * This single store acts as the "source of truth" for all inter-module
 * data flows. Each module (Pantry, Recipes, Meal Planner, Calorie Tracker)
 * dispatches actions to update state, and subscribes to the slices it needs.
 *
 * Data Flow Map:
 *   Pantry ──────► AI Recipe Generator (auto-extract ingredients)
 *   AI Generator ─► My Recipes (save with "AI Generated" badge)
 *   My Recipes ───► Meal Planner (recipe picker modal)
 *   Meal Planner ─► Calorie Tracker (log planned meals)
 *   Meal Planner + Pantry ─► Grocery List (diffing function)
 *   Calorie Tracker ──► Nutrition Analytics (reactive charts)
 *   ALL Modules ──► Dashboard (aggregated metrics + alerts)
 * ============================================================================
 */

import { create } from "zustand";
import { initialPantryItems } from "views/admin/pantry/variables/mockData";

// ─── Helper: Check expiry status ───────────────────────────────────────────
const isExpired = (expiryDate) => {
  return new Date(expiryDate) < new Date();
};

// ─── Helper: Get today's day key for meal planner ──────────────────────────
const getTodayDayKey = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date().getDay()];
};

// ─── Helper: Get current ISO date string ───────────────────────────────────
const toISODate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split("T")[0];
};

// ─── Initial Recipes ───────────────────────────────────────────────────────
const initialRecipes = [
  {
    id: 1,
    name: "Creamy Tuscan Chicken",
    prepTime: "10 min",
    cookTime: "25 min",
    servings: 4,
    difficulty: "Easy",
    calories: 520,
    protein: 42,
    carbs: 18,
    fat: 30,
    tags: ["Italian", "High Protein", "Creamy"],
    ingredients: [
      { amount: "4", unit: "pieces", name: "chicken breasts" },
      { amount: "1 cup", unit: "", name: "heavy cream" },
      { amount: "1 cup", unit: "", name: "cherry tomatoes, halved" },
      { amount: "3 cups", unit: "", name: "fresh spinach" },
      { amount: "4 cloves", unit: "", name: "garlic, minced" },
      { amount: "1/2 cup", unit: "", name: "parmesan cheese, grated" },
      { amount: "2 tbsp", unit: "", name: "olive oil" },
    ],
    notes: "Family favourite. Add extra spinach for more greens.",
    source: "AI Generated",
    savedAt: "2026-05-10",
  },
  {
    id: 2,
    name: "Avocado Shrimp Tacos",
    prepTime: "15 min",
    cookTime: "10 min",
    servings: 2,
    difficulty: "Easy",
    calories: 380,
    protein: 28,
    carbs: 32,
    fat: 16,
    tags: ["Mexican", "Seafood", "Fresh"],
    ingredients: [
      { amount: "200g", unit: "", name: "shrimp" },
      { amount: "1", unit: "", name: "avocado" },
      { amount: "4", unit: "", name: "corn tortillas" },
      { amount: "1", unit: "", name: "lime" },
    ],
    notes: "Great for summer. Use corn tortillas for GF option.",
    source: "AI Generated",
    savedAt: "2026-05-09",
  },
  {
    id: 3,
    name: "Lemon Herb Salmon",
    prepTime: "10 min",
    cookTime: "20 min",
    servings: 2,
    difficulty: "Medium",
    calories: 460,
    protein: 38,
    carbs: 8,
    fat: 28,
    tags: ["Seafood", "Keto", "Healthy"],
    ingredients: [
      { amount: "2", unit: "fillets", name: "salmon" },
      { amount: "1", unit: "", name: "lemon" },
      { amount: "2 tbsp", unit: "", name: "olive oil" },
      { amount: "1 tsp", unit: "", name: "dill" },
    ],
    notes: "Best with asparagus on the side.",
    source: "Manual",
    savedAt: "2026-05-08",
  },
];

// ─── Initial Weekly Plan ───────────────────────────────────────────────────
const initialWeeklyPlan = {
  "Mon-Breakfast": { recipeId: 1, name: "Avocado Toast with Egg", calories: 320, protein: 18, carbs: 28, fat: 16 },
  "Mon-Lunch": { recipeId: 3, name: "Chicken Caesar Salad", calories: 410, protein: 35, carbs: 12, fat: 24 },
  "Mon-Dinner": { recipeId: 5, name: "Spaghetti Carbonara", calories: 620, protein: 28, carbs: 65, fat: 28 },
  "Tue-Breakfast": { recipeId: 12, name: "Overnight Oats", calories: 340, protein: 12, carbs: 55, fat: 8 },
  "Tue-Lunch": { recipeId: 4, name: "Grilled Salmon with Quinoa", calories: 540, protein: 42, carbs: 38, fat: 22 },
  "Tue-Dinner": { recipeId: 6, name: "Creamy Tuscan Chicken", calories: 520, protein: 42, carbs: 18, fat: 30 },
  "Tue-Snack": { recipeId: 10, name: "Hummus & Veggie Sticks", calories: 150, protein: 6, carbs: 18, fat: 7 },
  "Wed-Breakfast": { recipeId: 2, name: "Greek Yogurt & Berries", calories: 180, protein: 15, carbs: 22, fat: 4 },
  "Wed-Dinner": { recipeId: 8, name: "Thai Green Curry", calories: 480, protein: 28, carbs: 35, fat: 25 },
  "Thu-Lunch": { recipeId: 11, name: "Tomato Basil Soup", calories: 250, protein: 8, carbs: 32, fat: 10 },
  "Thu-Dinner": { recipeId: 7, name: "Mushroom Risotto", calories: 570, protein: 16, carbs: 72, fat: 22 },
  "Fri-Breakfast": { recipeId: 9, name: "Protein Smoothie", calories: 220, protein: 30, carbs: 18, fat: 4 },
  "Fri-Lunch": { recipeId: 3, name: "Chicken Caesar Salad", calories: 410, protein: 35, carbs: 12, fat: 24 },
  "Fri-Dinner": { recipeId: 4, name: "Grilled Salmon with Quinoa", calories: 540, protein: 42, carbs: 38, fat: 22 },
  "Sat-Breakfast": { recipeId: 1, name: "Avocado Toast with Egg", calories: 320, protein: 18, carbs: 28, fat: 16 },
  "Sat-Lunch": { recipeId: 7, name: "Mushroom Risotto", calories: 570, protein: 16, carbs: 72, fat: 22 },
  "Sat-Dinner": { recipeId: 5, name: "Spaghetti Carbonara", calories: 620, protein: 28, carbs: 65, fat: 28 },
  "Sat-Snack": { recipeId: 2, name: "Greek Yogurt & Berries", calories: 180, protein: 15, carbs: 22, fat: 4 },
  "Sun-Breakfast": { recipeId: 12, name: "Overnight Oats", calories: 340, protein: 12, carbs: 55, fat: 8 },
  "Sun-Dinner": { recipeId: 6, name: "Creamy Tuscan Chicken", calories: 520, protein: 42, carbs: 18, fat: 30 },
};

// ─── Next ID counters ──────────────────────────────────────────────────────
let nextPantryId = initialPantryItems.length + 1;
let nextRecipeId = initialRecipes.length + 1;
let nextCalorieEntryId = 1;

// ─── MEAL_TYPES constant ───────────────────────────────────────────────────
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

// ============================================================================
// ZUSTAND STORE
// ============================================================================
const useAppStore = create((set, get) => ({

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTRY STATE
  // Manages the user's ingredient inventory. Other modules read from this
  // to auto-populate ingredients (Recipe Generator) and diff grocery lists.
  // ═══════════════════════════════════════════════════════════════════════════
  pantryItems: initialPantryItems,

  addPantryItem: (item) =>
    set((state) => ({
      pantryItems: [...state.pantryItems, { id: nextPantryId++, ...item }],
    })),

  addPantryItems: (items) =>
    set((state) => ({
      pantryItems: [
        ...state.pantryItems,
        ...items.map((item) => ({ id: nextPantryId++, ...item })),
      ],
    })),

  updatePantryItem: (id, data) =>
    set((state) => ({
      pantryItems: state.pantryItems.map((i) =>
        i.id === id ? { ...i, ...data } : i
      ),
    })),

  removePantryItem: (id) =>
    set((state) => ({
      pantryItems: state.pantryItems.filter((i) => i.id !== id),
    })),

  /**
   * Derived: Get pantry items sorted by expiry (soonest first).
   * Used by AI Recipe Generator to prioritize expiring ingredients.
   */
  getPantryItemsSortedByExpiry: () => {
    const items = get().pantryItems;
    return [...items].sort(
      (a, b) => new Date(a.expiry) - new Date(b.expiry)
    );
  },

  /**
   * Derived: Get items expiring within N days.
   * Used by Dashboard for urgent alerts.
   */
  getExpiringItems: (days = 3) => {
    const today = new Date();
    return get().pantryItems.filter((item) => {
      const expiry = new Date(item.expiry);
      const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return diff <= days && diff >= 0;
    });
  },

  getExpiredItems: () => {
    return get().pantryItems.filter((item) => isExpired(item.expiry));
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RECIPES STATE
  // Central recipe database. AI Generator pushes new recipes here.
  // Meal Planner reads from here to populate the recipe picker modal.
  // ═══════════════════════════════════════════════════════════════════════════
  recipes: initialRecipes,

  addRecipe: (recipe) =>
    set((state) => ({
      recipes: [{ id: nextRecipeId++, ...recipe }, ...state.recipes],
    })),

  updateRecipe: (id, data) =>
    set((state) => ({
      recipes: state.recipes.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
    })),

  removeRecipe: (id) =>
    set((state) => ({
      recipes: state.recipes.filter((r) => r.id !== id),
    })),

  /**
   * Save AI-generated recipe to My Recipes.
   * Auto-assigns "AI Generated" source badge.
   * Flow: AI Recipe Generator → My Recipes (Phase 2.B)
   */
  saveAIRecipe: (generatedRecipe) => {
    const recipe = {
      name: generatedRecipe.name,
      prepTime: generatedRecipe.prepTime,
      cookTime: generatedRecipe.cookTime,
      servings: generatedRecipe.servings,
      difficulty: generatedRecipe.difficulty,
      calories: generatedRecipe.calories,
      protein: generatedRecipe.nutrition?.protein || 0,
      carbs: generatedRecipe.nutrition?.carbs || 0,
      fat: generatedRecipe.nutrition?.fat || 0,
      tags: generatedRecipe.tags || [],
      ingredients: generatedRecipe.ingredients || [],
      notes: "",
      source: "AI Generated",
      savedAt: toISODate(new Date()),
    };
    set((state) => ({
      recipes: [{ id: nextRecipeId++, ...recipe }, ...state.recipes],
    }));
    return recipe;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEAL PLANNER STATE
  // Weekly plan keyed by "Day-MealType". Reads recipes from the store.
  // Feeds into Calorie Tracker (planned meal quick-log) and Grocery List.
  // ═══════════════════════════════════════════════════════════════════════════
  weeklyPlan: initialWeeklyPlan,
  selectedWeekOffset: 0, // 0 = current week, +1 = next week, etc.

  setWeekOffset: (offset) => set({ selectedWeekOffset: offset }),

  assignMeal: (key, meal) =>
    set((state) => ({
      weeklyPlan: { ...state.weeklyPlan, [key]: meal },
    })),

  removeMeal: (key) =>
    set((state) => {
      const next = { ...state.weeklyPlan };
      delete next[key];
      return { weeklyPlan: next };
    }),

  /**
   * Get today's planned meals for the Calorie Tracker quick-log.
   * Flow: Meal Planner → Calorie Tracker (Phase 2.E)
   */
  getTodayPlannedMeals: () => {
    const dayKey = getTodayDayKey();
    const plan = get().weeklyPlan;
    const meals = [];
    MEAL_TYPES.forEach((mt) => {
      const slot = plan[`${dayKey}-${mt}`];
      if (slot) {
        meals.push({ ...slot, mealType: mt, dayKey });
      }
    });
    return meals;
  },

  /**
   * Grocery List Diffing Function.
   * Reads required ingredients from meal plan, cross-references with
   * pantry inventory. Returns only missing/insufficient items.
   * Flow: Meal Planner + Pantry → Grocery List (Phase 2.D)
   */
  generateGroceryList: () => {
    const plan = get().weeklyPlan;
    const pantry = get().pantryItems;
    const recipes = get().recipes;

    // Collect all required ingredients from planned meals
    const requiredIngredients = {};
    Object.values(plan).forEach((meal) => {
      // Find the full recipe to get ingredient details
      const recipe = recipes.find((r) => r.name === meal.name);
      if (recipe && recipe.ingredients) {
        recipe.ingredients.forEach((ing) => {
          const key = ing.name.toLowerCase().trim();
          if (!requiredIngredients[key]) {
            requiredIngredients[key] = {
              name: ing.name,
              amount: ing.amount,
              needed: 1,
            };
          } else {
            requiredIngredients[key].needed += 1;
          }
        });
      }
    });

    // Cross-reference with pantry — only include missing items
    const pantryNames = pantry.map((p) => p.name.toLowerCase());
    const groceryList = [];
    Object.values(requiredIngredients).forEach((req) => {
      const inPantry = pantryNames.some((pName) =>
        pName.includes(req.name.toLowerCase().split(",")[0].split(" ")[0])
      );
      if (!inPantry) {
        groceryList.push({
          name: req.name,
          amount: req.amount,
          timesNeeded: req.needed,
          priority: req.needed >= 3 ? "High" : req.needed >= 2 ? "Medium" : "Low",
          reason: `Required for ${req.needed} planned meal${req.needed > 1 ? "s" : ""} this week`,
        });
      }
    });

    return groceryList;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CALORIE TRACKER STATE
  // Logs food entries per date. Feeds into Nutrition Analytics charts.
  // Flow: Calorie Tracker → Nutrition Analytics (Phase 2.F)
  // ═══════════════════════════════════════════════════════════════════════════
  calorieEntries: [],
  calorieGoals: {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  },

  addCalorieEntry: (entry) =>
    set((state) => ({
      calorieEntries: [
        ...state.calorieEntries,
        { id: nextCalorieEntryId++, ...entry },
      ],
    })),

  removeCalorieEntry: (id) =>
    set((state) => ({
      calorieEntries: state.calorieEntries.filter((e) => e.id !== id),
    })),

  /**
   * Log a planned meal from the Meal Planner instantly.
   * Flow: Meal Planner → Calorie Tracker (Phase 2.E)
   */
  logPlannedMeal: (meal) => {
    const entry = {
      id: nextCalorieEntryId++,
      date: toISODate(new Date()),
      mealType: meal.mealType,
      foodName: meal.name,
      quantity: 1,
      unit: "serving",
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
      fromPlannedMeal: true,
    };
    set((state) => ({
      calorieEntries: [...state.calorieEntries, entry],
    }));
    return entry;
  },

  /**
   * Get entries for a specific date.
   */
  getEntriesForDate: (dateStr) => {
    return get().calorieEntries.filter((e) => e.date === dateStr);
  },

  /**
   * Get daily totals for a specific date.
   */
  getDailyTotals: (dateStr) => {
    const entries = get().calorieEntries.filter((e) => e.date === dateStr);
    return entries.reduce(
      (acc, e) => ({
        calories: acc.calories + (Number(e.calories) || 0),
        protein: acc.protein + (Number(e.protein) || 0),
        carbs: acc.carbs + (Number(e.carbs) || 0),
        fat: acc.fat + (Number(e.fat) || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  },

  /**
   * Get 7-day analytics data for Nutrition Analytics charts.
   * Reactively computed from calorie entries.
   * Flow: Calorie Tracker → Nutrition Analytics (Phase 2.F)
   */
  get7DayAnalytics: () => {
    const entries = get().calorieEntries;
    const today = new Date();
    const labels = [];
    const calorieData = [];
    const proteinData = [];
    const carbsData = [];
    const fatData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toISODate(d);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      labels.push(dayLabel);

      const dayEntries = entries.filter((e) => e.date === dateStr);
      const totals = dayEntries.reduce(
        (acc, e) => ({
          calories: acc.calories + (Number(e.calories) || 0),
          protein: acc.protein + (Number(e.protein) || 0),
          carbs: acc.carbs + (Number(e.carbs) || 0),
          fat: acc.fat + (Number(e.fat) || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      calorieData.push(totals.calories);
      proteinData.push(totals.protein);
      carbsData.push(totals.carbs);
      fatData.push(totals.fat);
    }

    return { labels, calorieData, proteinData, carbsData, fatData };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD DERIVED STATE
  // The Dashboard is the "ultimate mirror" — subscribes to all modules.
  // Flow: ALL Modules → Dashboard (Phase 2.G)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all dashboard metrics from global state.
   * Called by Dashboard component to aggregate real-time counts.
   */
  getDashboardStats: () => {
    const state = get();
    const today = toISODate(new Date());
    const todayEntries = state.calorieEntries.filter((e) => e.date === today);
    const todayCalories = todayEntries.reduce(
      (sum, e) => sum + (Number(e.calories) || 0),
      0
    );
    const mealsPlanned = Object.keys(state.weeklyPlan).length;

    return {
      totalRecipes: state.recipes.length,
      totalPantryItems: state.pantryItems.length,
      todayCalories,
      mealsPlanned,
    };
  },

  /**
   * Get urgent alerts for the Dashboard.
   * Checks expiring pantry items.
   */
  getDashboardAlerts: () => {
    const state = get();
    const alerts = [];
    const today = new Date();

    // Expiring pantry items
    const expiring = state.pantryItems.filter((item) => {
      const expiry = new Date(item.expiry);
      const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
      return diff <= 3 && diff >= 0;
    });

    if (expiring.length > 0) {
      alerts.push({
        type: "warning",
        icon: "⚠️",
        title: `${expiring.length} item${expiring.length > 1 ? "s" : ""} expiring soon`,
        description: expiring.map((i) => i.name).join(", "),
        severity: "high",
      });
    }

    // Expired items
    const expired = state.pantryItems.filter((item) => isExpired(item.expiry));
    if (expired.length > 0) {
      alerts.push({
        type: "error",
        icon: "🚨",
        title: `${expired.length} item${expired.length > 1 ? "s" : ""} expired`,
        description: expired.map((i) => i.name).join(", "),
        severity: "critical",
      });
    }

    // Today's calorie tracking
    const todayDate = toISODate(today);
    const todayEntries = state.calorieEntries.filter(
      (e) => e.date === todayDate
    );
    if (todayEntries.length === 0) {
      alerts.push({
        type: "info",
        icon: "📝",
        title: "No meals logged today",
        description: "Start tracking your calories for today.",
        severity: "low",
      });
    }

    // Low pantry
    if (state.pantryItems.length < 5) {
      alerts.push({
        type: "info",
        icon: "🛒",
        title: "Pantry running low",
        description: `Only ${state.pantryItems.length} items in your pantry. Consider restocking.`,
        severity: "medium",
      });
    }

    return alerts.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3 };
      return (order[a.severity] || 3) - (order[b.severity] || 3);
    });
  },
}));

export default useAppStore;
