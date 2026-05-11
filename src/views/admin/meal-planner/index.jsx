import React, { useState, useMemo, useEffect } from "react";
import Card from "components/card";
import MiniCalendar from "components/calendar/MiniCalendar";
import MealSlotCard from "./components/MealSlotCard";
import {
  DAYS,
  MEAL_TYPES,
  availableRecipes,
  initialWeeklyPlan,
} from "./variables/mockData";
import {
  MdOutlineLocalFireDepartment,
  MdClose,
  MdOutlineSearch,
  MdOutlineRefresh,
} from "react-icons/md";

const MealPlanner = () => {
  const [weeklyPlan, setWeeklyPlan] = useState(initialWeeklyPlan);
  const [assignTarget, setAssignTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [syncedCount, setSyncedCount] = useState(0);
  const [showSyncAlert, setShowSyncAlert] = useState(false);

  // On mount, check for calorie-tracker synced meals and merge into plan
  useEffect(() => {
    const loadSyncedMeals = () => {
      try {
        const key = "calorie_tracker_synced_meals";
        const synced = JSON.parse(localStorage.getItem(key) || "[]");
        if (synced.length === 0) return;

        setWeeklyPlan((prev) => {
          const updated = { ...prev };
          let count = 0;
          synced.forEach((entry) => {
            const slotKey = `${entry.day}-${entry.mealType}`;
            // Only add if slot is empty (don't overwrite existing meals)
            if (!updated[slotKey]) {
              updated[slotKey] = {
                recipeId: null,
                name: entry.name,
                calories: entry.calories,
                synced: true,
              };
              count++;
            }
          });
          if (count > 0) {
            setSyncedCount(count);
            setShowSyncAlert(true);
            setTimeout(() => setShowSyncAlert(false), 5000);
          }
          return updated;
        });

        // Clear after consuming
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    };

    loadSyncedMeals();
  }, []);

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

  const handleAssign = (key) => {
    setAssignTarget(key);
    setSearchQuery("");
  };

  const handleRemove = (key) => {
    setWeeklyPlan((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSelectRecipe = (recipe) => {
    if (!assignTarget) return;
    setWeeklyPlan((prev) => ({
      ...prev,
      [assignTarget]: {
        recipeId: recipe.id,
        name: recipe.name,
        calories: recipe.calories,
      },
    }));
    setAssignTarget(null);
  };

  const filteredRecipes = availableRecipes.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Sync Alert Banner */}
      {showSyncAlert && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-brand-500 px-5 py-3 text-white shadow-lg">
          <MdOutlineRefresh className="h-5 w-5 flex-shrink-0 animate-spin" />
          <div className="flex-1">
            <p className="text-sm font-bold">Meal Planner Updated!</p>
            <p className="text-xs opacity-90">
              {syncedCount} meal{syncedCount > 1 ? "s" : ""} auto-synced from your Calorie Tracker photo log.
            </p>
          </div>
          <button onClick={() => setShowSyncAlert(false)} className="opacity-80 hover:opacity-100">
            <MdClose className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary Widgets */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-3">
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

      {/* Main Layout: Grid + Calendar */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-4">
        {/* Weekly Grid */}
        <div className="xl:col-span-3">
          <Card extra="p-4">
            <h2 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Weekly Meal Plan
            </h2>

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

        {/* Right Column */}
        <div className="xl:col-span-1 flex flex-col gap-5">
          <Card extra="p-4">
            <h2 className="mb-3 text-base font-bold text-navy-700 dark:text-white">
              Calendar
            </h2>
            <MiniCalendar />
          </Card>

          <Card extra="p-4">
            <h3 className="mb-3 text-sm font-bold text-navy-700 dark:text-white">
              Meal Types
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { label: "Breakfast", color: "bg-amber-400" },
                { label: "Lunch", color: "bg-blue-400" },
                { label: "Dinner", color: "bg-brand-500" },
                { label: "Snack", color: "bg-green-500" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${color}`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recipe Assignment Modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
            <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold text-navy-700 dark:text-white">
                  Assign Recipe
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
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                />
              </div>

              <div className="max-h-72 overflow-y-auto">
                {filteredRecipes.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">
                    No recipes found
                  </p>
                ) : (
                  filteredRecipes.map((recipe) => (
                    <button
                      key={recipe.id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition hover:bg-brand-50 dark:hover:bg-navy-700"
                    >
                      <div>
                        <p className="text-sm font-semibold text-navy-700 dark:text-white">
                          {recipe.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {recipe.tags.map((tag) => (
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
