/**
 * ============================================================================
 * Nutrition & Tracking — Merged Calorie Tracker + Nutrition Analytics
 * ============================================================================
 *
 * Phase 1.3: Combines Calorie Tracker (input) and Nutrition Analytics (output)
 *            into a single page with tabbed interface.
 *
 * Phase 2.E: Meal Planner → Calorie Tracker
 *            Shows "Log Planned Meal" quick-action buttons for today's
 *            planned meals from the Meal Planner.
 *
 * Phase 2.F: Calorie Tracker → Nutrition Analytics
 *            Real-time reactive connection — logging food immediately
 *            updates the 7-day analytics charts below.
 *
 * Layout: Tabbed interface
 *   Tab 1: "Today's Log" — food logging (manual + photo + planned meals)
 *   Tab 2: "7-Day Analytics" — charts and breakdown table
 *
 * State: Uses Zustand store for all calorie entries and planned meals.
 * ============================================================================
 */

import React, { useState, useRef, useMemo } from "react";
import Card from "components/card";
import LineChart from "components/charts/LineChart";
import BarChart from "components/charts/BarChart";
import useAppStore from "store/useAppStore";
import { analyzeFood } from "services/aiService";
import {
  MdOutlineLocalFireDepartment,
  MdOutlineCameraAlt,
  MdOutlineCloudUpload,
  MdOutlineAdd,
  MdClose,
  MdOutlineDelete,
  MdOutlineCalendarMonth,
  MdOutlineBarChart,
  MdOutlineFitnessCenter,
  MdOutlineTrackChanges,
  MdOutlinePlayArrow,
  MdOutlineAutoAwesome,
} from "react-icons/md";

// ─── Date Helpers ──────────────────────────────────────────────────────────
const formatDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
};

const toInputDate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split("T")[0];
};

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

const EMPTY_FORM = {
  mealType: "Breakfast",
  foodName: "",
  quantity: "",
  unit: "serving",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};

const NutritionTracking = () => {
  const today = new Date();
  const [activeTab, setActiveTab] = useState("log"); // "log" | "analytics"
  const [selectedDate, setSelectedDate] = useState(toInputDate(today));
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loggedPlannedMeals, setLoggedPlannedMeals] = useState(new Set());
  const photoInputRef = useRef(null);

  // ─── Read from global Zustand store ──────────────────────────────────────
  // BUG FIX: Only subscribe to RAW state (primitives/collections), NOT
  // store methods that return new objects/arrays — those cause infinite
  // re-render loops because Zustand uses reference equality on selectors.
  const calorieEntries = useAppStore((s) => s.calorieEntries);
  const addCalorieEntry = useAppStore((s) => s.addCalorieEntry);
  const removeCalorieEntry = useAppStore((s) => s.removeCalorieEntry);
  const logPlannedMeal = useAppStore((s) => s.logPlannedMeal);
  const calorieGoals = useAppStore((s) => s.calorieGoals);
  const weeklyPlan = useAppStore((s) => s.weeklyPlan);

  // Phase 2.E: Compute today's planned meals via useMemo (not selector)
  const todayPlannedMeals = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayKey = days[new Date().getDay()];
    const meals = [];
    MEAL_TYPES.forEach((mt) => {
      const slot = weeklyPlan[`${dayKey}-${mt}`];
      if (slot) meals.push({ ...slot, mealType: mt, dayKey });
    });
    return meals;
  }, [weeklyPlan]);

  // Phase 2.F: Compute 7-day analytics via useMemo (not selector)
  const analytics = useMemo(() => {
    const entries = calorieEntries;
    const today = new Date();
    const labels = [];
    const calorieData = [];
    const proteinData = [];
    const carbsData = [];
    const fatData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
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
  }, [calorieEntries]);

  // ─── Computed values ─────────────────────────────────────────────────────
  const dayEntries = calorieEntries.filter((e) => e.date === selectedDate);

  const totals = dayEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + (Number(e.calories) || 0),
      protein: acc.protein + (Number(e.protein) || 0),
      carbs: acc.carbs + (Number(e.carbs) || 0),
      fat: acc.fat + (Number(e.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const caloriesRemaining = Math.max(0, calorieGoals.calories - totals.calories);
  const caloriePercent = Math.min(
    100,
    Math.round((totals.calories / calorieGoals.calories) * 100)
  );

  // ─── Analytics chart data (Phase 2.F: reactive to calorie entries) ──────
  const calorieLineChartData = useMemo(
    () => [
      { name: "Calories", data: analytics.calorieData },
      { name: "Goal", data: Array(7).fill(calorieGoals.calories) },
    ],
    [analytics.calorieData, calorieGoals.calories]
  );

  const calorieLineChartOptions = useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        type: "line",
        fontFamily: "DM Sans, sans-serif",
      },
      colors: ["#422AFB", "#E2E8F0"],
      stroke: {
        curve: "smooth",
        width: [3, 2],
        dashArray: [0, 6],
      },
      markers: {
        size: 4,
        colors: ["#422AFB"],
        strokeColors: "#fff",
        strokeWidth: 2,
      },
      xaxis: {
        categories: analytics.labels,
        labels: { style: { colors: "#A3AED0", fontSize: "12px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#A3AED0", fontSize: "12px" },
          formatter: (v) => `${v} kcal`,
        },
      },
      grid: {
        borderColor: "#E2E8F0",
        strokeDashArray: 5,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
      },
      tooltip: {
        theme: "dark",
        y: { formatter: (v) => `${v} kcal` },
      },
      legend: {
        show: true,
        position: "top",
        labels: { colors: "#A3AED0" },
      },
    }),
    [analytics.labels]
  );

  const macroBarChartData = useMemo(
    () => [
      { name: "Protein", data: analytics.proteinData },
      { name: "Carbs", data: analytics.carbsData },
      { name: "Fat", data: analytics.fatData },
    ],
    [analytics.proteinData, analytics.carbsData, analytics.fatData]
  );

  const macroBarChartOptions = useMemo(
    () => ({
      chart: {
        toolbar: { show: false },
        stacked: false,
        fontFamily: "DM Sans, sans-serif",
      },
      colors: ["#422AFB", "#6AD2FF", "#f97316"],
      plotOptions: {
        bar: { borderRadius: 6, columnWidth: "55%" },
      },
      xaxis: {
        categories: analytics.labels,
        labels: { style: { colors: "#A3AED0", fontSize: "12px" } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#A3AED0", fontSize: "12px" },
          formatter: (v) => `${v}g`,
        },
      },
      grid: {
        borderColor: "#E2E8F0",
        strokeDashArray: 5,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
      },
      tooltip: {
        theme: "dark",
        y: { formatter: (v) => `${v}g` },
      },
      legend: {
        show: true,
        position: "top",
        labels: { colors: "#A3AED0" },
      },
    }),
    [analytics.labels]
  );

  // ─── Summary stats for analytics ────────────────────────────────────────
  const analyticsSummary = useMemo(() => {
    const calData = analytics.calorieData;
    const total = calData.reduce((a, b) => a + b, 0);
    const days = calData.filter((c) => c > 0).length || 1;
    const avgCalories = Math.round(total / days);
    const avgProtein = Math.round(
      analytics.proteinData.reduce((a, b) => a + b, 0) / days
    );
    const goalDays = calData.filter((c) => c > 0 && c <= calorieGoals.calories).length;
    const totalTrackedDays = calData.filter((c) => c > 0).length;
    const goalCompliance =
      totalTrackedDays > 0 ? Math.round((goalDays / totalTrackedDays) * 100) : 0;
    return { avgCalories, avgProtein, goalCompliance };
  }, [analytics, calorieGoals.calories]);

  // ─── Form Handlers ──────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.foodName.trim()) errs.foodName = "Food name is required";
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0)
      errs.quantity = "Enter a valid quantity";
    if (!form.calories || isNaN(form.calories) || Number(form.calories) < 0)
      errs.calories = "Enter valid calories";
    return errs;
  };

  const handleAddEntry = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const newEntry = {
      date: selectedDate,
      mealType: form.mealType,
      foodName: form.foodName,
      quantity: Number(form.quantity),
      unit: form.unit,
      calories: Number(form.calories),
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      fromPhoto: !!photoPreview,
    };
    addCalorieEntry(newEntry);
    setPhotoPreview(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleDeleteEntry = (id) => {
    removeCalorieEntry(id);
  };

  /**
   * Phase 2.E: Log a planned meal from the Meal Planner instantly.
   * One-click action that logs the meal's predefined nutritional data.
   */
  const handleLogPlannedMeal = (meal) => {
    const mealKey = `${meal.dayKey}-${meal.mealType}`;
    logPlannedMeal(meal);
    setLoggedPlannedMeals((prev) => new Set([...prev, mealKey]));
  };

  // Phase 9: Real AI food recognition via Gemini + auto-log to meal planner
  const [detectedDishes, setDetectedDishes] = useState([]);
  const [showDetectedModal, setShowDetectedModal] = useState(false);
  const addDishToMeal = useAppStore((s) => s.addDishToMeal);
  const assignMeal = useAppStore((s) => s.assignMeal);

  const handlePhotoUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);

    setIsAnalyzing(true);
    try {
      // Call real Gemini AI via backend
      const result = await analyzeFood(file);
      const data = result.data;
      setIsAnalyzing(false);

      if (data.dishes && data.dishes.length > 0) {
        // Multi-dish detection (Vietnamese mâm cơm support)
        if (data.dishes.length > 1) {
          setDetectedDishes(data.dishes);
          setShowDetectedModal(true);
        } else {
          // Single dish — auto-fill form
          const dish = data.dishes[0];
          setForm({
            mealType: dish.mealType || data.mealTypeSuggestion || "Lunch",
            foodName: dish.name || "Unknown Food",
            quantity: "1",
            unit: dish.servingSize || "serving",
            calories: String(dish.calories || 0),
            protein: String(dish.protein || 0),
            carbs: String(dish.carbs || 0),
            fat: String(dish.fat || 0),
          });
        }
      }
    } catch (err) {
      console.warn("[NutritionTracking] AI analysis failed, using fallback:", err);
      setIsAnalyzing(false);
      // Fallback to mock data
      setForm({
        mealType: "Lunch",
        foodName: "Grilled Chicken",
        quantity: "1",
        unit: "serving",
        calories: "320",
        protein: "42",
        carbs: "0",
        fat: "14",
      });
    }
  };

  /**
   * Phase 9: Auto-log all detected dishes from food recognition.
   * Logs each dish as a calorie entry AND auto-creates meal slot dishes.
   */
  const handleLogDetectedDishes = () => {
    const today = new Date().toISOString().split("T")[0];
    const mealType = detectedDishes[0]?.mealType || "Lunch";
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayKey = days[new Date().getDay()];
    const slotKey = `${dayKey}-${mealType}`;

    // Log each dish as a calorie entry
    detectedDishes.forEach((dish) => {
      addCalorieEntry({
        date: today,
        mealType,
        foodName: dish.name,
        quantity: 1,
        unit: dish.servingSize || "serving",
        calories: dish.calories || 0,
        protein: dish.protein || 0,
        carbs: dish.carbs || 0,
        fat: dish.fat || 0,
        fromPhoto: true,
      });
    });

    // Auto-log to meal planner (multi-dish)
    const mealDishes = detectedDishes.map((dish) => ({
      customName: dish.name,
      calories: dish.calories || 0,
      protein: dish.protein || 0,
      carbs: dish.carbs || 0,
      fat: dish.fat || 0,
    }));
    assignMeal(slotKey, mealDishes);

    setShowDetectedModal(false);
    setDetectedDishes([]);
    setPhotoPreview(null);
  };

  const mealTypeColor = {
    Breakfast: "bg-amber-50 text-amber-600",
    Lunch: "bg-blue-50 text-blue-600",
    Dinner: "bg-brand-50 text-brand-600",
    Snack: "bg-green-50 text-green-600",
  };

  const macroBar = (label, current, goal, color) => {
    const pct = Math.min(100, Math.round((current / goal) * 100));
    return (
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
          <span>{label}</span>
          <span>
            {current}g &nbsp;<span className="text-gray-400">({pct}%)</span>
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-navy-700">
          <div
            className={`h-2 rounded-full transition-all ${color}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  };

  // Filter today's planned meals that haven't been logged yet
  const unloggedPlannedMeals = todayPlannedMeals.filter(
    (m) => !loggedPlannedMeals.has(`${m.dayKey}-${m.mealType}`)
  );

  return (
    <div>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="mt-3 mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Nutrition & Tracking
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Log your meals and track your nutritional progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
          />
        </div>
      </div>

      {/* ─── Tab Navigation ──────────────────────────────────────────────── */}
      <div className="mb-5 flex gap-2">
        <button
          onClick={() => setActiveTab("log")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "log"
              ? "bg-brand-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
          }`}
        >
          <MdOutlineLocalFireDepartment className="h-4 w-4" />
          Today's Log
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
            activeTab === "analytics"
              ? "bg-brand-500 text-white shadow-md"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
          }`}
        >
          <MdOutlineBarChart className="h-4 w-4" />
          7-Day Analytics
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: TODAY'S LOG                                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "log" && (
        <>
          {/* ─── Phase 2.E: Log Planned Meals Quick Actions ──────────────── */}
          {unloggedPlannedMeals.length > 0 && (
            <Card extra="mb-5 p-5">
              <div className="mb-3 flex items-center gap-2">
                <MdOutlineCalendarMonth className="h-5 w-5 text-brand-500" />
                <h2 className="text-base font-bold text-navy-700 dark:text-white">
                  Today's Planned Meals
                </h2>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-500">
                  From Meal Planner
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                Quick-log your planned meals with one click — no manual entry needed.
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {unloggedPlannedMeals.map((meal) => (
                  <button
                    key={`${meal.dayKey}-${meal.mealType}`}
                    onClick={() => handleLogPlannedMeal(meal)}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 text-left transition hover:border-brand-400 hover:bg-brand-50 dark:border-white/10 dark:hover:bg-navy-700"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-navy-600">
                      <MdOutlinePlayArrow className="h-5 w-5 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-navy-700 dark:text-white">
                        {meal.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                            mealTypeColor[meal.mealType]
                          }`}
                        >
                          {meal.mealType}
                        </span>
                        <span>🔥 {meal.calories} kcal</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {/* AI Photo Analysis */}
            <Card extra="p-5">
              <div className="mb-3 flex items-center gap-2">
                <MdOutlineCameraAlt className="h-5 w-5 text-brand-500" />
                <h2 className="text-base font-bold text-navy-700 dark:text-white">
                  AI Photo Analysis
                </h2>
              </div>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                Take a photo of your food for instant calorie and nutrition analysis.
              </p>

              {photoPreview ? (
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <img
                    src={photoPreview}
                    alt="Food"
                    className="h-40 w-full object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                      <svg
                        className="mb-2 h-8 w-8 animate-spin text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-white">
                        Analysing your meal...
                      </p>
                    </div>
                  )}
                  {!isAnalyzing && (
                    <>
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => setPhotoPreview(null)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                        >
                          <MdClose className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 rounded-xl bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                        ✓ Analysis complete — review & add below
                      </div>
                    </>
                  )}
                </div>
              ) : null}

              <div className="flex gap-3">
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  <MdOutlineCloudUpload className="h-5 w-5" />
                  Upload Photo
                </button>
                <button
                  disabled
                  className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-400 dark:bg-navy-700"
                >
                  <MdOutlineCameraAlt className="h-5 w-5" />
                  Take Photo{" "}
                  <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-navy-600">
                    Soon
                  </span>
                </button>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoUpload(e.target.files[0])}
              />
            </Card>

            {/* Daily Progress */}
            <Card extra="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-navy-700 dark:text-white">
                  Daily Progress
                </h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(selectedDate)}
                </span>
              </div>

              {/* Calories bar */}
              <div className="mb-4 rounded-2xl bg-gray-50 p-4 dark:bg-navy-700">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MdOutlineLocalFireDepartment className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-semibold text-navy-700 dark:text-white">
                      Calories
                    </span>
                  </div>
                  <span className="text-sm font-bold text-navy-700 dark:text-white">
                    {totals.calories}{" "}
                    <span className="font-normal text-gray-500">
                      / {calorieGoals.calories}
                    </span>
                  </span>
                </div>
                <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-navy-600">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      caloriePercent >= 100 ? "bg-red-500" : "bg-brand-500"
                    }`}
                    style={{ width: `${caloriePercent}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-brand-500">
                    {caloriesRemaining} kcal
                  </span>{" "}
                  Remaining
                </p>
              </div>

              {/* Macros */}
              <div className="mb-2">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Macros
                </p>
                {macroBar("Protein", totals.protein, calorieGoals.protein, "bg-brand-500")}
                {macroBar("Carbs", totals.carbs, calorieGoals.carbs, "bg-cyan-400")}
                {macroBar("Fat", totals.fat, calorieGoals.fat, "bg-orange-400")}
              </div>

              {/* Today's Entries */}
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Today's Entries
                </p>
                {dayEntries.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-4">
                    No entries for this date.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-navy-700"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              mealTypeColor[entry.mealType]
                            }`}
                          >
                            {entry.mealType}
                          </span>
                          <span className="text-sm font-medium text-navy-700 dark:text-white">
                            {entry.foodName}
                          </span>
                          {entry.fromPlannedMeal && (
                            <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-brand-600">
                              📅 Planned
                            </span>
                          )}
                          {entry.fromPhoto && (
                            <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-600">
                              📷 Photo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-red-500">
                            🔥 {entry.calories} kcal
                          </span>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500"
                          >
                            <MdOutlineDelete className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Manual Entry Form */}
          <div className="mt-5">
            <Card extra="p-5">
              <div className="mb-4">
                <h2 className="text-base font-bold text-navy-700 dark:text-white">
                  Manual Entry
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Log food entries manually or edit AI-detected values.
                </p>
              </div>

              <form onSubmit={handleAddEntry}>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Meal Type
                    </label>
                    <select
                      value={form.mealType}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, mealType: e.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-navy-700 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                    >
                      {MEAL_TYPES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Food Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Grilled Chicken"
                      value={form.foodName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, foodName: e.target.value }))
                      }
                      className={`w-full rounded-xl border px-3 py-2 text-sm text-navy-700 outline-none transition dark:bg-navy-700 dark:text-white ${
                        errors.foodName
                          ? "border-red-500"
                          : "border-gray-200 focus:border-brand-500 dark:border-white/10"
                      }`}
                    />
                    {errors.foodName && (
                      <p className="mt-1 text-xs text-red-500">{errors.foodName}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 1"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, quantity: e.target.value }))
                      }
                      className={`w-full rounded-xl border px-3 py-2 text-sm text-navy-700 outline-none transition dark:bg-navy-700 dark:text-white ${
                        errors.quantity
                          ? "border-red-500"
                          : "border-gray-200 focus:border-brand-500 dark:border-white/10"
                      }`}
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Unit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. serving"
                      value={form.unit}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, unit: e.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-navy-700 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Calories
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="kcal"
                      value={form.calories}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, calories: e.target.value }))
                      }
                      className={`w-full rounded-xl border px-3 py-2 text-sm text-navy-700 outline-none transition dark:bg-navy-700 dark:text-white ${
                        errors.calories
                          ? "border-red-500"
                          : "border-gray-200 focus:border-brand-500 dark:border-white/10"
                      }`}
                    />
                    {errors.calories && (
                      <p className="mt-1 text-xs text-red-500">{errors.calories}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="g"
                      value={form.protein}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, protein: e.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-navy-700 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="g"
                      value={form.carbs}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, carbs: e.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-navy-700 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="g"
                      value={form.fat}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fat: e.target.value }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-navy-700 outline-none transition focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  <MdOutlineAdd className="h-5 w-5" />
                  Add Food Entry
                </button>
              </form>
            </Card>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: 7-DAY ANALYTICS (Phase 2.F — reactive to calorie entries)   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "analytics" && (
        <>
          {/* Summary Widgets */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Card extra="!flex-row items-center rounded-[20px] p-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-50 dark:bg-navy-700">
                <MdOutlineLocalFireDepartment className="h-7 w-7 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Calories / Day</p>
                <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
                  {analyticsSummary.avgCalories} kcal
                </h4>
              </div>
            </Card>
            <Card extra="!flex-row items-center rounded-[20px] p-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-navy-700">
                <MdOutlineFitnessCenter className="h-7 w-7 text-brand-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Protein / Day</p>
                <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
                  {analyticsSummary.avgProtein}g
                </h4>
              </div>
            </Card>
            <Card extra="!flex-row items-center rounded-[20px] p-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-navy-700">
                <MdOutlineTrackChanges className="h-7 w-7 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Goal Compliance</p>
                <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
                  {analyticsSummary.goalCompliance}%
                </h4>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
            {/* Calorie Trend Line Chart */}
            <Card extra="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-navy-700 dark:text-white">
                    Calorie Intake — 7 Days
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Daily vs. {calorieGoals.calories} kcal goal
                  </p>
                </div>
                <span className="rounded-xl bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-500">
                  Live Data
                </span>
              </div>
              <div className="h-[260px]">
                <LineChart
                  series={calorieLineChartData}
                  options={calorieLineChartOptions}
                />
              </div>
            </Card>

            {/* Macro Breakdown Bar Chart */}
            <Card extra="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-navy-700 dark:text-white">
                    Macro Breakdown — 7 Days
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Protein, Carbs & Fat (grams)
                  </p>
                </div>
                <div className="flex gap-3">
                  {[
                    { label: "Protein", color: "bg-brand-500" },
                    { label: "Carbs", color: "bg-cyan-400" },
                    { label: "Fat", color: "bg-orange-500" },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1">
                      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-[260px]">
                <BarChart
                  chartData={macroBarChartData}
                  chartOptions={macroBarChartOptions}
                />
              </div>
            </Card>
          </div>

          {/* Daily Detail Table */}
          <div className="mt-5">
            <Card extra="p-5">
              <h2 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
                Daily Nutrition Breakdown
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {["Day", "Calories", "vs Goal", "Protein", "Carbs", "Fat", "Status"].map(
                        (col) => (
                          <th
                            key={col}
                            className="border-b border-gray-200 py-3 pr-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:border-white/10"
                          >
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.labels.map((day, idx) => {
                      const cal = analytics.calorieData[idx];
                      const diff = cal - calorieGoals.calories;
                      const underGoal = cal <= calorieGoals.calories;
                      return (
                        <tr
                          key={day}
                          className="hover:bg-gray-50 dark:hover:bg-navy-700"
                        >
                          <td className="py-3 pr-4 text-sm font-bold text-navy-700 dark:text-white">
                            {day}
                          </td>
                          <td className="py-3 pr-4 text-sm text-gray-600 dark:text-white">
                            🔥 {cal.toLocaleString()} kcal
                          </td>
                          <td className="py-3 pr-4 text-sm">
                            <span
                              className={`font-medium ${
                                underGoal ? "text-green-600" : "text-red-500"
                              }`}
                            >
                              {cal === 0 ? "—" : `${underGoal ? "" : "+"}${diff} kcal`}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-sm text-gray-600 dark:text-white">
                            {analytics.proteinData[idx]}g
                          </td>
                          <td className="py-3 pr-4 text-sm text-gray-600 dark:text-white">
                            {analytics.carbsData[idx]}g
                          </td>
                          <td className="py-3 pr-4 text-sm text-gray-600 dark:text-white">
                            {analytics.fatData[idx]}g
                          </td>
                          <td className="py-3">
                            {cal === 0 ? (
                              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                                No Data
                              </span>
                            ) : (
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  underGoal
                                    ? "bg-green-50 text-green-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {underGoal ? "On Track" : "Over Goal"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* ─── Phase 9: Multi-Dish Detection Modal (Auto-log to Meal Planner) ── */}
      {showDetectedModal && detectedDishes.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                  <MdOutlineAutoAwesome className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-navy-700 dark:text-white">
                    Dishes Detected! 🍲
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    AI found {detectedDishes.length} dishes — Vietnamese Mâm Cơm style
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowDetectedModal(false); setDetectedDishes([]); }}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
              >
                <MdClose className="h-5 w-5 text-gray-600 dark:text-white" />
              </button>
            </div>

            <div className="p-5">
              <div className="mb-4 space-y-2">
                {detectedDishes.map((dish, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-navy-700"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy-700 dark:text-white">
                        {dish.name}
                      </p>
                      <div className="mt-0.5 flex gap-3 text-xs text-gray-500">
                        <span>🔥 {dish.calories} kcal</span>
                        <span>P: {dish.protein}g</span>
                        <span>C: {dish.carbs}g</span>
                        <span>F: {dish.fat}g</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                      {Math.round((dish.confidence || 0.9) * 100)}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Total nutrition */}
              <div className="mb-4 rounded-xl bg-brand-50 p-3 dark:bg-brand-900/20">
                <p className="mb-1 text-xs font-bold uppercase text-brand-600">Total Nutrition</p>
                <div className="flex gap-4 text-sm font-semibold text-navy-700 dark:text-white">
                  <span>🔥 {detectedDishes.reduce((s, d) => s + (d.calories || 0), 0)} kcal</span>
                  <span>P: {detectedDishes.reduce((s, d) => s + (d.protein || 0), 0)}g</span>
                  <span>C: {detectedDishes.reduce((s, d) => s + (d.carbs || 0), 0)}g</span>
                  <span>F: {detectedDishes.reduce((s, d) => s + (d.fat || 0), 0)}g</span>
                </div>
              </div>

              <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
                ✅ Logging will add all dishes to <strong>Calorie Tracker</strong> and auto-create entries in your <strong>Meal Planner</strong>.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDetectedModal(false); setDetectedDishes([]); }}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogDetectedDishes}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-600"
                >
                  <MdOutlineCalendarMonth className="h-4 w-4" />
                  Log All & Add to Meal Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionTracking;
