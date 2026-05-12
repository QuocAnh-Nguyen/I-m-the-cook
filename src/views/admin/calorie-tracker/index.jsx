import React, { useState, useRef } from "react";
import Card from "components/card";
import { analyzeFood } from "services/aiService";
import {
  MdOutlineLocalFireDepartment,
  MdOutlineCameraAlt,
  MdOutlineCloudUpload,
  MdOutlineAdd,
  MdClose,
  MdOutlineDelete,
  MdOutlineCheck,
  MdOutlineCalendarMonth,
} from "react-icons/md";

const CALORIE_GOAL = 2000;
const PROTEIN_GOAL = 150;
const CARBS_GOAL = 250;
const FAT_GOAL = 65;

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

// Map meal type to a meal-planner day key using today's day
const getTodayDayKey = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date().getDay()];
};

// Sync entry to localStorage so MealPlanner can pick it up
const syncToMealPlanner = (entry) => {
  try {
    const key = "calorie_tracker_synced_meals";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const syncEntry = {
      id: Date.now(),
      day: getTodayDayKey(),
      mealType: entry.mealType,
      name: entry.foodName,
      calories: entry.calories,
      syncedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify([...existing, syncEntry]));
    return true;
  } catch {
    return false;
  }
};

let entryId = 1;

const CalorieTracker = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(toInputDate(today));
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [syncedEntry, setSyncedEntry] = useState(null);
  const [showSyncBanner, setShowSyncBanner] = useState(false);
  const photoInputRef = useRef(null);

  // Filter entries by selected date
  const dayEntries = entries.filter((e) => e.date === selectedDate);

  const totals = dayEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + (Number(e.calories) || 0),
      protein: acc.protein + (Number(e.protein) || 0),
      carbs: acc.carbs + (Number(e.carbs) || 0),
      fat: acc.fat + (Number(e.fat) || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const caloriesRemaining = Math.max(0, CALORIE_GOAL - totals.calories);
  const caloriePercent = Math.min(100, Math.round((totals.calories / CALORIE_GOAL) * 100));

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
      id: entryId++,
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
    setEntries((prev) => [...prev, newEntry]);

    // Auto-sync to Meal Planner if this came from a photo analysis
    if (photoPreview) {
      const synced = syncToMealPlanner(newEntry);
      if (synced) {
        setSyncedEntry(newEntry);
        setShowSyncBanner(true);
        setTimeout(() => setShowSyncBanner(false), 5000);
      }
      setPhotoPreview(null);
    }

    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleDeleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handlePhotoUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      setPhotoPreview(ev.target.result);
      setIsAnalyzing(true);
      try {
        const result = await analyzeFood(file);
        const data = result.data;
        if (data.dishes && data.dishes.length > 0) {
          // Use the highest-confidence dish as the primary entry
          const bestDish = data.dishes.reduce((best, d) =>
            (d.confidence || 0) > (best.confidence || 0) ? d : best
          );
          setForm({
            mealType: bestDish.mealType || "Lunch",
            foodName: bestDish.name || "Unknown Food",
            quantity: "1",
            unit: bestDish.servingSize || "serving",
            calories: String(bestDish.calories || 0),
            protein: String(bestDish.protein || 0),
            carbs: String(bestDish.carbs || 0),
            fat: String(bestDish.fat || 0),
          });
        }
      } catch {
        // Fallback: keep the form empty so user fills manually
        console.warn("[CalorieTracker] AI analysis failed, using manual entry");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handler to add all detected dishes as individual entries
  const handlePhotoUploadAllDishes = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      setPhotoPreview(ev.target.result);
      setIsAnalyzing(true);
      try {
        const result = await analyzeFood(file);
        const data = result.data;
        if (data.dishes && data.dishes.length > 0) {
          const newEntries = data.dishes.map((dish) => ({
            id: entryId++,
            date: selectedDate,
            mealType: dish.mealType || "Lunch",
            foodName: dish.name || "Unknown Food",
            quantity: 1,
            unit: dish.servingSize || "serving",
            calories: dish.calories || 0,
            protein: dish.protein || 0,
            carbs: dish.carbs || 0,
            fat: dish.fat || 0,
            fromPhoto: true,
          }));
          setEntries((prev) => [...prev, ...newEntries]);
          // Auto-sync first entry to meal planner
          if (newEntries.length > 0) {
            const synced = syncToMealPlanner(newEntries[0]);
            if (synced) {
              setSyncedEntry(newEntries[0]);
              setShowSyncBanner(true);
              setTimeout(() => setShowSyncBanner(false), 5000);
            }
          }
          setPhotoPreview(null);
          setForm(EMPTY_FORM);
        }
      } catch {
        console.warn("[CalorieTracker] AI multi-dish analysis failed");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
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

  return (
    <div>
      {/* Meal Planner Sync Banner */}
      {showSyncBanner && syncedEntry && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-green-500 px-5 py-3 text-white shadow-lg">
          <MdOutlineCheck className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">Synced to Meal Planner!</p>
            <p className="text-xs opacity-90">
              "{syncedEntry.foodName}" has been added to your{" "}
              <span className="font-semibold">{getTodayDayKey()} — {syncedEntry.mealType}</span> slot.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MdOutlineCalendarMonth className="h-5 w-5 opacity-80" />
            <button
              onClick={() => setShowSyncBanner(false)}
              className="opacity-80 hover:opacity-100"
            >
              <MdClose className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mt-3 mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            Calorie Tracker
          </h1>
          <p className="text-sm font-semibold text-brand-500">
            AI-Powered Food Logging
          </p>
          <p className="mt-1 max-w-xl text-sm text-gray-500 dark:text-gray-400">
            Track your nutrition effortlessly with AI photo analysis. Just snap a
            photo of your meal and get instant calorie and macro estimates, or log
            entries manually with precision.
          </p>
        </div>
        {/* Date Selector */}
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

          {!isAnalyzing && photoPreview && (
            <div className="mb-3 rounded-xl bg-brand-50 px-4 py-2.5 dark:bg-navy-700">
              <p className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                📋 AI detected values — click "Add Food Entry" to log and auto-sync to Meal Planner
              </p>
            </div>
          )}

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
                Coming Soon
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

          {/* Calories ring/bar */}
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
                <span className="font-normal text-gray-500">/ {CALORIE_GOAL}</span>
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
              Calories Remaining
            </p>
          </div>

          {/* Macros */}
          <div className="mb-2">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Macros
            </p>
            {macroBar("Protein", totals.protein, PROTEIN_GOAL, "bg-brand-500")}
            {macroBar("Carbs", totals.carbs, CARBS_GOAL, "bg-cyan-400")}
            {macroBar("Fat", totals.fat, FAT_GOAL, "bg-orange-400")}
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
                      <span className="text-xs text-gray-400">
                        {entry.quantity} {entry.unit}
                      </span>
                      {entry.fromPhoto && (
                        <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-600">
                          📷 Synced
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
              {/* Meal Type */}
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

              {/* Food Name */}
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

              {/* Quantity */}
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

              {/* Unit */}
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

              {/* Calories */}
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

              {/* Protein */}
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

              {/* Carbs */}
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

              {/* Fat */}
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
              {photoPreview && !isAnalyzing && (
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                  + Sync to Meal Planner
                </span>
              )}
            </button>
          </form>
        </Card>
      </div>

      {/* Tracking Tips */}
      <div className="mt-5">
        <Card extra="p-5">
          <h2 className="mb-4 text-base font-bold text-navy-700 dark:text-white">
            💡 Tracking Tips
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                title: "Photo Quality",
                desc: "Take clear, well-lit photos for better AI analysis accuracy.",
                icon: "📸",
              },
              {
                title: "Portion Size",
                desc: "Include reference objects for better portion estimation.",
                icon: "🍽️",
              },
              {
                title: "Consistency",
                desc: "Log meals regularly for better habit tracking.",
                icon: "📅",
              },
            ].map((tip) => (
              <div
                key={tip.title}
                className="flex items-start gap-3 rounded-2xl bg-brand-50 p-4 dark:bg-navy-700"
              >
                <span className="text-2xl">{tip.icon}</span>
                <div>
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    {tip.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {tip.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CalorieTracker;
