/**
 * ============================================================================
 * AI Recipe Generator — Vietnamese Multi-Dish + Use All Pantry (Phase 8)
 * ============================================================================
 *
 * Enhancements:
 * - Meal Style toggle: "Single Dish" vs "Vietnamese Multi-Dish Meal (Mâm Cơm)"
 * - "Use All Pantry Items" button in Step 1
 * - Vietnamese meal generates 3-5 complementary dishes
 * - Calls real Gemini AI via backend API
 * ============================================================================
 */

import React, { useState } from "react";
import Card from "components/card";
import RecipeResultCard from "./components/RecipeResultCard";
import VietnameseMealResultCard from "./components/VietnameseMealResultCard";
import useAppStore from "store/useAppStore";
import { generateRecipe as generateRecipeAPI } from "services/recipeService";
import { generateVietnameseMeal as generateVietnameseMealAPI } from "services/aiService";
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
  "Fish Sauce", "Tofu", "Morning Glory", "Lemongrass", "Shrimp", "Pork Belly",
  "Rice Noodles", "Soy Sauce", "Green Onion", "Coriander", "Chili",
];

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Snack", "Dinner"];
const UTENSIL_OPTIONS = [
  "Stove Top", "Oven", "Microwave", "Air Fryer", "Sous Vide Machine",
  "Blender", "Food Processor", "BBQ", "Slow Cooker", "Pressure Cooker",
];
const TIME_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120];
const SKILL_OPTIONS = [
  { label: "Novice", emoji: "🌱", desc: "Just starting out" },
  { label: "Intermediate", emoji: "👨‍🍳", desc: "Comfortable with most techniques" },
  { label: "Expert", emoji: "⭐", desc: "Michelin-starred level" },
];
const MEAL_STYLES = [
  { key: "single_dish", label: "Single Dish", icon: "🍽️", desc: "One complete recipe" },
  { key: "vietnamese_meal", label: "Vietnamese Mâm Cơm", icon: "🍲", desc: "Multi-dish family meal (3-5 dishes)" },
];
const TOTAL_STEPS = 7;

// ─── Expiry helpers ────────────────────────────────────────────────────────
const isExpiringSoon = (expiryDate) => {
  const diff = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff <= 3 && diff >= 0;
};
const getDaysUntilExpiry = (expiryDate) =>
  Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

// ─── Step 1: Ingredients ──────────────────────────────────────────────────
const StepIngredients = ({ selected, onToggle, customInput, setCustomInput, onAddCustom, pantryItems, onUseAllPantry }) => {
  const sortedPantry = [...pantryItems].sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
  return (
    <div>
      <h2 className="text-lg font-bold text-navy-700 dark:text-white">Step 1: Add ingredients</h2>
      <p className="mt-1 mb-5 text-sm text-gray-500 dark:text-gray-400">Select from your pantry or add custom ingredients.</p>

      <div className="mb-4 flex gap-2">
        <input type="text" value={customInput} onChange={(e) => setCustomInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onAddCustom()} placeholder="Add custom ingredient..." className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:bg-navy-700 dark:text-white" />
        <button onClick={onAddCustom} className="flex items-center gap-1 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"><MdOutlineAdd className="h-4 w-4" />Add</button>
      </div>

      {selected.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selected.map((ing) => (
            <button key={ing} onClick={() => onToggle(ing)} className="flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1.5 text-sm font-semibold text-white">{ing}<MdClose className="h-3.5 w-3.5" /></button>
          ))}
        </div>
      )}

      {sortedPantry.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdOutlineInventory2 className="h-4 w-4 text-brand-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">From Your Pantry</p>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-500">{sortedPantry.length} items</span>
            </div>
            <button onClick={onUseAllPantry} className="flex items-center gap-1.5 rounded-xl bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-600">
              <MdOutlineInventory2 className="h-3.5 w-3.5" />📦 Add All Pantry Items
            </button>
          </div>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">Items expiring soon are highlighted.</p>
          <div className="flex flex-wrap gap-2">
            {sortedPantry.filter((item) => !selected.includes(item.name)).map((item) => {
              const daysLeft = getDaysUntilExpiry(item.expiry);
              const expiring = isExpiringSoon(item.expiry);
              return (
                <button key={item.id} onClick={() => onToggle(item.name)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition hover:border-brand-400 hover:bg-brand-50 ${expiring ? "border-amber-300 bg-amber-50 text-amber-700" : "border-gray-200 bg-gray-50 text-gray-700 dark:border-white/10 dark:bg-navy-700 dark:text-white"}`}>
                  {item.name}
                  {expiring && (<span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-600"><MdOutlineWarning className="h-3 w-3" />{daysLeft}d</span>)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Common Ingredients</p>
      <div className="flex flex-wrap gap-2">
        {COMMON_INGREDIENTS.filter((i) => !selected.includes(i)).map((ing) => (
          <button key={ing} onClick={() => onToggle(ing)} className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-brand-400 hover:bg-brand-50 dark:border-white/10 dark:bg-navy-700 dark:text-white">{ing}</button>
        ))}
      </div>
    </div>
  );
};

// ─── Step 2: Meal Style ───────────────────────────────────────────────────
const StepMealStyle = ({ selected, onSelect }) => (
  <div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">Step 2: Select your meal style</h2>
    <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-gray-400">Choose between a single dish or a complete Vietnamese family meal.</p>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {MEAL_STYLES.map((style) => (
        <button key={style.key} onClick={() => onSelect(style.key)} className={`flex flex-col items-center rounded-2xl border-2 p-8 transition ${selected === style.key ? "border-brand-500 bg-brand-50 dark:bg-navy-700" : "border-gray-200 bg-white hover:border-brand-300 dark:border-white/10 dark:bg-navy-800"}`}>
          <span className="mb-3 text-5xl">{style.icon}</span>
          <span className="text-lg font-bold text-navy-700 dark:text-white">{style.label}</span>
          <span className="mt-1 text-sm text-center text-gray-500">{style.desc}</span>
          {selected === style.key && <MdOutlineCheck className="mt-2 h-5 w-5 text-brand-500" />}
        </button>
      ))}
    </div>
  </div>
);

// ─── Step 3: Meal Type ────────────────────────────────────────────────────
const StepMealType = ({ selected, onSelect }) => (
  <div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">Step 3: Select meal type</h2>
    <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-gray-400">Choose the type of meal.</p>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {MEAL_OPTIONS.map((meal) => {
        const emojis = { Breakfast: "🌅", Lunch: "☀️", Snack: "🍎", Dinner: "🌙" };
        return (<button key={meal} onClick={() => onSelect(meal)} className={`flex flex-col items-center rounded-2xl border-2 p-5 transition ${selected === meal ? "border-brand-500 bg-brand-50 dark:bg-navy-700" : "border-gray-200 bg-white hover:border-brand-300 dark:border-white/10 dark:bg-navy-800"}`}><span className="text-3xl mb-2">{emojis[meal]}</span><span className="text-sm font-semibold text-navy-700 dark:text-white">{meal}</span>{selected === meal && <MdOutlineCheck className="mt-1 h-4 w-4 text-brand-500" />}</button>);
      })}
    </div>
  </div>
);

// ─── Step 4: Utensils ─────────────────────────────────────────────────────
const StepUtensils = ({ selected, onToggle }) => (
  <div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">Step 4: Kitchen utensils</h2>
    <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-gray-400">Select your available equipment.</p>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {UTENSIL_OPTIONS.map((u) => {
        const icons = { "Stove Top": "🍳", "Oven": "🫕", "Microwave": "📡", "Air Fryer": "💨", "Sous Vide Machine": "🌡️", "Blender": "🥤", "Food Processor": "⚙️", "BBQ": "🔥", "Slow Cooker": "🫙", "Pressure Cooker": "💨" };
        const sel = selected.includes(u);
        return (<button key={u} onClick={() => onToggle(u)} className={`flex flex-col items-center rounded-2xl border-2 p-4 transition ${sel ? "border-brand-500 bg-brand-50 dark:bg-navy-700" : "border-gray-200 bg-white hover:border-brand-300 dark:border-white/10 dark:bg-navy-800"}`}><span className="text-2xl mb-1">{icons[u]}</span><span className="text-xs font-semibold text-center text-navy-700 dark:text-white">{u}</span>{sel && <MdOutlineCheck className="mt-1 h-3.5 w-3.5 text-brand-500" />}</button>);
      })}
    </div>
  </div>
);

// ─── Step 5: Time ─────────────────────────────────────────────────────────
const StepTime = ({ selected, onSelect }) => (
  <div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">Step 5: Cooking time</h2>
    <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-gray-400">How much time do you have?</p>
    <div className="flex flex-wrap gap-3">
      {TIME_OPTIONS.map((m) => (<button key={m} onClick={() => onSelect(m)} className={`flex items-center gap-2 rounded-2xl border-2 px-5 py-3 text-sm font-semibold transition ${selected === m ? "border-brand-500 bg-brand-500 text-white" : "border-gray-200 bg-white text-navy-700 hover:border-brand-400 dark:border-white/10 dark:bg-navy-800 dark:text-white"}`}>⏲️ {m < 60 ? `${m} min` : `${m / 60}h${m > 60 ? "s" : ""}`}</button>))}
    </div>
  </div>
);

// ─── Step 6: Skill ────────────────────────────────────────────────────────
const StepSkill = ({ selected, onSelect }) => (
  <div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">Step 6: Skill level</h2>
    <p className="mt-1 mb-6 text-sm text-gray-500 dark:text-gray-400">Your cooking experience.</p>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {SKILL_OPTIONS.map((s) => (<button key={s.label} onClick={() => onSelect(s.label)} className={`flex flex-col items-center rounded-2xl border-2 p-6 transition ${selected === s.label ? "border-brand-500 bg-brand-50 dark:bg-navy-700" : "border-gray-200 bg-white hover:border-brand-300 dark:border-white/10 dark:bg-navy-800"}`}><span className="text-4xl mb-2">{s.emoji}</span><span className="text-base font-bold text-navy-700 dark:text-white">{s.label}</span><span className="mt-1 text-xs text-center text-gray-500">{s.desc}</span>{selected === s.label && <MdOutlineCheck className="mt-2 h-5 w-5 text-brand-500" />}</button>))}
    </div>
  </div>
);

// ─── Step 7: Generate ─────────────────────────────────────────────────────
const StepGenerate = ({ wizard, isLoading, onGenerate }) => (
  <div className="flex flex-col items-center text-center">
    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-navy-700">
      <MdOutlineAutoAwesome className="h-10 w-10 text-brand-500" />
    </div>
    <h2 className="text-lg font-bold text-navy-700 dark:text-white">
      Step 7: Generate your {wizard.mealStyle === "vietnamese_meal" ? "Vietnamese Meal" : "Recipe"}
    </h2>
    <p className="mt-2 mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
      {wizard.mealStyle === "vietnamese_meal" ? "AI will create a complete Vietnamese family meal with 3-5 complementary dishes." : "Press Generate and wait for the magic."}
    </p>

    <div className="mb-6 w-full max-w-md rounded-2xl bg-gray-50 p-4 text-left dark:bg-navy-700">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Your Selections</p>
      <div className="space-y-2 text-sm text-navy-700 dark:text-white">
        <div className="flex justify-between"><span className="text-gray-500">Style:</span><span className="font-medium">{wizard.mealStyle === "vietnamese_meal" ? "🍲 Mâm Cơm" : "🍽️ Single Dish"}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Ingredients:</span><span className="font-medium text-right max-w-[60%]">{wizard.ingredients.length > 0 ? wizard.ingredients.slice(0, 5).join(", ") + (wizard.ingredients.length > 5 ? ` +${wizard.ingredients.length - 5}` : "") : "None"}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Meal:</span><span className="font-medium">{wizard.mealType || "—"}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Time:</span><span className="font-medium">{wizard.time ? `${wizard.time} min` : "—"}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Skill:</span><span className="font-medium">{wizard.skill || "—"}</span></div>
      </div>
    </div>

    <button onClick={onGenerate} disabled={isLoading} className={`flex items-center gap-2 rounded-2xl px-10 py-3 text-base font-bold text-white transition-all ${isLoading ? "cursor-not-allowed bg-brand-300" : "bg-brand-500 hover:bg-brand-600"}`}>
      {isLoading ? (<><svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>{wizard.mealStyle === "vietnamese_meal" ? "Crafting mâm cơm..." : "Generating..."}</>) : (<><MdOutlineAutoAwesome className="h-5 w-5" />Generate {wizard.mealStyle === "vietnamese_meal" ? "Mâm Cơm" : "Recipe"}</>)}
    </button>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

const RecipeGenerator = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [vietnameseMeal, setVietnameseMeal] = useState(null);
  const [customIngInput, setCustomIngInput] = useState("");

  const pantryItems = useAppStore((s) => s.pantryItems);
  const saveAIRecipe = useAppStore((s) => s.saveAIRecipe);
  const saveVietnameseMeal = useAppStore((s) => s.saveVietnameseMeal);

  const [wizard, setWizard] = useState({
    ingredients: [],
    mealStyle: "single_dish",
    mealType: "",
    utensils: [],
    time: 30,
    skill: "Intermediate",
    chefMode: "gourmet",
  });

  const toggleIngredient = (ing) => {
    setWizard((w) => ({ ...w, ingredients: w.ingredients.includes(ing) ? w.ingredients.filter((i) => i !== ing) : [...w.ingredients, ing] }));
  };

  const addCustomIngredient = () => {
    const val = customIngInput.trim();
    if (!val || wizard.ingredients.includes(val)) { setCustomIngInput(""); return; }
    setWizard((w) => ({ ...w, ingredients: [...w.ingredients, val] }));
    setCustomIngInput("");
  };

  const toggleUtensil = (u) => {
    setWizard((w) => ({ ...w, utensils: w.utensils.includes(u) ? w.utensils.filter((x) => x !== u) : [...w.utensils, u] }));
  };

  const handleUseAllPantry = () => {
    const names = pantryItems.map((p) => p.name);
    setWizard((w) => ({ ...w, ingredients: [...new Set([...w.ingredients, ...names])] }));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setRecipe(null);
    setVietnameseMeal(null);
    try {
      if (wizard.mealStyle === "vietnamese_meal") {
        const res = await generateVietnameseMealAPI({ ingredients: wizard.ingredients, mealType: wizard.mealType, servings: 2, preferences: {} });
        setVietnameseMeal(res.data);
      } else {
        const res = await generateRecipeAPI({ ingredients: wizard.ingredients, mealType: wizard.mealType, utensils: wizard.utensils, time: wizard.time, skill: wizard.skill, chefMode: wizard.chefMode, style: "single_dish" });
        setRecipe(res.data);
      }
    } catch {
      if (wizard.mealStyle === "vietnamese_meal") {
        setVietnameseMeal({
          mealName: "Vietnamese Family Dinner (Bữa tối gia đình)",
          description: "A balanced Vietnamese family meal",
          dishes: [
            { name: "Morning Glory Soup (Canh rau muống)", calories: 85, protein: 3, carbs: 8, fat: 2, prepTime: "5 min", cookTime: "10 min", servings: 2, difficulty: "Easy", ingredients: [{ amount: "300", unit: "g", name: "morning glory" }], steps: ["Boil water", "Add morning glory", "Season with fish sauce"], tags: ["Vietnamese", "Soup"] },
            { name: "Braised Pork Belly (Thịt kho tàu)", calories: 380, protein: 22, carbs: 8, fat: 30, prepTime: "15 min", cookTime: "45 min", servings: 2, difficulty: "Medium", ingredients: [{ amount: "500", unit: "g", name: "pork belly" }], steps: ["Caramelize sugar", "Brown pork", "Add coconut juice", "Simmer"], tags: ["Vietnamese", "Pork"] },
            { name: "Stir-fried Tofu (Đậu phụ sốt cà)", calories: 180, protein: 12, carbs: 10, fat: 10, prepTime: "10 min", cookTime: "15 min", servings: 2, difficulty: "Easy", ingredients: [{ amount: "2", unit: "blocks", name: "firm tofu" }], steps: ["Fry tofu", "Make sauce", "Combine"], tags: ["Vietnamese", "Vegetarian"] },
          ],
          totalNutrition: { calories: 645, protein: 37, carbs: 26, fat: 42 },
        });
      } else {
        setRecipe(mockRecipeResult);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1); setRecipe(null); setVietnameseMeal(null);
    setWizard({ ingredients: [], mealStyle: "single_dish", mealType: "", utensils: [], time: 30, skill: "Intermediate", chefMode: "gourmet" });
  };

  const stepLabel = (n) => ["Ingredients", "Style", "Meal Type", "Utensils", "Time", "Skill", "Generate"][n - 1];

  return (
    <div>
      {/* Progress Bar */}
      <div className="mt-3 mb-6">
        <div className="mb-3 flex items-center justify-between">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
            <div key={n} className="flex flex-1 flex-col items-center">
              <button onClick={() => !isLoading && setStep(n)} className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition ${n < step ? "bg-brand-500 text-white" : n === step ? "bg-brand-500 text-white ring-4 ring-brand-200" : "bg-gray-100 text-gray-400 dark:bg-navy-700"}`}>
                {n < step ? <MdOutlineCheck className="h-4 w-4" /> : n}
              </button>
              <span className={`mt-1 hidden text-[10px] font-semibold md:block ${n === step ? "text-brand-500" : "text-gray-400"}`}>{stepLabel(n)}</span>
            </div>
          ))}
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-navy-700">
          <div className="h-1.5 rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }} />
        </div>
      </div>

      {/* Single dish result */}
      {recipe && (
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white">✨ Your Generated Recipe</h2>
            <button onClick={handleReset} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-white">Start Over</button>
          </div>
          <RecipeResultCard recipe={recipe} onSaveToMyRecipes={(r) => saveAIRecipe(r)} />
        </div>
      )}

      {/* Vietnamese multi-dish result */}
      {vietnameseMeal && (
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white">🍲 Your Vietnamese Mâm Cơm</h2>
            <button onClick={handleReset} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-white">Start Over</button>
          </div>
          <VietnameseMealResultCard
            meal={vietnameseMeal}
            onSaveDish={(dish) => saveAIRecipe({ ...dish, nutrition: { protein: dish.protein, carbs: dish.carbs, fat: dish.fat } })}
            onSaveAll={(meal) => saveVietnameseMeal(meal)}
          />
        </div>
      )}

      {/* Step Content */}
      {!recipe && !vietnameseMeal && (
        <Card extra="p-6 md:p-8">
          {step === 1 && <StepIngredients selected={wizard.ingredients} onToggle={toggleIngredient} customInput={customIngInput} setCustomInput={setCustomIngInput} onAddCustom={addCustomIngredient} pantryItems={pantryItems} onUseAllPantry={handleUseAllPantry} />}
          {step === 2 && <StepMealStyle selected={wizard.mealStyle} onSelect={(v) => setWizard((w) => ({ ...w, mealStyle: v }))} />}
          {step === 3 && <StepMealType selected={wizard.mealType} onSelect={(v) => setWizard((w) => ({ ...w, mealType: v }))} />}
          {step === 4 && <StepUtensils selected={wizard.utensils} onToggle={toggleUtensil} />}
          {step === 5 && <StepTime selected={wizard.time} onSelect={(v) => setWizard((w) => ({ ...w, time: v }))} />}
          {step === 6 && <StepSkill selected={wizard.skill} onSelect={(v) => setWizard((w) => ({ ...w, skill: v }))} />}
          {step === 7 && <StepGenerate wizard={wizard} isLoading={isLoading} onGenerate={handleGenerate} />}

          <div className="mt-8 flex justify-between">
            <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1 || isLoading} className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${step === 1 || isLoading ? "cursor-not-allowed opacity-40 bg-gray-100 text-gray-500" : "bg-gray-100 text-navy-700 hover:bg-gray-200 dark:bg-navy-700 dark:text-white"}`}>
              <MdOutlineChevronLeft className="h-5 w-5" />Back
            </button>
            {step < TOTAL_STEPS ? (
              <button onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))} disabled={isLoading} className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
                Next<MdOutlineChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <button onClick={handleGenerate} disabled={isLoading} className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition ${isLoading ? "cursor-not-allowed bg-brand-300" : "bg-brand-500 hover:bg-brand-600"}`}>
                <MdOutlineAutoAwesome className="h-5 w-5" />Generate
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-2xl bg-white p-10 shadow-2xl dark:bg-navy-800">
            <svg className="mb-4 h-14 w-14 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
            <p className="text-base font-bold text-navy-700 dark:text-white">{wizard.mealStyle === "vietnamese_meal" ? "Crafting your Vietnamese mâm cơm..." : "Crafting your recipe..."}</p>
            <p className="mt-1 text-sm text-gray-500">{wizard.mealStyle === "vietnamese_meal" ? "Creating balanced multi-dish meal 🍲" : "Our AI chef is at work 🍳"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeGenerator;
