# 🍳 ChefOne — AI-Powered Cooking Assistant

**ChefOne** is a full-stack web application that helps home cooks plan meals, manage pantry inventory, track nutrition, and generate AI-powered recipes — with a special focus on Vietnamese cuisine and the traditional "Mâm cơm Việt" family meal structure.

Built with React 19, Tailwind CSS, Node.js/Express, Prisma ORM, and Google Gemini AI.

---

## ✨ Features

| Feature | Description |
|---|---|
| **🧠 AI Recipe Generator** | Generate single recipes or complete Vietnamese multi-dish meals from your available ingredients using Google Gemini AI |
| **📸 Food Recognition** | Upload a photo of your meal — AI identifies the dishes, estimates nutrition, and logs calories automatically |
| **🧾 Receipt Scanner** | Snap a photo of your grocery receipt or basket — AI extracts items and adds them to your pantry |
| **📅 Meal Planner** | Weekly meal planner with multi-dish support per slot — structure meals the Vietnamese way with rice + soup + protein + vegetable |
| **🥫 Pantry Manager** | Track your pantry inventory with expiry dates, categories, and automatic alerts for items about to expire |
| **🔥 Calorie Tracker** | Log meals manually or from food photos; track calories, protein, carbs, and fat against daily goals |
| **📊 Nutrition Analytics** | 7-day nutrition charts with calorie and macro breakdowns |
| **🛒 Smart Shopping List** | Auto-generate grocery lists from your meal plan, cross-referencing what's already in your pantry |
| **📋 Dashboard** | At-a-glance overview of recipes, pantry status, today's calories, meal plans, and smart alerts |

---

## 🏗️ Architecture

```
I-m-the-cook/
├── src/                          # React 19 frontend (CRA)
│   ├── components/               # Reusable UI components
│   ├── layouts/                  # Admin & Auth layouts
│   ├── views/admin/              # Feature pages
│   │   ├── recipe-generator/     # AI recipe + Vietnamese meal generation
│   │   ├── pantry/               # Pantry inventory manager
│   │   ├── meal-planner/         # Multi-dish weekly meal planner
│   │   ├── nutrition-tracking/   # Calorie tracker + nutrition charts
│   │   ├── my-recipes/           # Saved recipes library
│   │   ├── profile/              # User profile & preferences
│   │   └── default/              # Dashboard
│   ├── services/                 # API client layer (Axios)
│   └── store/                    # Zustand global state
│
├── server/                       # Node.js/Express backend
│   ├── prisma/
│   │   ├── schema.prisma         # Database models (SQLite)
│   │   ├── migrations/           # Prisma migration history
│   │   └── seed.js               # Demo data seeder
│   └── src/
│       ├── config/               # DB, CORS, env, Gemini client
│       ├── middleware/            # Auth, upload, error handling
│       ├── routes/                # REST API endpoints
│       ├── services/             # Gemini AI service (5 methods)
│       └── utils/                # API response, pagination, constants
│
└── plans/                        # Architecture & implementation docs
    ├── backend-architecture.md
    ├── chefone-implementation-plan.md
    └── mam-com-viet-implementation-plan.md
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Tailwind CSS 3, React Router 6, Zustand, ApexCharts |
| **Backend** | Node.js, Express 4, Prisma ORM 6, SQLite |
| **AI** | Google Gemini (`gemini-3.1-flash-lite-preview`) — vision + text |
| **Auth** | JWT (bcryptjs + jsonwebtoken), HTTP-only Bearer tokens |
| **Uploads** | Multer (disk storage, 10MB limit, JPEG/PNG/WebP) |
| **Security** | Helmet, CORS, express-rate-limit, ownership-gated queries |
| **Validation** | Joi request body schemas for all mutating endpoints |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (LTS)
- **npm** 9+

### Installation

```bash
# 1. Clone the repository
git clone <repository-url>
cd I-m-the-cook

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server && npm install

# 4. Configure environment variables
cp .env.example .env
# Edit server/.env with your settings (see Environment Variables below)

# 5. Set up the database
npm run db:setup
# This runs: prisma migrate dev && node prisma/seed.js
```

### Environment Variables

Copy [`server/.env.example`](server/.env.example) to `server/.env` and configure:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment (`development` / `production`) | `development` |
| `DATABASE_URL` | Prisma database connection | `file:./dev.db` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | *required* |
| `JWT_EXPIRES_IN` | Token expiry duration | `24h` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |
| `GEMINI_API_KEY` | Google Gemini API key | *required for AI features* |
| `GEMINI_MODEL` | Gemini model name | `gemini-3.1-flash-lite-preview` |

> **Get a Gemini API key** at [Google AI Studio](https://aistudio.google.com/app/apikey). The free tier supports all ChefOne AI features.

### Running the Application

```bash
# Run both frontend & backend concurrently
npm run dev

# Or run them separately:
npm start              # Frontend: http://localhost:3000
npm run server         # Backend:  http://localhost:5000
```

### Demo Account

The seed script creates a demo user:

| Field | Value |
|---|---|
| Email | `demo@chefone.app` |
| Password | `demo1234` |

It also populates sample recipes, pantry items, a partial weekly meal plan, calorie entries, and shopping items.

---

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1`. Authentication uses `Authorization: Bearer <token>` headers (disabled in development mode).

### AI Features — `/api/v1/ai`

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/ai/analyze-food` | Upload food image → get dish names + nutrition (multipart) | No |
| `POST` | `/ai/scan-receipt` | Upload receipt/grocery image → extract items (multipart) | No |
| `POST` | `/ai/generate-vietnamese-meal` | Generate a multi-dish Vietnamese meal from ingredients | No |
| `POST` | `/ai/suggest-meal-plan` | AI-generated weekly meal plan from pantry + preferences | No |

### Recipes — `/api/v1/recipes`

| Method | Path | Description |
|---|---|---|
| `GET` | `/recipes` | List saved recipes (paginated, filterable) |
| `POST` | `/recipes` | Create a recipe |
| `GET` | `/recipes/:id` | Get single recipe |
| `PATCH` | `/recipes/:id` | Update a recipe |
| `DELETE` | `/recipes/:id` | Delete a recipe |

### Pantry — `/api/v1/pantry`

| Method | Path | Description |
|---|---|---|
| `GET` | `/pantry` | List pantry items (filterable) |
| `POST` | `/pantry` | Add an item |
| `POST` | `/pantry/bulk` | Add multiple items at once |
| `PATCH` | `/pantry/:id` | Update an item |
| `DELETE` | `/pantry/:id` | Delete an item |

### Meal Planner — `/api/v1/meal-plan`

| Method | Path | Description |
|---|---|---|
| `GET` | `/meal-plan/week?date=` | Get meal slots for a given week |
| `PUT` | `/meal-plan/slot` | Assign/update a meal slot (multi-dish) |
| `DELETE` | `/meal-plan/slot/:id` | Remove a meal slot |

### Calorie Tracker — `/api/v1/calories`

| Method | Path | Description |
|---|---|---|
| `GET` | `/calories?date=` | Get entries for a date |
| `GET` | `/calories/summary?date=` | Daily nutrition totals & remaining goals |
| `POST` | `/calories` | Add a calorie entry |
| `DELETE` | `/calories/:id` | Delete an entry |

### Dashboard — `/api/v1/dashboard`

| Method | Path | Description |
|---|---|---|
| `GET` | `/dashboard/stats` | Aggregated dashboard statistics |

### API Response Format

All responses follow a consistent structure:

```json
// Success
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 20, "total": 45 } }

// Error
{ "success": false, "error": "Descriptive message", "details": [{ "field": "...", "message": "..." }] }
```

---

## 📁 Project Structure Details

### Frontend Routes

| Route | Page | Description |
|---|---|---|
| `/admin/default` | Dashboard | Overview of all cooking activities |
| `/admin/recipe-generator` | AI Recipe Generator | 7-step wizard + Vietnamese meal mode |
| `/admin/my-recipes` | My Recipes | Saved recipe library |
| `/admin/pantry` | Pantry Manager | Inventory with expiry tracking |
| `/admin/meal-planner` | Meal Planner | Weekly multi-dish meal planning |
| `/admin/nutrition-tracking` | Nutrition & Tracking | Calorie tracker + nutrition analytics |
| `/admin/profile` | Profile Settings | User preferences & nutrition goals |
| `/auth/sign-in` | Sign In | Authentication page |

### Database Models

| Model | Table | Key Fields |
|---|---|---|
| `User` | `users` | email, passwordHash, calorieGoal, dietaryPreferences, allergies |
| `Recipe` | `recipes` | name, calories, protein, ingredients (JSON), steps (JSON), difficulty, source |
| `PantryItem` | `pantry_items` | name, category, quantity, unit, expiry |
| `MealSlot` | `meal_slots` | weekStart, day, mealType (unique per user/week/day/type) |
| `MealSlotDish` | `meal_slot_dishes` | mealSlotId, recipeId, customName, calories (multi-dish per slot) |
| `CalorieEntry` | `calorie_entries` | date, mealType, foodName, calories, fromPhoto, imageUrl |
| `ShoppingItem` | `shopping_items` | name, category, quantity, checked |
| `GenerationHistory` | `generation_history` | prompt, imageUrl, resultData (JSON), status |

---

## 🧪 AI Features Deep Dive

ChefOne uses **Google Gemini** (`gemini-3.1-flash-lite-preview`) via the `@google/generative-ai` SDK. The [`gemini.service.js`](server/src/services/gemini.service.js) module provides five AI methods:

1. **`analyzeFoodImage()`** — Vision: Upload a food photo → Gemini identifies each dish and estimates nutrition. Supports multi-dish Vietnamese meals ("mâm cơm").
2. **`analyzeReceiptImage()`** — Vision: Upload a receipt/grocery photo → Gemini extracts items with categories and estimated expiry.
3. **`generateVietnameseMeal()`** — Text: Generate a complete Vietnamese family meal (3-5 dishes: rice + soup + protein + vegetable) from available ingredients.
4. **`generateRecipe()`** — Text: Generate a single recipe from the 7-step wizard (ingredients, meal type, equipment, time, skill, chef mode).
5. **`generateWeeklyMealPlan()`** — Text: Generate a full weekly meal plan based on pantry inventory, dietary preferences, and existing planned meals.

All methods return structured JSON with `responseMimeType: 'application/json'` for predictable parsing.

---

## 🛡️ Security

- **Helmet** sets security HTTP headers
- **CORS** restricted to the configured frontend origin
- **Rate limiting** via `express-rate-limit` (general, auth, and AI endpoints)
- **Input validation** via Joi schemas on all mutating endpoints
- **Ownership gating** — all data queries filter by `userId`; users can only access their own data
- **Password hashing** via `bcryptjs` (12 salt rounds)
- **File upload restrictions** — only JPEG/PNG/WebP, max 10MB
- **Global error handler** catches and normalizes all errors (Prisma, Joi, JWT, Multer)

---

## 🔧 Available Scripts

### Root

| Script | Description |
|---|---|
| `npm start` | Start React frontend on port 3000 |
| `npm run server` | Start Express backend with hot-reload (nodemon) |
| `npm run dev` | Run both frontend & backend concurrently |
| `npm run build` | Production build of the frontend |
| `npm run db:setup` | Run Prisma migrations + seed the database |

### Server (`cd server &&`)

| Script | Description |
|---|---|
| `npm run dev` | Start backend with nodemon hot-reload |
| `npm run db:migrate` | Run pending Prisma migrations |
| `npm run db:push` | Push schema to DB without migrations |
| `npm run db:seed` | Seed the database with demo data |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:reset` | Reset database (drop + migrate + seed) |

---

## 📄 License

This project is licensed under the MIT License. See [`LICENSE.md`](LICENSE.md) for details.

The UI is based on [Horizon UI TailwindCSS React](https://horizon-ui.com/horizon-tailwind-react), also MIT licensed.

---

## 🙏 Acknowledgements

- [Horizon UI](https://horizon-ui.com/) — Admin dashboard template (MIT)
- [Google Gemini AI](https://ai.google.dev/) — AI model for recipe generation and image recognition
- [Prisma](https://www.prisma.io/) — Type-safe ORM
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [ApexCharts](https://apexcharts.com/) — Charting library
- [Zustand](https://zustand.docs.pmnd.rs/) — Lightweight state management
