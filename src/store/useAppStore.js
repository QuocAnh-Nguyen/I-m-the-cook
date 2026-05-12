/**
 * ============================================================================
 * ChefOne — Global State Management with Zustand
 * ============================================================================
 *
 * UPDATED: Phase 4 — Backend API Integration
 * Store actions now call backend APIs via the service layer.
 * Local state is populated from API responses.
 * Falls back to mock data when the backend is unavailable.
 *
 * Weekly Plan now supports multi-dish structure:
 *   weeklyPlan["Mon-Lunch"] = { dishes: [{ recipeId, customName, calories, ... }, ...] }
 * ============================================================================
 */

import { create } from "zustand";
import { initialPantryItems } from "views/admin/pantry/variables/mockData";
import * as apiService from "services/api";
import * as pantryService from "services/pantryService";
import * as recipeService from "services/recipeService";
import * as mealPlanService from "services/mealPlanService";
import * as calorieService from "services/calorieService";
import * as dashboardService from "services/dashboardService";

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

// ─── Initial Recipes (fallback mock) ────────────────────────────────────────
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
    steps: [
      "Season chicken breasts with salt, pepper, and Italian seasoning on both sides.",
      "Heat olive oil in a large skillet over medium-high heat. Sear chicken for 5–6 min per side until golden brown. Remove and set aside.",
      "In the same pan, sauté garlic for 30 seconds until fragrant.",
    ],
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
    steps: [],
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
    steps: [],
  },
];

// ─── Initial Weekly Plan (multi-dish structure) ─────────────────────────────
const initialWeeklyPlan = {
  "Mon-Lunch": {
    dishes: [
      { customName: "Steamed Jasmine Rice (Cơm trắng)", calories: 200, protein: 4, carbs: 44, fat: 0 },
      { customName: "Morning Glory Soup (Canh rau muống)", calories: 85, protein: 3, carbs: 8, fat: 2 },
      { customName: "Braised Pork Belly (Thịt kho tàu)", calories: 380, protein: 22, carbs: 8, fat: 30 },
    ],
  },
  "Mon-Dinner": {
    dishes: [
      { recipeId: 1, name: "Creamy Tuscan Chicken", calories: 520, protein: 42, carbs: 18, fat: 30 },
      { customName: "Garlic Bread", calories: 150, protein: 5, carbs: 22, fat: 5 },
    ],
  },
  "Tue-Lunch": {
    dishes: [
      { customName: "Beef Pho (Phở bò)", calories: 450, protein: 28, carbs: 55, fat: 12 },
    ],
  },
  "Wed-Dinner": {
    dishes: [
      { customName: "Steamed Jasmine Rice (Cơm trắng)", calories: 200, protein: 4, carbs: 44, fat: 0 },
      { customName: "Sour Fish Soup (Canh chua cá)", calories: 150, protein: 18, carbs: 10, fat: 4 },
      { recipeId: 3, name: "Lemon Herb Salmon", calories: 460, protein: 38, carbs: 8, fat: 28 },
    ],
  },
};

// ─── Next ID counters ──────────────────────────────────────────────────────
let nextPantryId = initialPantryItems.length + 1;
let nextRecipeId = initialRecipes.length + 1;
let nextCalorieEntryId = 1;

// ─── MEAL_TYPES constant ───────────────────────────────────────────────────
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

// ═══════════════════════════════════════════════════════════════════════════
// ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════════════
const useAppStore = create((set, get) => ({

  // ─── Backend API availability flag ───────────────────────────────────────
  isBackendAvailable: false,
  isLoading: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // PANTRY STATE
  // ═══════════════════════════════════════════════════════════════════════════
  pantryItems: initialPantryItems,

  /**
   * Fetch pantry items from backend. Falls back to local state.
   */
  fetchPantryItems: async () => {
    try {
      set({ isLoading: true });
      const res = await pantryService.getPantryItems();
      set({ pantryItems: res.data, isBackendAvailable: true, isLoading: false });
    } catch {
      set({ isLoading: false }); // Use local state
    }
  },

  addPantryItem: async (item) => {
    try {
      const res = await pantryService.addPantryItem(item);
      set((state) => ({ pantryItems: [res.data, ...state.pantryItems] }));
    } catch {
      set((state) => ({
        pantryItems: [{ id: nextPantryId++, ...item }, ...state.pantryItems],
      }));
    }
  },

  addPantryItems: async (items) => {
    try {
      const res = await pantryService.addPantryItemsBulk(items);
      set((state) => ({ pantryItems: [...res.data, ...state.pantryItems] }));
    } catch {
      set((state) => ({
        pantryItems: [
          ...state.pantryItems,
          ...items.map((item) => ({ id: nextPantryId++, ...item })),
        ],
      }));
    }
  },

  updatePantryItem: async (id, data) => {
    try {
      await pantryService.updatePantryItem(id, data);
    } catch { /* fallback */ }
    set((state) => ({
      pantryItems: state.pantryItems.map((i) =>
        i.id === id ? { ...i, ...data } : i
      ),
    }));
  },

  removePantryItem: async (id) => {
    try {
      await pantryService.deletePantryItem(id);
    } catch { /* fallback */ }
    set((state) => ({
      pantryItems: state.pantryItems.filter((i) => i.id !== id),
    }));
  },

  getPantryItemsSortedByExpiry: () => {
    const items = get().pantryItems;
    return [...items].sort(
      (a, b) => new Date(a.expiry) - new Date(b.expiry)
    );
  },

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
  // ═══════════════════════════════════════════════════════════════════════════
  recipes: initialRecipes,

  addRecipe: async (recipe) => {
    try {
      await recipeService.createRecipe(recipe);
    } catch { /* fallback */ }
    set((state) => ({
      recipes: [{ id: nextRecipeId++, ...recipe }, ...state.recipes],
    }));
  },

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
      steps: generatedRecipe.steps || [],
      notes: "",
      source: "AI Generated",
      savedAt: toISODate(new Date()),
    };
    set((state) => ({
      recipes: [{ id: nextRecipeId++, ...recipe }, ...state.recipes],
    }));
    return recipe;
  },

  /**
   * Save a Vietnamese multi-dish meal — saves each dish individually.
   */
  saveVietnameseMeal: (mealData) => {
    const savedRecipes = [];
    mealData.dishes.forEach((dish) => {
      const recipe = {
        name: dish.name,
        prepTime: dish.prepTime || "10 min",
        cookTime: dish.cookTime || "20 min",
        servings: dish.servings || 2,
        difficulty: dish.difficulty || "Easy",
        calories: dish.calories,
        protein: dish.protein || 0,
        carbs: dish.carbs || 0,
        fat: dish.fat || 0,
        tags: dish.tags || ["Vietnamese"],
        ingredients: dish.ingredients || [],
        steps: dish.steps || [],
        notes: `Part of "${mealData.mealName}" meal`,
        source: "AI Generated",
        savedAt: toISODate(new Date()),
      };
      set((state) => ({
        recipes: [{ id: nextRecipeId++, ...recipe }, ...state.recipes],
      }));
      savedRecipes.push(recipe);
    });
    return savedRecipes;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEAL PLANNER STATE (Multi-dish support)
  // ═══════════════════════════════════════════════════════════════════════════
  weeklyPlan: initialWeeklyPlan,
  selectedWeekOffset: 0,

  setWeekOffset: (offset) => set({ selectedWeekOffset: offset }),

  /**
   * Assign a multi-dish meal to a slot.
   * dish can be a single dish object or an array of dishes.
   */
  assignMeal: (key, dishes) => {
    const dishArray = Array.isArray(dishes) ? dishes : [dishes];
    set((state) => ({
      weeklyPlan: {
        ...state.weeklyPlan,
        [key]: { dishes: dishArray },
      },
    }));
  },

  /**
   * Add a single dish to an existing meal slot.
   */
  addDishToMeal: (key, dish) => {
    set((state) => {
      const existing = state.weeklyPlan[key];
      const currentDishes = existing?.dishes || [];
      return {
        weeklyPlan: {
          ...state.weeklyPlan,
          [key]: { dishes: [...currentDishes, dish] },
        },
      };
    });
  },

  /**
   * Remove a dish from a meal slot by index.
   */
  removeDishFromMeal: (key, dishIndex) => {
    set((state) => {
      const existing = state.weeklyPlan[key];
      if (!existing) return { weeklyPlan: state.weeklyPlan };
      const dishes = existing.dishes.filter((_, idx) => idx !== dishIndex);
      const next = { ...state.weeklyPlan };
      if (dishes.length === 0) {
        delete next[key];
      } else {
        next[key] = { dishes };
      }
      return { weeklyPlan: next };
    });
  },

  removeMeal: (key) =>
    set((state) => {
      const next = { ...state.weeklyPlan };
      delete next[key];
      return { weeklyPlan: next };
    }),

  /**
   * Apply AI-generated weekly suggestions to the plan.
   */
  applyAISuggestions: (suggestions) => {
    set((state) => {
      const updated = { ...state.weeklyPlan };
      Object.entries(suggestions).forEach(([day, meals]) => {
        Object.entries(meals).forEach(([mealType, data]) => {
          const key = `${day}-${mealType}`;
          // Only apply if the slot is NOT already filled
          if (!updated[key]) {
            updated[key] = { dishes: data.dishes || [] };
          }
        });
      });
      return { weeklyPlan: updated };
    });
  },

  getTodayPlannedMeals: () => {
    const dayKey = getTodayDayKey();
    const plan = get().weeklyPlan;
    const meals = [];
    MEAL_TYPES.forEach((mt) => {
      const slot = plan[`${dayKey}-${mt}`];
      if (slot) {
        meals.push({
          mealType: mt,
          dayKey,
          dishes: slot.dishes || [],
          totalCalories: (slot.dishes || []).reduce((sum, d) => sum + (d.calories || 0), 0),
        });
      }
    });
    return meals;
  },

  generateGroceryList: () => {
    const plan = get().weeklyPlan;
    const pantry = get().pantryItems;
    const recipes = get().recipes;

    const requiredIngredients = {};
    Object.values(plan).forEach((meal) => {
      (meal.dishes || []).forEach((dish) => {
        if (dish.recipeId) {
          const recipe = recipes.find((r) => r.id === dish.recipeId);
          if (recipe?.ingredients) {
            recipe.ingredients.forEach((ing) => {
              const k = ing.name.toLowerCase().trim();
              if (!requiredIngredients[k]) {
                requiredIngredients[k] = { name: ing.name, amount: ing.amount, needed: 1 };
              } else {
                requiredIngredients[k].needed += 1;
              }
            });
          }
        }
      });
    });

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

  logPlannedMeal: (meal) => {
    const entries = [];
    (meal.dishes || []).forEach((dish) => {
      const entry = {
        id: nextCalorieEntryId++,
        date: toISODate(new Date()),
        mealType: meal.mealType,
        foodName: dish.name || dish.customName || "Unknown dish",
        quantity: 1,
        unit: "serving",
        calories: dish.calories || 0,
        protein: dish.protein || 0,
        carbs: dish.carbs || 0,
        fat: dish.fat || 0,
        fromPlannedMeal: true,
      };
      entries.push(entry);
    });

    set((state) => ({
      calorieEntries: [...state.calorieEntries, ...entries],
    }));
    return entries;
  },

  getEntriesForDate: (dateStr) => {
    return get().calorieEntries.filter((e) => e.date === dateStr);
  },

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
  // ═══════════════════════════════════════════════════════════════════════════

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

  getDashboardAlerts: () => {
    const state = get();
    const alerts = [];
    const today = new Date();

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
