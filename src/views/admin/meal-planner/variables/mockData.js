// ChefOne — Meal Planner Mock Data

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

// Available recipes pool to assign
export const availableRecipes = [
  { id: 1, name: "Avocado Toast with Egg", calories: 320, tags: ["Breakfast"] },
  { id: 2, name: "Greek Yogurt & Berries", calories: 180, tags: ["Breakfast", "Snack"] },
  { id: 3, name: "Chicken Caesar Salad", calories: 410, tags: ["Lunch"] },
  { id: 4, name: "Grilled Salmon with Quinoa", calories: 540, tags: ["Lunch", "Dinner"] },
  { id: 5, name: "Spaghetti Carbonara", calories: 620, tags: ["Dinner"] },
  { id: 6, name: "Creamy Tuscan Chicken", calories: 520, tags: ["Dinner"] },
  { id: 7, name: "Mushroom Risotto", calories: 570, tags: ["Dinner", "Lunch"] },
  { id: 8, name: "Thai Green Curry", calories: 480, tags: ["Dinner"] },
  { id: 9, name: "Protein Smoothie", calories: 220, tags: ["Breakfast", "Snack"] },
  { id: 10, name: "Hummus & Veggie Sticks", calories: 150, tags: ["Snack"] },
  { id: 11, name: "Tomato Basil Soup", calories: 250, tags: ["Lunch", "Dinner"] },
  { id: 12, name: "Overnight Oats", calories: 340, tags: ["Breakfast"] },
];

// Initial weekly plan: keyed by "Day-MealType"
export const initialWeeklyPlan = {
  "Mon-Breakfast": { recipeId: 1, name: "Avocado Toast with Egg", calories: 320 },
  "Mon-Lunch": { recipeId: 3, name: "Chicken Caesar Salad", calories: 410 },
  "Mon-Dinner": { recipeId: 5, name: "Spaghetti Carbonara", calories: 620 },
  "Tue-Breakfast": { recipeId: 12, name: "Overnight Oats", calories: 340 },
  "Tue-Lunch": { recipeId: 4, name: "Grilled Salmon with Quinoa", calories: 540 },
  "Tue-Dinner": { recipeId: 6, name: "Creamy Tuscan Chicken", calories: 520 },
  "Tue-Snack": { recipeId: 10, name: "Hummus & Veggie Sticks", calories: 150 },
  "Wed-Breakfast": { recipeId: 2, name: "Greek Yogurt & Berries", calories: 180 },
  "Wed-Dinner": { recipeId: 8, name: "Thai Green Curry", calories: 480 },
  "Thu-Lunch": { recipeId: 11, name: "Tomato Basil Soup", calories: 250 },
  "Thu-Dinner": { recipeId: 7, name: "Mushroom Risotto", calories: 570 },
  "Fri-Breakfast": { recipeId: 9, name: "Protein Smoothie", calories: 220 },
  "Fri-Lunch": { recipeId: 3, name: "Chicken Caesar Salad", calories: 410 },
  "Fri-Dinner": { recipeId: 4, name: "Grilled Salmon with Quinoa", calories: 540 },
  "Sat-Breakfast": { recipeId: 1, name: "Avocado Toast with Egg", calories: 320 },
  "Sat-Lunch": { recipeId: 7, name: "Mushroom Risotto", calories: 570 },
  "Sat-Dinner": { recipeId: 5, name: "Spaghetti Carbonara", calories: 620 },
  "Sat-Snack": { recipeId: 2, name: "Greek Yogurt & Berries", calories: 180 },
  "Sun-Breakfast": { recipeId: 12, name: "Overnight Oats", calories: 340 },
  "Sun-Dinner": { recipeId: 6, name: "Creamy Tuscan Chicken", calories: 520 },
};
