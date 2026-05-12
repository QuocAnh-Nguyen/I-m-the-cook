/**
 * ============================================================================
 * Meal Planner — Full Overhaul (Phase 7)
 * ============================================================================
 *
 * New Features:
 * - Multi-dish meal slots: Each slot can contain 3-4 dishes (Vietnamese mâm cơm)
 * - Soft lock for past days: dimmed overlay + confirmation dialog
 * - Today-focused UI: highlighted current day column
 * - AI Suggest button: auto-fills upcoming empty days (Phase 11)
 * - Multi-dish recipe picker modal
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import Card from "components/card";
import MultiDishMealSlotCard from "./components/MultiDishMealSlotCard";
import AISuggestionModal from "./components/AISuggestionModal";
import useAppStore from "store/useAppStore";
import {
  MdOutlineLocalFireDepartment,
  MdClose,
  MdOutlineSearch,
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
  MdOutlineAutoAwesome,
} from "react-icons/md";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

/**
 * Helper: Get the Monday of the week containing a given date.
 */
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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

/**
 * Get today's day key (Mon, Tue, etc.) for highlighting.
 */
const getTodayDayKey = () => DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

/**
 * Determine if a day has passed this week.
 */
const isDayPast = (day, weekOffset) => {
  if (weekOffset !== 0) return false; // Only relevant for current week
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1; // Mon=0
  const dayIdx = DAYS.indexOf(day);
  return dayIdx < todayIdx;
};

/**
 * Get today's date for "TODAY" badge display.
 */
const getTodayDate = () => {
  const today = new Date();
  return today.getDate();
};

const MealPlanner = () => {
  const weeklyPlan = useAppStore((s) => s.weeklyPlan);
  const assignMeal = useAppStore((s) => s.assignMeal);
  const addDishToMeal = useAppStore((s) => s.addDishToMeal);
  const removeDishFromMeal = useAppStore((s) => s.removeDishFromMeal);
  const removeMeal = useAppStore((s) => s.removeMeal);
  const selectedWeekOffset = useAppStore((s) => s.selectedWeekOffset);
  const setWeekOffset = useAppStore((s) => s.setWeekOffset);
  const applyAISuggestions = useAppStore((s) => s.applyAISuggestions);
  const recipes = useAppStore((s) => s.recipes);
  const pantryItems = useAppStore((s) => s.pantryItems);

  const [assignTarget, setAssignTarget] = useState(null);
  const [addDishTarget, setAddDishTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [pastDayConfirm, setPastDayConfirm] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const todayDay = useMemo(() => getTodayDayKey(), []);

  // ─── Computed daily totals (multi-dish aggregation) ──────────────────────
  const dailyTotals = useMemo(() => {
    const totals = {};
    DAYS.forEach((day) => {
      totals[day] = MEAL_TYPES.reduce((sum, mt) => {
        const slot = weeklyPlan[`${day}-${mt}`];
        if (slot?.dishes) {
          return sum + slot.dishes.reduce((dSum, d) => dSum + (d.calories || 0), 0);
        }
        return sum;
      }, 0);
    });
    return totals;
  }, [weeklyPlan]);

  const weekTotal = Object.values(dailyTotals).reduce((a, b) => a + b, 0);
  const mealsPlanned = Object.keys(weeklyPlan).length;
  const totalDishesPlanned = Object.values(weeklyPlan).reduce(
    (sum, slot) => sum + (slot?.dishes?.length || 0),
    0
  );

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleAssign = (key) => {
    // Check if past day
    const [day] = key.split("-");
    if (isDayPast(day, selectedWeekOffset)) {
      setPastDayConfirm(key);
      return;
    }
    setAssignTarget(key);
    setSearchQuery("");
  };

  const handleConfirmPastDay = () => {
    if (pastDayConfirm) {
      setAssignTarget(pastDayConfirm);
      setSearchQuery("");
    }
    setPastDayConfirm(null);
  };

  const handleAddDish = (key) => {
    const [day] = key.split("-");
    if (isDayPast(day, selectedWeekOffset)) {
      setPastDayConfirm(key);
      return;
    }
    setAddDishTarget(key);
    setSearchQuery("");
  };

  const handleRemove = (key, dishIndex) => {
    if (dishIndex !== undefined) {
      removeDishFromMeal(key, dishIndex);
    } else {
      removeMeal(key);
    }
  };

  const handleSelectRecipe = (recipe) => {
    if (!assignTarget) return;
    assignMeal(assignTarget, [{
      recipeId: recipe.id,
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein || 0,
      carbs: recipe.carbs || 0,
      fat: recipe.fat || 0,
    }]);
    setAssignTarget(null);
  };

  const handleAddRecipeAsDish = (recipe) => {
    if (!addDishTarget) return;
    addDishToMeal(addDishTarget, {
      recipeId: recipe.id,
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein || 0,
      carbs: recipe.carbs || 0,
      fat: recipe.fat || 0,
    });
    setAddDishTarget(null);
  };

  const handleAISuggest = async () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      // Generate mock Vietnamese meal suggestions for days that are empty
      const suggestions = {};
      DAYS.forEach((day) => {
        if (isDayPast(day, selectedWeekOffset)) return; // Skip past days
        ["Lunch", "Dinner"].forEach((mt) => {
          const key = `${day}-${mt}`;
          if (!weeklyPlan[key]) {
            const dishes = [
              { customName: "Steamed Jasmine Rice (Cơm trắng)", calories: 200, protein: 4, carbs: 44, fat: 0 },
              { customName: mt === "Lunch" ? "Chicken Pho (Phở gà)" : "Braised Fish (Cá kho tộ)", calories: 320, protein: 28, carbs: 15, fat: 16 },
              { customName: "Stir-fried Morning Glory (Rau muống xào)", calories: 80, protein: 3, carbs: 6, fat: 5 },
            ];
            if (!suggestions[day]) suggestions[day] = {};
            suggestions[day][mt] = { dishes };
          }
        });
      });
      applyAISuggestions(suggestions);
      setIsGenerating(false);
    }, 1500);
  };

  const handleShowAISuggestionModal = () => {
    setShowSuggestionModal(true);
  };

  const handleApplySuggestions = (suggestions) => {
    applyAISuggestions(suggestions);
    setShowSuggestionModal(false);
  };

  const filteredRecipes = recipes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* ─── Header with Compact Week Picker ────────────────────────────────── */}
      <div className="mt-3 mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Meal Planner
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Plan your Vietnamese family meals for the week ahead. 🍲
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* AI Suggest Button */}
          <button
            onClick={handleAISuggest}
            disabled={isGenerating || selectedWeekOffset !== 0}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              selectedWeekOffset !== 0
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : isGenerating
                ? "bg-purple-300 text-white"
                : "bg-purple-500 text-white hover:bg-purple-600"
            }`}
          >
            <MdOutlineAutoAwesome className={`h-5 w-5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating..." : "✨ AI Suggest"}
          </button>

          {/* Compact Week Picker */}
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
      </div>

      {/* ─── Summary Widgets ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
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
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-navy-700">
            <span className="text-2xl">🥘</span>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Dishes</p>
            <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
              {totalDishesPlanned}
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

      {/* ─── Weekly Grid ────────────────────────────────────────────────────── */}
      <div className="mt-5">
        <Card extra="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white">
              Weekly Meal Plan
            </h2>
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
              className="grid min-w-[900px]"
              style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}
            >
              {/* Day headers */}
              <div />
              {DAYS.map((day) => {
                const isToday = day === todayDay && selectedWeekOffset === 0;
                const isPast = isDayPast(day, selectedWeekOffset);
                return (
                  <div
                    key={day}
                    className={`mb-2 text-center rounded-t-xl pt-2 pb-1 ${
                      isToday
                        ? "bg-brand-50 dark:bg-brand-900/20 border-t-2 border-x-2 border-brand-400 rounded-t-xl"
                        : ""
                    } ${isPast ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
                        {day}
                      </p>
                      {isToday && (
                        <span className="rounded-full bg-brand-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          TODAY
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      🔥 {dailyTotals[day]} kcal
                    </p>
                  </div>
                );
              })}

              {/* Meal rows */}
              {MEAL_TYPES.map((mealType) => (
                <React.Fragment key={mealType}>
                  <div className="flex items-start pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {mealType}
                    </span>
                  </div>
                  {DAYS.map((day) => {
                    const key = `${day}-${mealType}`;
                    const slot = weeklyPlan[key] || null;
                    const isToday = day === todayDay && selectedWeekOffset === 0;
                    const isPast = isDayPast(day, selectedWeekOffset);

                    return (
                      <div
                        key={key}
                        className={`p-1 ${isToday ? "bg-brand-50/30 dark:bg-brand-900/10 rounded-lg" : ""} ${isPast ? "opacity-50" : ""}`}
                      >
                        <MultiDishMealSlotCard
                          day={day}
                          mealType={mealType}
                          meal={slot}
                          onAssign={handleAssign}
                          onAddDish={handleAddDish}
                          onRemove={handleRemove}
                          isPast={isPast}
                          isToday={isToday}
                        />
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ─── Past Day Confirmation Dialog ───────────────────────────────────── */}
      {pastDayConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-800">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-bold text-navy-700 dark:text-white">
              This day has passed
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {pastDayConfirm.replace("-", " — ")} is in the past. Are you sure you want to edit it?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setPastDayConfirm(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPastDay}
                className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
              >
                Edit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Recipe Assignment Modal ────────────────────────────────────────── */}
      {(assignTarget || addDishTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
            <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold text-navy-700 dark:text-white">
                  {addDishTarget ? "Add Dish" : "Select Recipe"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(addDishTarget || assignTarget).replace("-", " — ")}
                </p>
              </div>
              <button
                onClick={() => { setAssignTarget(null); setAddDishTarget(null); }}
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
                      onClick={() =>
                        addDishTarget
                          ? handleAddRecipeAsDish(recipe)
                          : handleSelectRecipe(recipe)
                      }
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
                          {(Array.isArray(recipe.tags) ? recipe.tags : []).slice(0, 3).map((tag) => (
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

      {/* ─── AI Suggestion Preview Modal (Phase 11) ─────────────────────────── */}
      {showSuggestionModal && (
        <AISuggestionModal
          weeklyPlan={weeklyPlan}
          onApply={handleApplySuggestions}
          onClose={() => setShowSuggestionModal(false)}
          pantryItems={pantryItems}
        />
      )}
    </div>
  );
};

export default MealPlanner;
