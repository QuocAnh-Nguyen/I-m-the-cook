// server/src/services/gemini.service.js
// ============================================================================
// Google Gemini AI Service — all AI features powered by gemini-2.0-flash
// ============================================================================
//
// Methods:
//   analyzeFoodImage(imageBuffer, mimeType)  — Vision: food → nutrition
//   analyzeReceiptImage(imageBuffer, mimeType) — Vision: receipt → groceries
//   generateVietnameseMeal({ ingredients, mealType, servings, preferences })
//   generateRecipe({ ingredients, mealType, utensils, time, skill, chefMode })
//   generateWeeklyMealPlan({ pantryItems, preferences, existingPlan, weekStart })
//
// All methods return structured JSON. The Gemini model is configured to
// respond with application/json for predictable parsing.
// ============================================================================

const { getModel } = require('../config/gemini');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Convert a Buffer to a Gemini-compatible Part for vision requests.
 */
const imagePart = (buffer, mimeType = 'image/jpeg') => ({
  inlineData: { data: buffer.toString('base64'), mimeType },
});

/**
 * Safe JSON parse with fallback — strips markdown fences if present.
 */
const parseJsonResponse = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
};

// ═══════════════════════════════════════════════════════════════════════════
// VISION: Food Image Recognition → Nutrition
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Analyze a food image and return recognized dishes with estimated nutrition.
 * Supports multi-dish Vietnamese meals — can detect multiple plates/dishes.
 *
 * @param {Buffer} imageBuffer - Raw image binary
 * @param {string} mimeType - e.g. 'image/jpeg', 'image/png'
 * @returns {Promise<{ dishes: Array<{ name, confidence, calories, protein, carbs, fat, mealType, servingSize }> }>}
 */
async function analyzeFoodImage(imageBuffer, mimeType = 'image/jpeg') {
  const model = getModel({ temperature: 0.3 });

  const prompt = `You are a Vietnamese food nutrition expert. Analyze this food image carefully.

Identify EVERY dish visible in the image. If this is a traditional Vietnamese "mâm cơm" (family meal with multiple dishes), identify each dish separately.

For each dish, provide:
- name: the dish name in English (with Vietnamese name in parentheses)
- confidence: your confidence level (0.0 to 1.0)
- calories: estimated calories per serving (integer)
- protein: estimated protein in grams (integer)
- carbs: estimated carbs in grams (integer)
- fat: estimated fat in grams (integer)
- mealType: best guess at meal type ("Breakfast", "Lunch", "Dinner", or "Snack")
- servingSize: description of one serving

Return ONLY valid JSON in this exact format:
{
  "dishes": [
    {
      "name": "Morning Glory Soup (Canh rau muống)",
      "confidence": 0.92,
      "calories": 85,
      "protein": 3,
      "carbs": 8,
      "fat": 2,
      "mealType": "Dinner",
      "servingSize": "1 bowl (250ml)"
    }
  ],
  "totalNutrition": {
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fat": 0
  },
  "mealTypeSuggestion": "Dinner",
  "notes": "Brief observation about the meal"
}

If you cannot identify any food, return: { "dishes": [], "error": "No food detected" }`;

  try {
    const result = await model.generateContent([prompt, imagePart(imageBuffer, mimeType)]);
    const response = result.response;
    const text = response.text();
    const data = parseJsonResponse(text);

    // Calculate total nutrition
    if (data.dishes && data.dishes.length > 0) {
      data.totalNutrition = data.dishes.reduce(
        (tot, d) => ({
          calories: tot.calories + (d.calories || 0),
          protein: tot.protein + (d.protein || 0),
          carbs: tot.carbs + (d.carbs || 0),
          fat: tot.fat + (d.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
    }
    return data;
  } catch (error) {
    console.error('[gemini] analyzeFoodImage error:', error.message);
    throw new Error(`Food analysis failed: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VISION: Receipt / Grocery Image → Pantry Items
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Scan a grocery receipt or basket photo and extract items for pantry.
 *
 * @param {Buffer} imageBuffer - Raw image binary
 * @param {string} mimeType - e.g. 'image/jpeg', 'image/png'
 * @returns {Promise<{ items: Array<{ name, category, quantity, unit, estimatedExpiryDays }> }>}
 */
async function analyzeReceiptImage(imageBuffer, mimeType = 'image/jpeg') {
  const model = getModel({ temperature: 0.2 });

  const prompt = `You are a grocery inventory assistant. Analyze this receipt or grocery basket image.

Extract EVERY identifiable food/grocery item. For each item, determine:
- name: the item name (English)
- category: one of ["Proteins", "Vegetables", "Fruits", "Dairy", "Grains", "OilsAndCondiments", "Spices", "Other"]
- quantity: estimated quantity (number)
- unit: appropriate unit ("g", "kg", "ml", "L", "pieces", "bunch", etc.)
- estimatedExpiryDays: estimated days until this item typically expires from purchase date

Return ONLY valid JSON in this exact format:
{
  "items": [
    {
      "name": "Chicken Breast",
      "category": "Proteins",
      "quantity": 500,
      "unit": "g",
      "estimatedExpiryDays": 5
    }
  ],
  "storeName": "Supermarket",
  "notes": "Brief observation"
}

If you cannot identify any items, return: { "items": [], "error": "No items detected" }`;

  try {
    const result = await model.generateContent([prompt, imagePart(imageBuffer, mimeType)]);
    const text = result.response.text();
    return parseJsonResponse(text);
  } catch (error) {
    console.error('[gemini] analyzeReceiptImage error:', error.message);
    throw new Error(`Receipt analysis failed: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT: Vietnamese Multi-Dish Meal Generation
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a complete Vietnamese multi-dish meal ("Mâm cơm Việt") from given ingredients.
 * Produces 3-5 complementary dishes that form a balanced Vietnamese family meal.
 *
 * @param {object} params
 * @param {string[]} params.ingredients - List of available ingredients
 * @param {string} params.mealType - "Breakfast" | "Lunch" | "Dinner" | "Snack"
 * @param {number} params.servings - Number of people to serve
 * @param {object} params.preferences - User dietary/cuisine preferences
 * @returns {Promise<object>} Complete meal with multiple dishes
 */
async function generateVietnameseMeal({ ingredients, mealType = 'Dinner', servings = 2, preferences = {} }) {
  const model = getModel({ temperature: 0.8 });

  const prefsStr = preferences.dietary?.length
    ? `Dietary preferences: ${preferences.dietary.join(', ')}.`
    : '';
  const allergiesStr = preferences.allergies?.length
    ? `AVOID these allergens: ${preferences.allergies.join(', ')}.`
    : '';

  const prompt = `You are a Vietnamese home chef specializing in "Mâm cơm Việt" — traditional Vietnamese family meals with multiple complementary dishes served together.

Create a complete ${mealType.toLowerCase()} meal for ${servings} people using these available ingredients:
[${ingredients.join(', ')}]

${prefsStr}
${allergiesStr}

A proper Vietnamese "mâm cơm" must include:
1. A soup (canh) — clear broth with vegetables/protein
2. A main protein dish — braised, grilled, or stir-fried meat/fish/tofu
3. A vegetable side — boiled, stir-fried, or pickled vegetables
4. Steamed rice (cơm trắng) — always implied

The meal should be nutritionally balanced: roughly 40% carbs, 30% protein, 30% fat across all dishes.
Each dish should complement the others in flavor and texture.

Return ONLY valid JSON:
{
  "mealName": "Vietnamese Family Dinner (Bữa tối gia đình)",
  "description": "A harmonious family meal featuring...",
  "dishes": [
    {
      "name": "Morning Glory Soup (Canh rau muống)",
      "description": "Light, refreshing soup with garlic-infused broth",
      "ingredients": [
        { "amount": "300", "unit": "g", "name": "morning glory (rau muống)" },
        { "amount": "3", "unit": "cloves", "name": "garlic" }
      ],
      "steps": [
        "Bring 1L water to boil with a pinch of salt",
        "Add crushed garlic, simmer 2 minutes",
        "Add morning glory, cook 3 minutes until tender",
        "Season with fish sauce to taste"
      ],
      "prepTime": "5 min",
      "cookTime": "10 min",
      "servings": 2,
      "difficulty": "Easy",
      "calories": 85,
      "protein": 3,
      "carbs": 8,
      "fat": 2,
      "tags": ["Vietnamese", "Soup", "Vegetable", "Quick"]
    }
  ],
  "totalNutrition": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = parseJsonResponse(text);

    // Calculate total nutrition
    if (data.dishes && data.dishes.length > 0) {
      data.totalNutrition = data.dishes.reduce(
        (tot, d) => ({
          calories: tot.calories + (d.calories || 0),
          protein: tot.protein + (d.protein || 0),
          carbs: tot.carbs + (d.carbs || 0),
          fat: tot.fat + (d.fat || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
    }
    return data;
  } catch (error) {
    console.error('[gemini] generateVietnameseMeal error:', error.message);
    throw new Error(`Meal generation failed: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT: Single Recipe Generation (existing wizard flow)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a single recipe from the wizard inputs. Used by the existing
 * 7-step recipe generator flow.
 */
async function generateRecipe({ ingredients, mealType, utensils, time, skill, chefMode }) {
  const model = getModel({ temperature: 0.8 });

  const prompt = `You are a creative chef AI. Generate a recipe based on these inputs:

Ingredients available: [${ingredients.join(', ')}]
Meal type: ${mealType || 'Any'}
Available equipment: [${utensils.join(', ')}]
Max cooking time: ${time || 60} minutes
Skill level: ${skill || 'Intermediate'}
Mode: ${chefMode} ${chefMode === 'allin' ? '(MUST use ALL listed ingredients)' : '(use the BEST combination of ingredients)'}

${chefMode === 'allin' ? 'IMPORTANT: You MUST incorporate EVERY single ingredient listed above into the recipe. Be creative!' : 'Select the best combination of the available ingredients.'}

Return ONLY valid JSON:
{
  "name": "Recipe Name",
  "prepTime": "10 min",
  "cookTime": "25 min",
  "servings": 4,
  "difficulty": "Easy",
  "calories": 520,
  "nutrition": { "protein": 42, "carbs": 18, "fat": 30, "fiber": 3 },
  "ingredients": [{ "amount": "4", "unit": "pieces", "name": "chicken breasts" }],
  "steps": ["Step 1", "Step 2"],
  "tags": ["Tag1", "Tag2"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse(text);
  } catch (error) {
    console.error('[gemini] generateRecipe error:', error.message);
    throw new Error(`Recipe generation failed: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT: Weekly Meal Plan AI Suggestion
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate a smart weekly meal plan suggestion based on pantry inventory,
 * user preferences, and existing planned meals.
 *
 * @param {object} params
 * @param {Array<{ name, category, quantity, unit, expiry }>} params.pantryItems
 * @param {object} params.preferences - User dietary/cuisine/allergy preferences
 * @param {object} params.existingPlan - Already planned meal slots (keyed by "Day-MealType")
 * @param {number} params.familySize
 * @param {string} params.weekStart - ISO date of Monday
 * @returns {Promise<object>} Suggested meals for remaining empty slots
 */
async function generateWeeklyMealPlan({ pantryItems, preferences, existingPlan, familySize = 2, weekStart }) {
  const model = getModel({ temperature: 0.7, maxOutputTokens: 8192 });

  const pantryList = pantryItems.map((p) => `- ${p.name} (${p.category}, ${p.quantity} ${p.unit}, expires in ~${p.daysUntilExpiry || '?'} days)`).join('\n');
  const existingStr = JSON.stringify(existingPlan || {});
  const today = new Date().toISOString().split('T')[0];

  const prompt = `You are a Vietnamese meal planning expert. Create a weekly meal plan for a family of ${familySize}.

IMPORTANT: Today's date is ${today}. Only suggest meals for days that have NOT yet passed this week. If today is Wednesday, only suggest for Wed, Thu, Fri, Sat, Sun.

User preferences: ${JSON.stringify(preferences)}

PANTRY INVENTORY (prioritize items expiring soon):
${pantryList || '(No pantry items — suggest meals with common ingredients)'}

ALREADY PLANNED MEALS (do NOT overwrite these):
${existingStr}

For each EMPTY meal slot (not in the existing plan), suggest meals following the Vietnamese "mâm cơm" structure:
- Lunch & Dinner: 3-4 dishes (rice + soup + protein + vegetable)
- Breakfast: 1-2 dishes (typically lighter — pho, banh mi, xoi, chao, etc.)
- Snack: 1 dish

Prioritize using pantry items that are expiring soon to reduce food waste.

Return ONLY valid JSON:
{
  "weekStart": "${weekStart}",
  "suggestions": {
    "Mon": {
      "Breakfast": {
        "dishes": [{ "customName": "Beef Pho (Phở bò)", "calories": 450, "protein": 28, "carbs": 55, "fat": 12 }]
      },
      "Lunch": {
        "dishes": [
          { "customName": "Steamed Jasmine Rice", "calories": 200, "protein": 4, "carbs": 44, "fat": 0 },
          { "customName": "Sour Fish Soup (Canh chua cá)", "calories": 150, "protein": 18, "carbs": 10, "fat": 4 }
        ]
      }
    }
  },
  "rationale": "Brief explanation of the meal plan choices"
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseJsonResponse(text);
  } catch (error) {
    console.error('[gemini] generateWeeklyMealPlan error:', error.message);
    throw new Error(`Meal plan suggestion failed: ${error.message}`);
  }
}

module.exports = {
  analyzeFoodImage,
  analyzeReceiptImage,
  generateVietnameseMeal,
  generateRecipe,
  generateWeeklyMealPlan,
};