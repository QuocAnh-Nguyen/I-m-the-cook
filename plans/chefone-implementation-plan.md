# ChefOne — AI Visual Chef: Full Implementation Plan

Built on top of **Horizon UI Tailwind React** template.  
React 19 · React Router v6 · Tailwind CSS 3 · ApexCharts · @tanstack/react-table

---

## 1. Project Architecture

```
App.jsx (React Router root)
├── /auth/*      → AuthLayout  (layouts/auth/index.jsx)
│   ├── /auth/sign-in     → SignIn (MODIFIED)
│   └── /auth/sign-up     → SignUp (NEW)
│
└── /admin/*     → AdminLayout (layouts/admin/index.jsx)
    ├── Sidebar  (reads routes.js — ChefOne nav links)
    ├── Navbar   (logoText="ChefOne", dark mode toggle, profile dropdown)
    ├── /admin/default           → Dashboard
    ├── /admin/smart-scanner     → Smart Fridge Scanner  (NEW)
    ├── /admin/recipe-generator  → Recipe Generator / PantryChef
    ├── /admin/cookbook          → My Cookbook  (NEW)
    ├── /admin/pantry            → Pantry Manager
    ├── /admin/meal-planner      → Meal Planner Calendar
    ├── /admin/shopping-list     → Shopping List  (NEW)
    └── /admin/nutrition         → Nutrition Analytics
```

### Auth Context Flow

```
src/context/AuthContext.jsx    (NEW)
  └── provides: { user, login, logout, signup }
  └── storage: localStorage (mock — no real backend)
  └── consumed by: App.jsx, Navbar, ProtectedRoute
```

---

## 2. Complete Route Map

| Route | View | Status | Icon |
|---|---|---|---|
| `/admin/default` | Dashboard | ✅ Built | `MdOutlineDashboard` |
| `/admin/smart-scanner` | Smart Fridge Scanner | ❌ Missing | `MdOutlineCameraAlt` |
| `/admin/recipe-generator` | Recipe Generator | ✅ Built (needs filters) | `MdOutlineMenuBook` |
| `/admin/cookbook` | My Cookbook | ❌ Missing | `MdOutlineBookmarkBorder` |
| `/admin/pantry` | Pantry Manager | ✅ Built | `MdOutlineInventory2` |
| `/admin/meal-planner` | Meal Planner | ✅ Built | `MdOutlineCalendarMonth` |
| `/admin/shopping-list` | Shopping List | ❌ Missing | `MdOutlineShoppingCart` |
| `/admin/nutrition` | Nutrition Analytics | ✅ Built | `MdOutlineBarChart` |
| `/auth/sign-in` | Sign In | ✅ Exists (needs wiring) | — |
| `/auth/sign-up` | Sign Up | ❌ Missing | — |

---

## 3. Current Build Status

### ✅ Already Complete (no changes needed)

| File | What it does |
|---|---|
| [`src/views/admin/default/index.jsx`](src/views/admin/default/index.jsx) | 4 stat widgets, PieChart (macros), MiniCalendar, Recent Recipes table |
| [`src/views/admin/default/variables/mockData.js`](src/views/admin/default/variables/mockData.js) | Dashboard mock data (recipes, macro percentages, chart config) |
| [`src/views/admin/recipe-generator/index.jsx`](src/views/admin/recipe-generator/index.jsx) | Text prompt, ImageUploadZone, RecipeResultCard, history table, 2s mock delay |
| [`src/views/admin/recipe-generator/components/ImageUploadZone.jsx`](src/views/admin/recipe-generator/components/ImageUploadZone.jsx) | Drag-drop file upload with preview and clear |
| [`src/views/admin/recipe-generator/components/RecipeResultCard.jsx`](src/views/admin/recipe-generator/components/RecipeResultCard.jsx) | Full recipe card: name, tags, difficulty, meta, nutrition badges, ingredients, steps |
| [`src/views/admin/recipe-generator/variables/mockData.js`](src/views/admin/recipe-generator/variables/mockData.js) | Mock recipe result + generation history array |
| [`src/views/admin/pantry/index.jsx`](src/views/admin/pantry/index.jsx) | Full CRUD table, category/search filters, expiry status badges, 3 stat widgets |
| [`src/views/admin/pantry/components/AddIngredientModal.jsx`](src/views/admin/pantry/components/AddIngredientModal.jsx) | Add/edit modal with validation, category select, unit select |
| [`src/views/admin/pantry/variables/mockData.js`](src/views/admin/pantry/variables/mockData.js) | 12 initial pantry items, categories array, units array |
| [`src/views/admin/meal-planner/index.jsx`](src/views/admin/meal-planner/index.jsx) | Weekly grid (7×4), summary widgets, recipe assign/remove, search modal |
| [`src/views/admin/meal-planner/components/MealSlotCard.jsx`](src/views/admin/meal-planner/components/MealSlotCard.jsx) | Individual meal slot with color coding per meal type |
| [`src/views/admin/meal-planner/variables/mockData.js`](src/views/admin/meal-planner/variables/mockData.js) | 12 available recipes, initial weekly plan map |
| [`src/views/admin/nutrition/index.jsx`](src/views/admin/nutrition/index.jsx) | 3 stat widgets, LineChart (calorie trend vs goal), BarChart (macros), daily table |
| [`src/views/admin/nutrition/variables/mockData.js`](src/views/admin/nutrition/variables/mockData.js) | 7-day calorie + macro data, ApexCharts config objects |
| [`src/routes.js`](src/routes.js) | 5 ChefOne admin routes with icons (no RTL/auth routes) |
| [`src/layouts/admin/index.jsx`](src/layouts/admin/index.jsx) | `logoText="ChefOne"` already set |

### ✅ Needs Minor Modification

| File | Change Needed |
|---|---|
| [`src/views/admin/recipe-generator/index.jsx`](src/views/admin/recipe-generator/index.jsx) | Add 3 filter chips: Meal Type, Kitchen Appliance, Cook Time |
| [`src/components/sidebar/index.jsx`](src/components/sidebar/index.jsx) | Change brand name from `"Horizon FREE"` to `"ChefOne"` |
| [`src/components/footer/Footer.jsx`](src/components/footer/Footer.jsx) | Change copyright text from Horizon UI to ChefOne |
| [`src/App.jsx`](src/App.jsx) | Wrap with `AuthProvider`, add `ProtectedRoute` guard for `/admin/*` |
| [`src/routes.js`](src/routes.js) | Add 3 new routes: smart-scanner, cookbook, shopping-list |

### ❌ Needs to be Built (5 features)

See Section 4 for complete specs.

---

## 4. Missing Features — Detailed Specifications

---

### Feature 1 — Smart Fridge Scanner (`/admin/smart-scanner`)

**USP of the app.** A multi-step wizard: upload → AI detects ingredients → user reviews/edits → confirm → forward to Recipe Generator.

#### User Flow (3 steps)

```
Step 1: UPLOAD
  └── Full-width drag-drop zone (reuse ImageUploadZone pattern)
  └── "Scan Ingredients" button (enabled after image selected)
  └── 2-second mock delay → transitions to Step 2

Step 2: REVIEW & EDIT
  └── Image preview on left (50%)
  └── Detected ingredients list on right (50%)
      └── Each ingredient: name chip + quantity estimate + ✏️ edit + ✕ remove
      └── "Add Ingredient" input at bottom of list
  └── "Confirm & Generate Recipes" button → transitions to Step 3

Step 3: CONFIRM / REDIRECT
  └── Summary card: "X ingredients confirmed"
  └── Filter selection (same 3 filters as Recipe Generator):
      - Meal Type: Breakfast / Lunch / Dinner
      - Appliance: Any / Gas Stove / Microwave / Oven
      - Cook Time: <15 min / <30 min / Unlimited
  └── "Generate Recipes →" button → navigates to /admin/recipe-generator
      with state: { ingredients: [...], filters: {...} }
  └── "Scan Again" button → back to Step 1
```

#### Files to Create

```
src/views/admin/smart-scanner/
├── index.jsx                         — Main wizard orchestrator (step state)
├── components/
│   ├── ScanUploadStep.jsx            — Step 1: drag-drop upload zone
│   ├── IngredientReviewStep.jsx      — Step 2: edit detected ingredients
│   └── ConfirmScanStep.jsx           — Step 3: filters + confirm
└── variables/
    └── mockData.js                   — Mock AI detection results
```

#### Mock AI Detection Data (in `mockData.js`)

```js
// Simulates GPT-4o Vision returning detected ingredients
export const mockDetectedIngredients = [
  { id: 1, name: "Chicken Breast", quantity: "~500g", confidence: 0.97 },
  { id: 2, name: "Broccoli", quantity: "~2 cups", confidence: 0.92 },
  { id: 3, name: "Cherry Tomatoes", quantity: "~1 cup", confidence: 0.88 },
  { id: 4, name: "Garlic Cloves", quantity: "~4 cloves", confidence: 0.95 },
  { id: 5, name: "Olive Oil", quantity: "~3 tbsp", confidence: 0.85 },
  { id: 6, name: "Heavy Cream", quantity: "~200ml", confidence: 0.79 },
];
```

#### Key UI Decisions

- **Step indicator** at top: numbered circles `[1] — [2] — [3]` using `brand-500` for active step
- **Confidence badge**: green (>90%), amber (70-90%), red (<70%) — shown in Step 2 as small pill
- **Edit mode** per ingredient: clicking ✏️ converts name to inline `<input>`
- **Template components reused**: `Card`, `ImageUploadZone` (copy pattern), `InputField` (Tailwind classes)

---

### Feature 2 — Recipe Generator Filter Upgrade (existing page)

**Modify** [`src/views/admin/recipe-generator/index.jsx`](src/views/admin/recipe-generator/index.jsx) to add 3 filter sections inside the left panel `Card`, between the text prompt and the Generate button.

#### Filters Spec

```
MEAL TYPE (radio button chips — pick one)
  Options: Breakfast | Lunch | Dinner
  Default: none selected
  UI: horizontal flex row of pill buttons
      active: bg-brand-500 text-white
      inactive: bg-gray-100 text-gray-600 hover:bg-gray-200

KITCHEN APPLIANCE (radio button chips — pick one)
  Options: Any | Gas Stove | Oven | Microwave | Air Fryer
  Default: Any
  Purpose: exclude recipes requiring equipment user doesn't have

COOKING TIME (radio button chips — pick one)
  Options: Under 15 min | Under 30 min | Unlimited
  Default: Unlimited
```

#### Filter State

```js
const [filters, setFilters] = useState({
  mealType: null,       // "Breakfast" | "Lunch" | "Dinner" | null
  appliance: "Any",     // "Any" | "Gas Stove" | "Oven" | "Microwave" | "Air Fryer"
  cookTime: "Unlimited" // "Under 15 min" | "Under 30 min" | "Unlimited"
});
```

The mock recipe result already has tags + cookTime — the Generate button is still disabled until prompt or image is provided. Filters are passed alongside prompt in the (currently mock) generation call.

#### Scanner Integration

When navigated from Smart Scanner with `location.state.ingredients`:
- Pre-populate the text prompt textarea with: `"I have: chicken breast, broccoli, cherry tomatoes, garlic, olive oil, heavy cream"`
- Pre-set filters from `location.state.filters`
- Show a green banner: "✓ 6 ingredients imported from Smart Scanner"

---

### Feature 3 — My Cookbook (`/admin/cookbook`)

Personal recipe library. Full CRUD for saved recipes. Grid view + table view. PDF download. Copy shareable link.

#### Data Model

```js
// A saved cookbook entry
{
  id: 1,
  name: "Creamy Tuscan Chicken",
  savedAt: "2026-05-10",
  difficulty: "Easy",          // "Easy" | "Medium" | "Hard"
  prepTime: "10 min",
  cookTime: "25 min",
  calories: 520,
  servings: 4,
  tags: ["Italian", "High Protein"],
  ingredients: [...],           // same structure as RecipeResultCard
  steps: [...],
  nutrition: { protein, carbs, fat, fiber },
  notes: "Great with pasta",    // user personal note
  isFavorite: false,
}
```

#### Page Layout

```
Top Controls Row:
  ├── View toggle: [Grid] [Table]  — icon button pair
  ├── Search input: "Search my cookbook..."
  ├── Filter dropdown: All | Easy | Medium | Hard (by difficulty)
  └── Sort: Newest | Oldest | Most Calories | Alphabetical

GRID VIEW (default):
  └── Responsive grid: 1 col → 2 col (md) → 3 col (xl)
  └── Each card (RecipeBookCard.jsx):
      - Recipe name (bold, navy)
      - Tag pills (brand-50 background)
      - Difficulty badge (color-coded)
      - Meta: prep + cook time, calories
      - Bottom action row:
          👁 View  |  ✏️ Edit  |  ⬇ PDF  |  🔗 Share  |  ⭐ Favorite  |  🗑 Delete

TABLE VIEW:
  └── Columns: Name | Tags | Prep | Cook | Calories | Difficulty | Saved On | Actions
  └── Same action icons in last column

RECIPE DETAIL MODAL (opens on "View"):
  └── Reuses RecipeResultCard.jsx component exactly
  └── Adds: user Notes textarea, "Close" button, PDF download button
```

#### Files to Create

```
src/views/admin/cookbook/
├── index.jsx                          — Main page (state, toggle, filter)
├── components/
│   ├── RecipeBookCard.jsx             — Grid card view of a saved recipe
│   ├── RecipeDetailModal.jsx          — Full recipe modal (wraps RecipeResultCard)
│   └── CookbookTableRow.jsx           — Table row for table view
└── variables/
    └── mockData.js                    — 8 pre-saved mock recipes
```

#### PDF Download (mock)

No real PDF library needed for Phase 1. Use `window.print()` with a hidden printable `<div>` styled for A4 via Tailwind `print:` utilities. A real implementation would use `jsPDF` or `html2canvas` — leave a `// TODO: replace with jsPDF` comment.

#### Share Link (mock)

```js
const handleShare = (recipeId) => {
  const mockUrl = `https://chefone.app/recipe/${recipeId}`;
  navigator.clipboard.writeText(mockUrl);
  // Show toast: "Link copied to clipboard!"
};
```

A simple toast notification: fixed-position `div` at bottom-right, fades out after 3 seconds.

---

### Feature 4 — Shopping List (`/admin/shopping-list`)

A standalone to-do style list. Users add ingredients/items they need to buy. Items can be checked off, organized by category, and cleared.

#### Page Layout

```
Top Row:
  ├── "Add Item" input + category select + Add button
  └── Stats: X items total | X checked | "Clear Completed" button

Category Sections (grouped, collapsible):
  └── Produce, Dairy, Proteins, Pantry, Other
  └── Each section header: category name + item count badge
  └── Each item row:
      - Checkbox (✓ toggles strikethrough + gray text)
      - Item name
      - Optional quantity badge
      - 🗑 Delete button
```

#### Data Model

```js
{
  id: 1,
  name: "Chicken Breast",
  category: "Proteins",
  quantity: "500g",          // optional
  checked: false,
}
```

#### Files to Create

```
src/views/admin/shopping-list/
├── index.jsx                          — Main page
├── components/
│   └── ShoppingCategorySection.jsx   — Collapsible category group
└── variables/
    └── mockData.js                    — 15 initial shopping items
```

#### Key UI

- Checkboxes reuse `components/checkbox/index.jsx` from the template
- Checked items: `line-through text-gray-400`
- Category section headers: `bg-gray-50 dark:bg-navy-700` sticky row
- Empty state: friendly illustration (emoji + text): "🛒 Your list is empty! Add ingredients from your pantry or recipes."

---

### Feature 5 — Auth System

Mock auth with `localStorage`. No backend. Google OAuth button is visual only (mock). Protects all `/admin/*` routes.

#### Auth Context (`src/context/AuthContext.jsx`)

```js
const AuthContext = createContext();

// localStorage keys:
//   "chefone_user"  → JSON { name, email, avatar }
//   "chefone_token" → "mock-token-xyz"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("chefone_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email, password) => {
    // Mock: any email/password with valid format succeeds
    // Sets localStorage + updates state
  };

  const signup = (name, email, password) => {
    // Mock: creates user object, stores in localStorage
  };

  const logout = () => {
    localStorage.removeItem("chefone_user");
    localStorage.removeItem("chefone_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

#### Protected Route (`src/components/auth/ProtectedRoute.jsx`)

```jsx
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth/sign-in" replace />;
};
```

#### App.jsx update

```jsx
<AuthProvider>
  <Routes>
    <Route path="auth/*" element={<AuthLayout />} />
    <Route path="admin/*" element={
      <ProtectedRoute><AdminLayout /></ProtectedRoute>
    } />
    <Route path="/" element={<Navigate to="/admin" replace />} />
  </Routes>
</AuthProvider>
```

#### Sign In Page (modify existing `src/views/auth/SignIn.jsx`)

- Integrate `useAuth().login()` on form submit
- On success → `navigate("/admin/default")`
- On error → show inline error message under password field
- "Sign In with Google" button → mock: same as email login with preset demo user
- Link "Create an account" → `navigate("/auth/sign-up")`
- Demo credentials tip: `demo@chefone.app / demo1234`

#### Sign Up Page (new `src/views/auth/SignUp.jsx`)

- Fields: Full Name, Email, Password, Confirm Password
- Validation: name required, valid email, password ≥ 8 chars, passwords match
- On success → `navigate("/admin/default")`
- Link "Already have an account?" → `navigate("/auth/sign-in")`
- Reuses same AuthLayout as SignIn

#### Routes addition for auth

```js
// In routes.js — add auth routes back:
{
  name: "Sign In",
  layout: "/auth",
  path: "sign-in",
  icon: <MdLock className="h-6 w-6" />,
  component: <SignIn />,
},
{
  name: "Sign Up",
  layout: "/auth",
  path: "sign-up",
  icon: <MdLock className="h-6 w-6" />,
  component: <SignUp />,
},
```

#### Sidebar/Navbar Auth Integration

- Sidebar [`src/components/sidebar/index.jsx`](src/components/sidebar/index.jsx): show user name/avatar at bottom using `useAuth().user`
- Navbar [`src/components/navbar/index.jsx`](src/components/navbar/index.jsx): "Log Out" in profile dropdown calls `useAuth().logout()` → navigates to `/auth/sign-in`

---

## 5. Minor Fixes (existing pages)

| File | Fix |
|---|---|
| [`src/components/sidebar/index.jsx`](src/components/sidebar/index.jsx) | Change `"Horizon FREE"` → `"ChefOne"` in the brand div |
| [`src/components/footer/Footer.jsx`](src/components/footer/Footer.jsx) | Change copyright to `"© 2026 ChefOne. All Rights Reserved."` |
| [`src/views/admin/default/index.jsx`](src/views/admin/default/index.jsx) | Remove unused `useTable` import (from `@tanstack/react-table` — not used) |

---

## 6. Files to Delete (obsolete template files)

These remain in the project and need cleanup after all features are built:

```
src/views/admin/marketplace/          (replaced by recipe-generator)
src/views/admin/tables/               (replaced by pantry)
src/views/admin/profile/              (replaced by nutrition)
src/views/rtl/                        (RTL not needed)
src/views/admin/default/components/   (all 7 original components — replaced by new views)
src/views/admin/default/variables/columnsData.js   (old template data)
src/views/admin/default/variables/tableDataCheck.json
src/views/admin/default/variables/tableDataComplex.json
src/layouts/rtl/                      (RTL layout not needed)
src/components/sidebar/RTL.jsx
src/components/navbar/RTL.jsx
src/components/sidebar/componentsrtl/ (RTL sidebar components)
```

**Keep** (still needed by active pages):
- All components in `src/components/` (Card, Widget, charts, fields, calendar, etc.)
- `src/layouts/auth/index.jsx` (auth layout is now used for Sign In + Sign Up)

---

## 7. Implementation Order

| Step | Task | Files Created/Modified |
|---|---|---|
| **1** | Auth Context + ProtectedRoute | `src/context/AuthContext.jsx` (NEW), `src/components/auth/ProtectedRoute.jsx` (NEW) |
| **2** | Update App.jsx with AuthProvider + protection | `src/App.jsx` (MODIFY) |
| **3** | Modify Sign In — wire up useAuth | `src/views/auth/SignIn.jsx` (MODIFY) |
| **4** | Create Sign Up page | `src/views/auth/SignUp.jsx` (NEW) |
| **5** | Update routes.js — add auth + 3 new admin routes | `src/routes.js` (MODIFY) |
| **6** | Fix Sidebar branding | `src/components/sidebar/index.jsx` (MODIFY) |
| **7** | Fix Footer copyright | `src/components/footer/Footer.jsx` (MODIFY) |
| **8** | Update Navbar — wire logout | `src/components/navbar/index.jsx` (MODIFY) |
| **9** | Build Smart Fridge Scanner (3-step wizard) | `src/views/admin/smart-scanner/*` (4 files NEW) |
| **10** | Upgrade Recipe Generator — add 3 filters + scanner integration | `src/views/admin/recipe-generator/index.jsx` (MODIFY) |
| **11** | Build My Cookbook | `src/views/admin/cookbook/*` (4 files NEW) |
| **12** | Build Shopping List | `src/views/admin/shopping-list/*` (3 files NEW) |
| **13** | Fix Dashboard — remove unused import | `src/views/admin/default/index.jsx` (MODIFY) |
| **14** | Delete obsolete template files | Multiple directories (DELETE) |
| **15** | Verify build | `npm run build` |

---

## 8. Component Reuse Summary

| Need | Template Component | Location |
|---|---|---|
| All card containers | `Card` | `components/card/index.jsx` |
| Stat summary boxes | `Widget` | `components/widget/Widget.jsx` |
| Calorie/trend line chart | `LineChart` | `components/charts/LineChart.jsx` |
| Macro bar chart | `BarChart` | `components/charts/BarChart.jsx` |
| Macro pie chart | `PieChart` | `components/charts/PieChart.jsx` |
| Text form inputs | `InputField` | `components/fields/InputField.jsx` |
| Toggle switches | `SwitchField` | `components/fields/SwitchField.jsx` |
| Mini calendar widget | `MiniCalendar` | `components/calendar/MiniCalendar.jsx` |
| Checkboxes | `Checkbox` | `components/checkbox/index.jsx` |
| Dropdown menus | `Dropdown` | `components/dropdown/index.jsx` |
| Google Sign In icon | `FcGoogle` | `react-icons/fc` (already in package.json) |
| All sidebar/navbar | Existing layout | `components/sidebar/`, `components/navbar/` |

---

## 9. Color Coding Reference (from tailwind.config.js)

| Usage | Color Token |
|---|---|
| Primary brand (buttons, active states) | `brand-500` (#422AFB) |
| Background hover | `brand-50` (#E9E3FF) |
| Dark sidebar background | `navy-800` (#111c44) |
| Dark page background | `navy-900` (#0b1437) |
| App background (light) | `lightPrimary` (#F4F7FE) |
| Success / Fresh | `green-500` / `green-50` |
| Warning / Expiring | `amber-500` / `amber-50` |
| Error / Expired | `red-500` / `red-50` |
| Breakfast slots | `amber-300` / `amber-50` |
| Lunch slots | `blue-400` / `blue-50` |
| Dinner slots | `brand-300` / `brand-50` |
| Snack slots | `green-500` / `green-50` |

---

## 10. Total File Count

| Category | Count |
|---|---|
| Files already complete (no changes) | 14 |
| Files to modify | 7 |
| New files to create | ~18 |
| Files to delete | ~25 |
| **Total new files at end** | **~32 source files** |
