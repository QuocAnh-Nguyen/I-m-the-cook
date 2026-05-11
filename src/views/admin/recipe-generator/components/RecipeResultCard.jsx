import React, { useState } from "react";
import Card from "components/card";
import {
  MdOutlineTimer,
  MdOutlineLocalFireDepartment,
  MdOutlinePeople,
  MdOutlineBookmark,
  MdOutlineCheck,
} from "react-icons/md";

const NutritionBadge = ({ label, value, unit, color }) => (
  <div className={`flex flex-col items-center rounded-2xl p-3 ${color}`}>
    <span className="text-lg font-bold text-navy-700 dark:text-white">
      {value}
      <span className="text-xs font-medium">{unit}</span>
    </span>
    <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
  </div>
);

const RecipeResultCard = ({ recipe, onSaveToMyRecipes }) => {
  const [saved, setSaved] = useState(false);

  if (!recipe) return null;

  const handleSave = () => {
    if (onSaveToMyRecipes) onSaveToMyRecipes(recipe);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Card extra="p-6">
      {/* Header */}
      <div className="mb-4 border-b border-gray-100 pb-4 dark:border-white/10">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-navy-700 dark:text-white">
              {recipe.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1">
              {recipe.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-medium text-brand-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-xl px-3 py-1 text-sm font-semibold ${
                recipe.difficulty === "Easy"
                  ? "bg-green-50 text-green-600"
                  : recipe.difficulty === "Medium"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {recipe.difficulty}
            </span>
            {/* Save to My Recipes */}
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-brand-50 text-brand-600 hover:bg-brand-100"
              }`}
            >
              {saved ? (
                <>
                  <MdOutlineCheck className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <MdOutlineBookmark className="h-4 w-4" />
                  Save Recipe
                </>
              )}
            </button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="mt-3 flex flex-wrap gap-4">
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <MdOutlineTimer className="h-4 w-4 text-brand-500" />
            <span>Prep: {recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <MdOutlineTimer className="h-4 w-4 text-orange-500" />
            <span>Cook: {recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <MdOutlinePeople className="h-4 w-4 text-blue-500" />
            <span>Serves: {recipe.servings}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <MdOutlineLocalFireDepartment className="h-4 w-4 text-red-500" />
            <span>{recipe.calories} kcal / serving</span>
          </div>
        </div>
      </div>

      {/* Nutrition Summary */}
      <div className="mb-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
          Nutrition per Serving
        </h3>
        <div className="grid grid-cols-4 gap-2">
          <NutritionBadge
            label="Calories"
            value={recipe.calories}
            unit=" kcal"
            color="bg-red-50 dark:bg-red-900/20"
          />
          <NutritionBadge
            label="Protein"
            value={recipe.nutrition.protein}
            unit="g"
            color="bg-brand-50 dark:bg-brand-900/20"
          />
          <NutritionBadge
            label="Carbs"
            value={recipe.nutrition.carbs}
            unit="g"
            color="bg-amber-50 dark:bg-amber-900/20"
          />
          <NutritionBadge
            label="Fat"
            value={recipe.nutrition.fat}
            unit="g"
            color="bg-green-50 dark:bg-green-900/20"
          />
        </div>
      </div>

      {/* Two-column: Ingredients + Steps */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Ingredients */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Ingredients
          </h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <span className="text-sm text-navy-700 dark:text-white">
                  <span className="font-medium">
                    {ing.amount} {ing.unit}
                  </span>{" "}
                  {ing.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-gray-400">
            Instructions
          </h3>
          <ol className="space-y-3">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                  {idx + 1}
                </span>
                <p className="text-sm text-navy-700 dark:text-white">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Card>
  );
};

export default RecipeResultCard;
