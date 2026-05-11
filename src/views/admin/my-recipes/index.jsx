import React, { useState } from "react";
import Card from "components/card";
import {
  MdOutlineMenuBook,
  MdOutlineAdd,
  MdOutlineEdit,
  MdOutlineDelete,
  MdOutlineSave,
  MdClose,
  MdOutlineBookmark,
  MdOutlineTimer,
  MdOutlinePeople,
  MdOutlineLocalFireDepartment,
  MdOutlineSearch,
} from "react-icons/md";

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
    notes: "Best with asparagus on the side.",
    source: "Manual",
    savedAt: "2026-05-08",
  },
];

let nextRecipeId = 4;

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
  const [recipes, setRecipes] = useState(initialRecipes);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecipe, setEditRecipe] = useState(null);
  const [viewRecipe, setViewRecipe] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const filtered = recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openAdd = () => {
    setEditRecipe(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (recipe) => {
    setEditRecipe(recipe);
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
      tags: recipe.tags.join(", "),
      notes: recipe.notes || "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
    if (viewRecipe?.id === id) setViewRecipe(null);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Recipe name is required";
    if (!form.calories || isNaN(form.calories))
      errs.calories = "Enter valid calories";
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
      source: editRecipe ? editRecipe.source : "Manual",
      savedAt: new Date().toISOString().split("T")[0],
    };

    if (editRecipe) {
      setRecipes((prev) =>
        prev.map((r) => (r.id === editRecipe.id ? { ...r, ...parsed } : r))
      );
      if (viewRecipe?.id === editRecipe.id) {
        setViewRecipe((prev) => ({ ...prev, ...parsed }));
      }
    } else {
      const newRecipe = { id: nextRecipeId++, ...parsed };
      setRecipes((prev) => [newRecipe, ...prev]);
    }
    setModalOpen(false);
  };

  const field = (label, name, type = "text", placeholder = "") => (
    <div>
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
            <MdOutlineBookmark className="h-6 w-6 text-green-500" />
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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Recipe List */}
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
                              sourceColor[recipe.source]
                            }`}
                          >
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

        {/* Recipe Detail Panel */}
        <div className="xl:col-span-1">
          {viewRecipe ? (
            <Card extra="p-5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h2 className="text-base font-bold text-navy-700 dark:text-white">
                  {viewRecipe.name}
                </h2>
                <button
                  onClick={() => setViewRecipe(null)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-navy-700"
                >
                  <MdClose className="h-4 w-4 text-gray-500" />
                </button>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2">
                {[
                  { label: "Calories", value: `${viewRecipe.calories} kcal`, color: "bg-red-50 dark:bg-red-900/20" },
                  { label: "Protein", value: `${viewRecipe.protein}g`, color: "bg-brand-50 dark:bg-brand-900/20" },
                  { label: "Carbs", value: `${viewRecipe.carbs}g`, color: "bg-amber-50 dark:bg-amber-900/20" },
                  { label: "Fat", value: `${viewRecipe.fat}g`, color: "bg-green-50 dark:bg-green-900/20" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className={`flex flex-col items-center rounded-xl p-2.5 ${m.color}`}
                  >
                    <p className="text-sm font-bold text-navy-700 dark:text-white">
                      {m.value}
                    </p>
                    <p className="text-xs text-gray-500">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="mb-3 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>⏱ Prep: {viewRecipe.prepTime}</span>
                <span>🍳 Cook: {viewRecipe.cookTime}</span>
                <span>👥 {viewRecipe.servings} servings</span>
              </div>

              <div className="mb-3 flex flex-wrap gap-1">
                {viewRecipe.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {viewRecipe.notes && (
                <div className="rounded-xl bg-gray-50 p-3 dark:bg-navy-700">
                  <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
                    Notes
                  </p>
                  <p className="text-sm text-navy-700 dark:text-white">
                    {viewRecipe.notes}
                  </p>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => openEdit(viewRecipe)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-brand-500 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                >
                  <MdOutlineEdit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(viewRecipe.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                >
                  <MdOutlineDelete className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ) : (
            <Card extra="flex flex-col items-center justify-center p-10">
              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 dark:bg-navy-700">
                <MdOutlineMenuBook className="h-8 w-8 text-brand-500" />
              </div>
              <p className="text-center text-sm font-semibold text-navy-700 dark:text-white">
                Select a recipe to view details
              </p>
              <p className="mt-1 text-center text-xs text-gray-500">
                Click any recipe card on the left
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-navy-800 max-h-[90vh] overflow-y-auto">
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
                      <option key={d} value={d}>
                        {d}
                      </option>
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
              <div className="mt-5 flex gap-3">
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
