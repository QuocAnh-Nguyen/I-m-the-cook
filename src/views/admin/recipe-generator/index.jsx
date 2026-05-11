/**
 * ============================================================================
 * AI Recipe Generator — Connected to Global Store
 * ============================================================================
 *
 * Phase 2.A: Pantry Manager → AI Recipe Generator
 *   - Step 1 "Ingredients" auto-extracts available items from the Pantry
 *   - Prioritizes items nearing expiration (sorted by expiry date)
 *   - Shows "From Your Pantry" section with expiry-sorted ingredients
 *
 * Phase 2.B: AI Recipe Generator → My Recipes
 *   - "Save Recipe" pushes the generated recipe to the global store
 *   - Auto-assigns "AI Generated" source badge
 *   - Recipe appears immediately in My Recipes page
 *
 * State: Uses Zustand store for pantry items and recipe saving.
 * ============================================================================
 */

import React, { useState } from "react";
import Card from "components/card";
import RecipeResultCard from "./components/RecipeResultCard";
import useAppStore from "store/useAppStore";
import { mockRecipeResult } from "./variables/mockData";
import {
  MdOutlineAutoAwesome,
  MdOutlineChevronLeft,
  MdOutlineChevronRight,
  MdOutlineCheck,
  MdClose,
  MdOutlineAdd,
  MdOutlineInventory2,
  MdOutlineWarning,
} from "react-icons/md";

// ─── Constants ───────────────────────────────────────────────────────────────

const COMMON_INGREDIENTS = [
  "Chicken", "Beef", "Pork", "Fish", "Eggs", "Milk", "Cheese", "Butter",
  "Onion", "Garlic", "Tomato", "Potato", "Carrot", "Bell Pepper", "Spinach",
  "Rice", "Pasta", "Bread", "Flour", "Salt", "Pepper", "Olive Oil",
  "Lemon", "Avocado", "Broccoli", "Mushrooms", "Ginger", "Herbs", "Honey",
];

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Snack", "Dinner"];

const UTENSIL_OPTIONS = [
  "Stove Top", "Oven", "Microwave", "Air Fryer", "Sous Vide Machine",
  "Blender", "Food Processor", "BBQ", "Slow Cooker", "Pressure Cooker",
];

const TIME_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120];

const SKILL_OPTIONS = [
  { label: "Novice", emoji: "🌱", desc: "Just starting out in the kitchen" },
  { label: "Intermediate", emoji: "👨‍🍳", desc: "Comfortable with most techniques" },
  { label: "Expert", emoji: "⭐", desc: "Michelin-starred level skills" },
];

const CHEF_MODES = [
  {
    key: "gourmet",
    label: "Gourmet Mode",
    icon: "♻️",
    desc: "Use only the best combination of ingredients",
  },
  {
    key: "allin",
    label: "All-In Mode",
    icon: "🙃",
    desc: "Use ALL ingredients listed",
  },
];

const TOTAL_STEPS = 7;

// ─── Expiry helpers ────────────────────────────────────────────────────────
const isExpiringSoon = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0;
};

const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
};

// ─── Step Components ──────────────────────────────────────────────────────

/**
 * Phase 2.A: Enhanced Step 1 with Pantry Integration
 * Shows pantry items sorted by expiry date (soonest first) so users
 * prioritize ingredients that are about to expire.
 */
const StepIngredients = ({
  selected,
  onToggle,
  customInput,
  setCustomInput,
  onAddCustom,
  pantryItems,
}) => {
  // Sort pantry items by expiry (soonest first) to prevent food waste
  const sortedPantry = [...pantryItems].sort(
    (a, b) => new Date(a.expiry) - new Date(b.expiry)
  );

  return (
    <div>
      <h2 className="text-lg font-bold text-navy-700 dark:text-white">
        Step 1: Add the ingredients you have at home
      </h2>
      <p className="mt-1 mb-5 text-sm text-gray-500 dark:text-gray-400">
        Select from your pantry (prioritized by expiry) or add custom ingredients.
      </p>

      {/* Custom ingredient input */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddCustom()}
          placeholder="Add custom ingredient..."
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white"
        />
        <button
          onClick={onAddCustom}
          className="flex items-center gap-1 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          <MdOutlineAdd className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selected.map((ing) => (
            <button
              key={ing}
              onClick={() => onToggle(ing)}
              className="flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white"
            >
              {ing}
              <MdClose className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      )}

      {/* Phase 2.A: Pantry Items — sorted by expiry, expiring items highlighted */}
      {sortedPantry.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 flex items-center gap-2">
            <MdOutlineInventory2 className="h-4 w-4 text-brand-500" />
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
              From Your Pantry
            </p>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-500">
              {sortedPantry.length} items
            </span>
          </div>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
            Items expiring soon are highlighted — use them first to reduce waste!
          </p>
          <div className="flex flex-wrap gap-2">
            {sortedPantry
              .filter((item) => !selected.includes(item.name))
              .map((item) => {
                const daysLeft = getDaysUntilExpiry(item.expiry);
                const expiring = isExpiringSoon(item.expiry);
                return (
                  <button
                    key={item.id}
                    onClick={() => onToggle(item.name)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 ${
                      expiring
                        ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/50 dark:bg-amber-900/20 dark:text-amber-400"
                        : "border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-navy-700 dark:text-white"
                    }`}
                  >
                    {item.name}
                    {expiring && (
                      <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-600 dark:bg-amber-900/40">
                        <MdOutlineWarning className="h-3 w-3" />
                        {daysLeft}d
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Common ingredients */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Common Ingredients
      </p>
      <div className="flex flex-wrap gap-2">
        {COMMON_INGREDIENTS.filter((i) => !selected.includes(i)).map((ing) => (
          <button
            key={ing}
            onClick={() => onToggle(ing)}
            className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600 dark:border-white/10 dark:bg-navy-700 dark:text-white"
          >
            {ing}
          </button>
        ))}
      </div>
    </div>
  );
};

const StepMealType = ({ selected, onSelect }) => (
  <div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">
      Step 2: Select what meal you want to cook
    </h2>
    <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-gray-400">
      Choose the type of meal you're planning to make.
    </p>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {MEAL_OPTIONS.map((meal) => {
        const emojis = { Breakfast: "🌅", Lunch: "☀️", Snack: "🍎", Dinner: "🌙" };
        return (
          <button
            key={meal}
            onClick={() => onSelect(meal)}
            className={`flex flex-col items-center rounded-2xl border-2 p-5 transition ${
              selected === meal
                ? "border-brand-500 bg-brand-50 dark:bg-navy-700"
                : "border-gray-200 bg-white hover:border-brand-300 dark:border-white/10 dark:bg-navy-800"
            }`}
          >
            <span className="text-3xl mb-2">{emojis[meal]}</span>
            <span className="text-sm font-semibold text-navy-700 dark:text-white">
              {meal}
            </span>
            {selected === meal && (
              <MdOutlineCheck className="mt-1 h-4 w-4 text-brand-500" />
            )}
          </button>
        );
      })}
    </div>
  </div>
);

const StepUtensils = ({ selected, onToggle }) => (
  <div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">
      Step 3: Select the kitchen utensils you have
    </h2>
    <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-gray-400">
      Select all the cooking equipment you have available.
    </p>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {UTENSIL_OPTIONS.map((utensil) => {
        const icons = {
          "Stove Top": "🍳", "Oven": "🫕", "Microwave": "📡", "Air Fryer": "💨",
          "Sous Vide Machine": "🌡️", "Blender": "🥤", "Food Processor": "⚙️",
          "BBQ": "🔥", "Slow Cooker": "🫙", "Pressure Cooker": "💨",
        };
        const isSelected = selected.includes(utensil);
        return (
          <button
            key={utensil}
            onClick={() => onToggle(utensil)}
            className={`flex flex-col items-center rounded-2xl border-2 p-4 transition ${
              isSelected
                ? "border-brand-500 bg-brand-50 dark:bg-navy-700"
                : "border-gray-200 bg-white hover:border-brand-300 dark:border-white/10 dark:bg-navy-800"
            }`}
          >
            <span className="text-2xl mb-1">{icons[utensil]}</span>
            <span className="text-xs font-semibold text-center text-navy-700 dark:text-white">
              {utensil}
            </span>
            {isSelected && (
              <MdOutlineCheck className="mt-1 h-3.5 w-3.5 text-brand-500" />
            )}
          </button>
        );
      })}
    </div>
  </div>
);

const StepTime = ({ selected, onSelect }) => (
  <div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">
      Step 4: Select how much time you have
    </h2>
    <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-gray-400">
      Select 5 minutes if you are in a rush or longer if you have time.
    </p>
    <div className="flex flex-wrap gap-3">
      {TIME_OPTIONS.map((mins) => (
        <button
          key={mins}
          onClick={() => onSelect(mins)}
          className={`flex items-center gap-2 rounded-2xl border-2 px-5 py-3 text-sm font-semibold transition ${
            selected === mins
              ? "border-brand-500 bg-brand-500 text-white"
              : "border-gray-200 bg-white text-navy-700 hover:border-brand-400 dark:border-white/10 dark:bg-navy-800 dark:text-white"
          }`}
        >
          <span>⏲️</span>
          {mins < 60
            ? `${mins} minutes`
            : `${mins / 60} hour${mins > 60 ? "s" : ""}`}
        </button>
      ))}
    </div>
  </div>
);

const StepSkill = ({ selected, onSelect }) => (
  <div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">
      Step 5: Select your skill level
    </h2>
    <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-gray-400">
      It doesn't matter if you are a Novice or a Michelin Starred Chef.
    </p>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {SKILL_OPTIONS.map((skill) => (
        <button
          key={skill.label}
          onClick={() => onSelect(skill.label)}
          className={`flex flex-col items-center rounded-2xl border-2 p-6 transition ${
            selected === skill.label
              ? "border-brand-500 bg-brand-50 dark:bg-navy-700"
              : "border-gray-200 bg-white hover:border-brand-300 dark:border-white/10 dark:bg-navy-800"
          }`}
        >
          <span className="text-4xl mb-2">{skill.emoji}</span>
          <span className="text-base font-bold text-navy-700 dark:text-white">
            {skill.label}
          </span>
          <span className="mt-1 text-xs text-center text-gray-500 dark:text-gray-400">
            {skill.desc}
          </span>
          {selected === skill.label && (
            <MdOutlineCheck className="mt-2 h-5 w-5 text-brand-500" />
          )}
        </button>
      ))}
    </div>
  </div>
);

const StepChefMode = ({ selected, onSelect }) => (
  <div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">
      Step 6: Select the desired Chef Mode
    </h2>
    <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-gray-400">
      PantryChef offers two modes: All-In and Gourmet.
    </p>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {CHEF_MODES.map((mode) => (
        <button
          key={mode.key}
          onClick={() => onSelect(mode.key)}
          className={`flex flex-col items-start rounded-2xl border-2 p-6 text-left transition ${
            selected === mode.key
              ? "border-brand-500 bg-brand-50 dark:bg-navy-700"
              : "border-gray-200 bg-white hover:border-brand-300 dark:border-white/10 dark:bg-navy-800"
          }`}
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="text-3xl">{mode.icon}</span>
            <span className="text-base font-bold text-navy-700 dark:text-white">
              {mode.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{mode.desc}</p>
          {selected === mode.key && (
            <div className="mt-3 flex items-center gap-1 text-brand-500">
              <MdOutlineCheck className="h-4 w-4" />
              <span className="text-xs font-semibold">Selected</span>
            </div>
          )}
        </button>
      ))}
    </div>
  </div>
);

const StepGenerate = ({ wizard, isLoading, onGenerate }) => (
  <div className="flex flex-col items-center text-center">
    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-navy-700">
      <MdOutlineAutoAwesome className="h-10 w-10 text-brand-500" />
    </div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">
      Step 7: Generate your Recipe
    </h2>
    <p className="mt-2 mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
      Press the Generate button and wait for the magic to happen.
    </p>

    {/* Summary */}
    <div className="mb-6 w-full max-w-md rounded-2xl bg-gray-50 p-4 text-left dark:bg-navy-700">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
        Your Selections
      </p>
      <div className="space-y-2 text-sm text-navy-700 dark:text-white">
        <div className="flex justify-between">
          <span className="text-gray-500">Ingredients:</span>
          <span className="font-medium text-right max-w-[60%]">
            {wizard.ingredients.length > 0
              ? wizard.ingredients.slice(0, 5).join(", ") +
                (wizard.ingredients.length > 5
                  ? ` +${wizard.ingredients.length - 5} more`
                  : "")
              : "None selected"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Meal:</span>
          <span className="font-medium">{wizard.mealType || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Utensils:</span>
          <span className="font-medium">
            {wizard.utensils.length > 0
              ? wizard.utensils.slice(0, 3).join(", ")
              : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Time:</span>
          <span className="font-medium">
            {wizard.time ? `${wizard.time} min` : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Skill:</span>
          <span className="font-medium">{wizard.skill || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Mode:</span>
          <span className="font-medium capitalize">{wizard.chefMode || "—"}</span>
        </div>
      </div>
    </div>

    <button
      onClick={onGenerate}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-2xl px-10 py-3 text-base font-bold text-white transition-all ${
        isLoading
          ? "cursor-not-allowed bg-brand-300"
          : "bg-brand-500 hover:bg-brand-600 active:bg-brand-700"
      }`}
    >
      {isLoading ? (
        <>
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Generating...
        </>
      ) : (
        <>
          <MdOutlineAutoAwesome className="h-5 w-5" />
          Generate
        </>
      )}
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────

const RecipeGenerator = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [customIngInput, setCustomIngInput] = useState("");

  // Phase 2.A: Read pantry items from global store
  const pantryItems = useAppStore((s) => s.pantryItems);

  // Phase 2.B: Save AI recipe to global store → My Recipes
  const saveAIRecipe = useAppStore((s) => s.saveAIRecipe);

  const [wizard, setWizard] = useState({
    ingredients: [],
    mealType: "",
    utensils: [],
    time: 30,
    skill: "Intermediate",
    chefMode: "gourmet",
  });

  const toggleIngredient = (ing) => {
    setWizard((w) => ({
      ...w,
      ingredients: w.ingredients.includes(ing)
        ? w.ingredients.filter((i) => i !== ing)
        : [...w.ingredients, ing],
    }));
  };

  const addCustomIngredient = () => {
    const val = customIngInput.trim();
    if (!val || wizard.ingredients.includes(val)) {
      setCustomIngInput("");
      return;
    }
    setWizard((w) => ({ ...w, ingredients: [...w.ingredients, val] }));
    setCustomIngInput("");
  };

  const toggleUtensil = (u) => {
    setWizard((w) => ({
      ...w,
      utensils: w.utensils.includes(u)
        ? w.utensils.filter((x) => x !== u)
        : [...w.utensils, u],
    }));
  };

  const handleGenerate = () => {
    setIsLoading(true);
    setRecipe(null);
    setTimeout(() => {
      setRecipe(mockRecipeResult);
      setIsLoading(false);
    }, 2000);
  };

  /**
   * Phase 2.B: Save generated recipe to My Recipes via global store.
   * The store's saveAIRecipe() auto-assigns "AI Generated" badge.
   */
  const handleSaveToMyRecipes = (generatedRecipe) => {
    saveAIRecipe(generatedRecipe);
  };

  const handleReset = () => {
    setStep(1);
    setRecipe(null);
    setWizard({
      ingredients: [],
      mealType: "",
      utensils: [],
      time: 30,
      skill: "Intermediate",
      chefMode: "gourmet",
    });
  };

  const stepLabel = (n) => {
    const labels = [
      "Ingredients", "Meal Type", "Utensils", "Time", "Skill", "Mode", "Generate",
    ];
    return labels[n - 1];
  };

  return (
    <div>
      {/* Progress Bar */}
      <div className="mt-3 mb-6">
        <div className="mb-3 flex items-center justify-between">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <div key={n} className="flex flex-1 flex-col items-center">
              <button
                onClick={() => !isLoading && setStep(n)}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${
                  n < step
                    ? "bg-brand-500 text-white"
                    : n === step
                    ? "bg-brand-500 text-white ring-4 ring-brand-200"
                    : "bg-gray-100 text-gray-400 dark:bg-navy-700"
                }`}
              >
                {n < step ? <MdOutlineCheck className="h-4 w-4" /> : n}
              </button>
              <span
                className={`mt-1 hidden text-[10px] font-semibold md:block ${
                  n === step
                    ? "text-brand-500"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {stepLabel(n)}
              </span>
            </div>
          ))}
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-navy-700">
          <div
            className="h-1.5 rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Result */}
      {recipe && (
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white">
              ✨ Your Generated Recipe
            </h2>
            <button
              onClick={handleReset}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-white dark:hover:bg-navy-700"
            >
              Start Over
            </button>
          </div>
          {/* Phase 2.B: Pass saveAIRecipe handler to RecipeResultCard */}
          <RecipeResultCard
            recipe={recipe}
            onSaveToMyRecipes={handleSaveToMyRecipes}
          />
        </div>
      )}

      {/* Step Content */}
      {!recipe && (
        <Card extra="p-6 md:p-8">
          {step === 1 && (
            <StepIngredients
              selected={wizard.ingredients}
              onToggle={toggleIngredient}
              customInput={customIngInput}
              setCustomInput={setCustomIngInput}
              onAddCustom={addCustomIngredient}
              pantryItems={pantryItems}
            />
          )}
          {step === 2 && (
            <StepMealType
              selected={wizard.mealType}
              onSelect={(v) => setWizard((w) => ({ ...w, mealType: v }))}
            />
          )}
          {step === 3 && (
            <StepUtensils
              selected={wizard.utensils}
              onToggle={toggleUtensil}
            />
          )}
          {step === 4 && (
            <StepTime
              selected={wizard.time}
              onSelect={(v) => setWizard((w) => ({ ...w, time: v }))}
            />
          )}
          {step === 5 && (
            <StepSkill
              selected={wizard.skill}
              onSelect={(v) => setWizard((w) => ({ ...w, skill: v }))}
            />
          )}
          {step === 6 && (
            <StepChefMode
              selected={wizard.chefMode}
              onSelect={(v) => setWizard((w) => ({ ...w, chefMode: v }))}
            />
          )}
          {step === 7 && (
            <StepGenerate
              wizard={wizard}
              isLoading={isLoading}
              onGenerate={handleGenerate}
            />
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || isLoading}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                step === 1 || isLoading
                  ? "cursor-not-allowed opacity-40 bg-gray-100 text-gray-500 dark:bg-navy-700"
                  : "bg-gray-100 text-navy-700 hover:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-navy-600"
              }`}
            >
              <MdOutlineChevronLeft className="h-5 w-5" />
              Back
            </button>

            {step < TOTAL_STEPS ? (
              <button
                onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
              >
                Next
                <MdOutlineChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition ${
                  isLoading
                    ? "cursor-not-allowed bg-brand-300"
                    : "bg-brand-500 hover:bg-brand-600"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <MdOutlineAutoAwesome className="h-5 w-5" />
                    Generate
                  </>
                )}
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-2xl bg-white p-10 shadow-2xl dark:bg-navy-800">
            <svg className="mb-4 h-14 w-14 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-base font-bold text-navy-700 dark:text-white">
              Crafting your recipe...
            </p>
            <p className="mt-1 text-sm text-gray-500">Our AI chef is at work 🍳</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeGenerator;
