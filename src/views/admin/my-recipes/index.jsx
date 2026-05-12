/**
 * ============================================================================
 * My Recipes — Enhanced Detail View + Ingredients & Instructions Form
 * ============================================================================
 *
 * Phase 5 Updates:
 * - Larger detail view (5-col grid instead of 3-col)
 * - Clearly displays Ingredients and Instructions in the detail panel
 * - Add/Edit form includes dynamic Ingredients and Instructions inputs
 * ============================================================================
 */

import React, { useState } from "react";
import Card from "components/card";
import useAppStore from "store/useAppStore";
import {
  MdOutlineMenuBook,
  MdOutlineAdd,
  MdOutlineEdit,
  MdOutlineDelete,
  MdOutlineSave,
  MdClose,
  MdOutlineTimer,
  MdOutlinePeople,
  MdOutlineLocalFireDepartment,
  MdOutlineSearch,
  MdOutlineAutoAwesome,
  MdOutlinePlayArrow,
  MdOutlineRemoveCircle,
} from "react-icons/md";

const EMPTY_INGREDIENT = { amount: "", unit: "", name: "" };

const EMPTY_FORM = {
  name: "",
  prepTime: "",
  cookTime: "",
  servings: "",
  difficulty: "Easy",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  tags: "",
  notes: "",
  ingredients: [{ ...EMPTY_INGREDIENT }],
  steps: [""],
};

const difficultyColor = {
  Easy: "bg-green-50 text-green-600",
  Medium: "bg-amber-50 text-amber-600",
  Hard: "bg-red-50 text-red-600",
};

const sourceColor = {
  "AI Generated": "bg-brand-50 text-brand-600",
  Manual: "bg-gray-100 text-gray-600",
};

const MyRecipes = () => {
  const recipes = useAppStore((s) => s.recipes);
  const addRecipe = useAppStore((s) => s.addRecipe);
  const updateRecipe = useAppStore((s) => s.updateRecipe);
  const removeRecipe = useAppStore((s) => s.removeRecipe);

  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecipe, setEditRecipe] = useState(null);
  const [viewRecipe, setViewRecipe] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const filtered = recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(r.tags) &&
        r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const openAdd = () => {
    setEditRecipe(null);
    setForm({
      ...EMPTY_FORM,
      ingredients: [{ ...EMPTY_INGREDIENT }],
      steps: [""],
    });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (recipe) => {
    setEditRecipe(recipe);
    const recipeIngredients = recipe.ingredients?.length
      ? recipe.ingredients.map((ing) => ({
          amount: ing.amount || "",
          unit: ing.unit || "",
          name: ing.name || "",
        }))
      : [{ ...EMPTY_INGREDIENT }];

    const recipeSteps = recipe.steps?.length ? [...recipe.steps] : [""];

    setForm({
      name: recipe.name,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: String(recipe.servings),
      difficulty: recipe.difficulty,
      calories: String(recipe.calories),
      protein: String(recipe.protein),
      carbs: String(recipe.carbs),
      fat: String(recipe.fat),
      tags: Array.isArray(recipe.tags) ? recipe.tags.join(", ") : "",
      notes: recipe.notes || "",
      ingredients: recipeIngredients,
      steps: recipeSteps,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    removeRecipe(id);
    if (viewRecipe?.id === id) setViewRecipe(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Recipe name is required";
    if (!form.calories || isNaN(form.calories))
      errs.calories = "Enter valid calories";
    // Validate ingredients: at least one ingredient with a name
    const hasIngredient = form.ingredients.some((ing) => ing.name.trim());
    if (!hasIngredient) errs.ingredients = "At least one ingredient is required";
    // Validate steps: at least one non-empty step
    const hasStep = form.steps.some((s) => s.trim());
    if (!hasStep) errs.steps = "At least one instruction step is required";
    return errs;
  };

  const handleSave = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const parsed = {
      name: form.name.trim(),
      prepTime: form.prepTime || "—",
      cookTime: form.cookTime || "—",
      servings: Number(form.servings) || 1,
      difficulty: form.difficulty,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      tags: form.tags
        ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [],
      notes: form.notes,
      ingredients: form.ingredients.filter((ing) => ing.name.trim()),
      steps: form.steps.filter((s) => s.trim()),
      source: editRecipe ? editRecipe.source : "Manual",
      savedAt: new Date().toISOString().split("T")[0],
    };

    if (editRecipe) {
      updateRecipe(editRecipe.id, parsed);
      if (viewRecipe?.id === editRecipe.id) {
        setViewRecipe((prev) => ({ ...prev, ...parsed }));
      }
    } else {
      addRecipe(parsed);
    }
    setModalOpen(false);
  };

  // ─── Form Helpers ──────────────────────────────────────────────────────────

  const addIngredientRow = () => {
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, { ...EMPTY_INGREDIENT }],
    }));
  };

  const removeIngredientRow = (idx) => {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== idx),
    }));
  };

  const updateIngredient = (idx, field, value) => {
    setForm((f) => {
      const updated = [...f.ingredients];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...f, ingredients: updated };
    });
  };

  const addStepRow = () => {
    setForm((f) => ({ ...f, steps: [...f.steps, ""] }));
  };

  const removeStepRow = (idx) => {
    setForm((f) => ({
      ...f,
      steps: f.steps.filter((_, i) => i !== idx),
    }));
  };

  const updateStep = (idx, value) => {
    setForm((f) => {
      const updated = [...f.steps];
      updated[idx] = value;
      return { ...f, steps: updated };
    });
  };

  const field = (label, name, type = "text", placeholder = "", colSpan = false) => (
    <div className={colSpan ? "col-span-2" : ""}>
      <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-3 py-2 text-sm text-navy-700 outline-none transition dark:bg-navy-700 dark:text-white ${
          errors[name]
            ? "border-red-500"
            : "border-gray-200 focus:border-brand-500 dark:border-white/10"
        }`}
      />
      {errors[name] && (
        <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mt-3 mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
            My Recipes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Save, manage, and revisit your favourite recipes.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          <MdOutlineAdd className="h-5 w-5" />
          Add Recipe
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        <Card extra="!flex-row items-center rounded-[20px] p-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-navy-700">
            <MdOutlineMenuBook className="h-6 w-6 text-brand-500" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-500">Total Recipes</p>
            <p className="text-xl font-bold text-navy-700 dark:text-white">
              {recipes.length}
            </p>
          </div>
        </Card>
        <Card extra="!flex-row items-center rounded-[20px] p-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-50 dark:bg-navy-700">
            <MdOutlineAutoAwesome className="h-6 w-6 text-green-500" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-500">AI Generated</p>
            <p className="text-xl font-bold text-navy-700 dark:text-white">
              {recipes.filter((r) => r.source === "AI Generated").length}
            </p>
          </div>
        </Card>
        <Card extra="!flex-row items-center rounded-[20px] p-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-50 dark:bg-navy-700">
            <MdOutlineEdit className="h-6 w-6 text-amber-500" />
          </div>
          <div className="ml-3">
            <p className="text-xs font-medium text-gray-500">Manual</p>
            <p className="text-xl font-bold text-navy-700 dark:text-white">
              {recipes.filter((r) => r.source === "Manual").length}
            </p>
          </div>
        </Card>
      </div>

      {/* 5-col grid: 2 cols for list, 3 cols for enhanced detail */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Recipe List — 2 columns */}
        <div className="xl:col-span-2">
          <Card extra="p-5">
            {/* Search */}
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex-1">
                <MdOutlineSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search recipes or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-navy-700">
                  <MdOutlineMenuBook className="h-8 w-8 text-brand-500" />
                </div>
                <p className="text-base font-bold text-navy-700 dark:text-white">
                  No recipes yet
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Add your first recipe or save one from the AI Generator.
                </p>
                <button
                  onClick={openAdd}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  <MdOutlineAdd className="h-4 w-4" />
                  Add Recipe
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => setViewRecipe(recipe)}
                    className={`cursor-pointer rounded-2xl border p-4 transition hover:border-brand-300 hover:shadow-sm dark:border-white/10 ${
                      viewRecipe?.id === recipe.id
                        ? "border-brand-500 bg-brand-50 dark:bg-navy-700"
                        : "border-gray-100 bg-white dark:bg-navy-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-navy-700 dark:text-white">
                            {recipe.name}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              difficultyColor[recipe.difficulty]
                            }`}
                          >
                            {recipe.difficulty}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              sourceColor[recipe.source] || "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {recipe.source === "AI Generated" && "✨ "}
                            {recipe.source}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <MdOutlineTimer className="h-3.5 w-3.5" />
                            {recipe.prepTime} prep
                          </span>
                          <span className="flex items-center gap-1">
                            <MdOutlineTimer className="h-3.5 w-3.5 text-orange-400" />
                            {recipe.cookTime} cook
                          </span>
                          <span className="flex items-center gap-1">
                            <MdOutlinePeople className="h-3.5 w-3.5 text-blue-400" />
                            {recipe.servings} servings
                          </span>
                          <span className="flex items-center gap-1">
                            <MdOutlineLocalFireDepartment className="h-3.5 w-3.5 text-red-400" />
                            {recipe.calories} kcal
                          </span>
                        </div>
                        {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {recipe.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-navy-600 dark:text-gray-400"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(recipe);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-500 transition hover:bg-brand-100 dark:bg-navy-700"
                        >
                          <MdOutlineEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(recipe.id);
                          }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100 dark:bg-navy-700"
                        >
                          <MdOutlineDelete className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Enhanced Recipe Detail Panel — 3 columns (was 1) */}
        <div className="xl:col-span-3">
          {viewRecipe ? (
            <Card extra="p-6">
              <div className="mb-4 flex items-start justify-between gap-2">
                <h2 className="text-xl font-bold text-navy-700 dark:text-white">
                  {viewRecipe.name}
                </h2>
                <button
                  onClick={() => setViewRecipe(null)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
                >
                  <MdClose className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* AI Generated badge */}
              {viewRecipe.source === "AI Generated" && (
                <div className="mb-4 flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-1.5 dark:bg-brand-900/20">
                  <MdOutlineAutoAwesome className="h-4 w-4 text-brand-500" />
                  <span className="text-xs font-semibold text-brand-600">
                    AI Generated Recipe
                  </span>
                </div>
              )}

              {/* Large Nutrition Cards */}
              <div className="mb-5 grid grid-cols-4 gap-3">
                {[
                  { label: "Calories", value: `${viewRecipe.calories} kcal`, color: "bg-red-50 dark:bg-red-900/20" },
                  { label: "Protein", value: `${viewRecipe.protein}g`, color: "bg-brand-50 dark:bg-brand-900/20" },
                  { label: "Carbs", value: `${viewRecipe.carbs}g`, color: "bg-amber-50 dark:bg-amber-900/20" },
                  { label: "Fat", value: `${viewRecipe.fat}g`, color: "bg-green-50 dark:bg-green-900/20" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className={`flex flex-col items-center rounded-xl p-4 ${m.color}`}
                  >
                    <p className="text-xl font-bold text-navy-700 dark:text-white">
                      {m.value}
                    </p>
                    <p className="text-sm text-gray-500">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Meta Info Row */}
              <div className="mb-5 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/10 pb-4">
                <span className="flex items-center gap-1">
                  <MdOutlineTimer className="h-4 w-4 text-brand-500" />
                  Prep: {viewRecipe.prepTime}
                </span>
                <span className="flex items-center gap-1">
                  <MdOutlineTimer className="h-4 w-4 text-orange-400" />
                  Cook: {viewRecipe.cookTime}
                </span>
                <span className="flex items-center gap-1">
                  <MdOutlinePeople className="h-4 w-4 text-blue-400" />
                  {viewRecipe.servings} servings
                </span>
              </div>

              {/* Tags */}
              {Array.isArray(viewRecipe.tags) && viewRecipe.tags.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-1">
                  {viewRecipe.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Ingredients Section */}
              <div className="mb-5">
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-navy-700 dark:text-white">
                  <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-xs text-brand-500">🧂</span>
                  Ingredients
                </h3>
                {viewRecipe.ingredients?.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {viewRecipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2 dark:bg-navy-700">
                        <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                        <span className="text-sm text-navy-700 dark:text-white">
                          <span className="font-semibold">
                            {ing.amount} {ing.unit}
                          </span>{" "}
                          {ing.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No ingredients listed</p>
                )}
              </div>

              {/* Instructions Section */}
              <div className="mb-5">
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-navy-700 dark:text-white">
                  <span className="rounded-lg bg-brand-50 px-2 py-0.5 text-xs text-brand-500">📋</span>
                  Instructions
                </h3>
                {viewRecipe.steps?.length > 0 ? (
                  <ol className="space-y-3">
                    {viewRecipe.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                          {idx + 1}
                        </span>
                        <p className="pt-0.5 text-sm text-navy-700 dark:text-white">{step}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-gray-400 italic">No instructions listed</p>
                )}
              </div>

              {/* Notes */}
              {viewRecipe.notes && (
                <div className="mb-5 rounded-xl bg-gray-50 p-4 dark:bg-navy-700">
                  <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Notes
                  </p>
                  <p className="text-sm text-navy-700 dark:text-white">
                    {viewRecipe.notes}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
                <button
                  onClick={() => openEdit(viewRecipe)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  <MdOutlineEdit className="h-4 w-4" />
                  Edit Recipe
                </button>
                <button
                  onClick={() => handleDelete(viewRecipe.id)}
                  className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-100"
                >
                  <MdOutlineDelete className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </Card>
          ) : (
            <Card extra="flex flex-col items-center justify-center p-10">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-navy-700">
                <MdOutlineMenuBook className="h-10 w-10 text-brand-500" />
              </div>
              <p className="text-center text-base font-semibold text-navy-700 dark:text-white">
                Select a recipe to view details
              </p>
              <p className="mt-1 text-center text-sm text-gray-500">
                Click any recipe card on the left to see full ingredients and instructions
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Modal — with dynamic Ingredients & Instructions */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-navy-800">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-white/10">
              <h2 className="text-lg font-bold text-navy-700 dark:text-white">
                {editRecipe ? "Edit Recipe" : "Add Recipe"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
              >
                <MdClose className="h-5 w-5 text-gray-600 dark:text-white" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  {field("Recipe Name", "name", "text", "e.g. Creamy Tuscan Chicken")}
                </div>
                {field("Prep Time", "prepTime", "text", "e.g. 10 min")}
                {field("Cook Time", "cookTime", "text", "e.g. 25 min")}
                {field("Servings", "servings", "number", "e.g. 4")}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Difficulty
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, difficulty: e.target.value }))
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                  >
                    {["Easy", "Medium", "Hard"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                {field("Calories (kcal)", "calories", "number", "e.g. 520")}
                {field("Protein (g)", "protein", "number", "e.g. 42")}
                {field("Carbs (g)", "carbs", "number", "e.g. 18")}
                {field("Fat (g)", "fat", "number", "e.g. 30")}
                <div className="col-span-2">
                  {field("Tags (comma separated)", "tags", "text", "e.g. Italian, High Protein")}
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Personal Notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                    placeholder="Add your personal tips, modifications, etc."
                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm text-navy-700 outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                  />
                </div>
              </div>

              {/* ─── Dynamic Ingredients ───────────────────────────────────── */}
              <div className="mt-6 border-t border-gray-100 pt-4 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-bold text-navy-700 dark:text-white">
                    🧂 Ingredients
                  </label>
                  <button
                    type="button"
                    onClick={addIngredientRow}
                    className="flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-500 hover:bg-brand-100"
                  >
                    <MdOutlineAdd className="h-3.5 w-3.5" />
                    Add Ingredient
                  </button>
                </div>
                {errors.ingredients && (
                  <p className="mb-2 text-xs text-red-500">{errors.ingredients}</p>
                )}
                <div className="space-y-2">
                  {form.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="flex-1 grid grid-cols-12 gap-2">
                        <input
                          type="text"
                          placeholder="Amount"
                          value={ing.amount}
                          onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                          className="col-span-3 rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Unit"
                          value={ing.unit}
                          onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                          className="col-span-3 rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                        />
                        <input
                          type="text"
                          placeholder="Ingredient name"
                          value={ing.name}
                          onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                          className="col-span-6 rounded-xl border border-gray-200 px-2 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                        />
                      </div>
                      {form.ingredients.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeIngredientRow(idx)}
                          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <MdOutlineRemoveCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Dynamic Instructions ──────────────────────────────────── */}
              <div className="mt-6 border-t border-gray-100 pt-4 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-bold text-navy-700 dark:text-white">
                    📋 Instructions
                  </label>
                  <button
                    type="button"
                    onClick={addStepRow}
                    className="flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-500 hover:bg-brand-100"
                  >
                    <MdOutlineAdd className="h-3.5 w-3.5" />
                    Add Step
                  </button>
                </div>
                {errors.steps && (
                  <p className="mb-2 text-xs text-red-500">{errors.steps}</p>
                )}
                <div className="space-y-2">
                  {form.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-500">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={step}
                        onChange={(e) => updateStep(idx, e.target.value)}
                        placeholder={`Step ${idx + 1}: Describe what to do...`}
                        className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                      />
                      {form.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStepRow(idx)}
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <MdOutlineRemoveCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex gap-3 border-t border-gray-100 pt-4 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
                >
                  <MdOutlineSave className="h-4 w-4" />
                  {editRecipe ? "Save Changes" : "Add Recipe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRecipes;
