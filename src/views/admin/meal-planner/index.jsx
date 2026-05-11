/**
 * ============================================================================
 * Meal Planner — Connected to Global Store
 * ============================================================================
 *
 * Phase 1.2: Remove redundant monthly calendar, add compact Week Picker
 * Phase 2.C: Recipe picker modal reads from My Recipes store (not hardcoded)
 * Phase 2.D: Feeds into Grocery List diffing (via store)
 * Phase 2.E: Today's planned meals feed Calorie Tracker quick-log
 *
 * State: Uses Zustand store for weeklyPlan and recipes.
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import Card from "components/card";
import MealSlotCard from "./components/MealSlotCard";
import useAppStore from "store/useAppStore";
import {
  MdOutlineLocalFireDepartment,
  MdClose,
  MdOutlineSearch,
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
} from "react-icons/md";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

/**
 * Helper: Get the Monday of the week containing a given date.
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  return new Date(d.setDate(diff));
};

/**
 * Helper: Format a date range string for the week picker display.
 */
const formatWeekRange = (weekOffset) => {
  const today = new Date();
  const monday = getWeekStart(today);
  monday.setDate(monday.getDate() + weekOffset * 7);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const opts = { month: "short", day: "numeric" };
  const monStr = monday.toLocaleDateString("en-US", opts);
  const sunStr = sunday.toLocaleDateString("en-US", { ...opts, year: "numeric" });
  return `${monStr} — ${sunStr}`;
};

const MealPlanner = () => {
  // ─── Read from global Zustand store ──────────────────────────────────────
  const weeklyPlan = useAppStore((s) => s.weeklyPlan);
  const assignMeal = useAppStore((s) => s.assignMeal);
  const removeMeal = useAppStore((s) => s.removeMeal);
  const selectedWeekOffset = useAppStore((s) => s.selectedWeekOffset);
  const setWeekOffset = useAppStore((s) => s.setWeekOffset);

  // Phase 2.C: Read recipes from global store for the picker modal
  const recipes = useAppStore((s) => s.recipes);

  const [assignTarget, setAssignTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ─── Computed daily totals ───────────────────────────────────────────────
  const dailyTotals = useMemo(() => {
    const totals = {};
    DAYS.forEach((day) => {
      totals[day] = MEAL_TYPES.reduce((sum, mt) => {
        const slot = weeklyPlan[`${day}-${mt}`];
        return sum + (slot ? slot.calories : 0);
      }, 0);
    });
    return totals;
  }, [weeklyPlan]);

  const weekTotal = Object.values(dailyTotals).reduce((a, b) => a + b, 0);
  const mealsPlanned = Object.keys(weeklyPlan).length;

  // ─── Handlers ────────────────────────────────────────────────────────────
  const handleAssign = (key) => {
    setAssignTarget(key);
    setSearchQuery("");
  };

  const handleRemove = (key) => {
    removeMeal(key);
  };

  /**
   * Phase 2.C: When user selects a recipe from the picker,
   * assign it to the meal slot using data from My Recipes store.
   */
  const handleSelectRecipe = (recipe) => {
    if (!assignTarget) return;
    assignMeal(assignTarget, {
      recipeId: recipe.id,
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein || 0,
      carbs: recipe.carbs || 0,
      fat: recipe.fat || 0,
    });
    setAssignTarget(null);
  };

  // Filter recipes in the picker modal based on search query
  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* ─── Header with Compact Week Picker (Phase 1.2) ──────────────────── */}
      <div className="mt-3 mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Meal Planner
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Plan your meals for the week ahead.
          </p>
        </div>

        {/* Compact Week Picker — replaces the bulky monthly calendar */}
        <div className="flex items-center gap-2 rounded-2xl bg-white px-2 py-1.5 shadow-sm dark:bg-navy-800">
          <button
            onClick={() => setWeekOffset(selectedWeekOffset - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-navy-700"
          >
            <MdOutlineChevronLeft className="h-5 w-5 text-gray-600 dark:text-white" />
          </button>
          <div className="flex flex-col items-center px-3">
            <span className="text-sm font-bold text-navy-700 dark:text-white">
              {formatWeekRange(selectedWeekOffset)}
            </span>
            {selectedWeekOffset === 0 && (
              <span className="text-[10px] font-semibold text-brand-500">
                Current Week
              </span>
            )}
          </div>
          <button
            onClick={() => setWeekOffset(selectedWeekOffset + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-navy-700"
          >
            <MdOutlineChevronRight className="h-5 w-5 text-gray-600 dark:text-white" />
          </button>
          {selectedWeekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="ml-1 rounded-xl bg-brand-500 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* ─── Summary Widgets ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <Card extra="!flex-row items-center rounded-[20px] p-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-navy-700">
            <MdOutlineLocalFireDepartment className="h-7 w-7 text-brand-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Weekly Calories</p>
            <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
              {weekTotal.toLocaleString()} kcal
            </h4>
          </div>
        </Card>
        <Card extra="!flex-row items-center rounded-[20px] p-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-navy-700">
            <span className="text-2xl">🍽️</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Meals Planned</p>
            <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
              {mealsPlanned} / {DAYS.length * MEAL_TYPES.length}
            </h4>
          </div>
        </Card>
        <Card extra="!flex-row items-center rounded-[20px] p-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-navy-700">
            <MdOutlineLocalFireDepartment className="h-7 w-7 text-amber-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Avg / Day</p>
            <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
              {Math.round(weekTotal / 7)} kcal
            </h4>
          </div>
        </Card>
      </div>

      {/* ─── Weekly Grid (Full Width — no calendar sidebar) ────────────────── */}
      <div className="mt-5">
        <Card extra="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white">
              Weekly Meal Plan
            </h2>
            {/* Meal type legend */}
            <div className="hidden items-center gap-4 md:flex">
              {[
                { label: "Breakfast", color: "bg-amber-400" },
                { label: "Lunch", color: "bg-blue-400" },
                { label: "Dinner", color: "bg-brand-500" },
                { label: "Snack", color: "bg-green-500" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <div
              className="grid min-w-[700px]"
              style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}
            >
              {/* Day headers */}
              <div />
              {DAYS.map((day) => (
                <div key={day} className="mb-2 text-center">
                  <p className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                    {day}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    🔥 {dailyTotals[day]} kcal
                  </p>
                </div>
              ))}

              {/* Meal rows */}
              {MEAL_TYPES.map((mealType) => (
                <React.Fragment key={mealType}>
                  <div className="flex items-start pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {mealType}
                    </span>
                  </div>
                  {DAYS.map((day) => (
                    <div key={`${day}-${mealType}`} className="p-1">
                      <MealSlotCard
                        day={day}
                        mealType={mealType}
                        meal={weeklyPlan[`${day}-${mealType}`] || null}
                        onAssign={handleAssign}
                        onRemove={handleRemove}
                      />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ─── Recipe Assignment Modal (Phase 2.C) ──────────────────────────── */}
      {/* Now populated from My Recipes store instead of hardcoded list */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
            <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold text-navy-700 dark:text-white">
                  Select Recipe
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {assignTarget.replace("-", " — ")}
                </p>
              </div>
              <button
                onClick={() => setAssignTarget(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
              >
                <MdClose className="h-5 w-5 text-gray-600 dark:text-white" />
              </button>
            </div>

            <div className="p-4">
              <div className="relative mb-3">
                <MdOutlineSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                />
              </div>

              <div className="max-h-72 overflow-y-auto">
                {filteredRecipes.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">
                    No recipes found. Add recipes in "My Recipes" first.
                  </p>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-brand-50 dark:hover:bg-navy-700"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-navy-700 dark:text-white">
                            {recipe.name}
                          </p>
                          {recipe.source === "AI Generated" && (
                            <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-500">
                              ✨ AI
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {recipe.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-navy-600 dark:text-gray-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="ml-2 flex flex-shrink-0 items-center gap-1">
                        <MdOutlineLocalFireDepartment className="h-4 w-4 text-red-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {recipe.calories} kcal
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;
