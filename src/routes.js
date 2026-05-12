import React from "react";

// ChefOne View Imports
import Dashboard from "views/admin/default";
import RecipeGenerator from "views/admin/recipe-generator";
import PantryManager from "views/admin/pantry";
import MealPlanner from "views/admin/meal-planner";
import NutritionTracking from "views/admin/nutrition-tracking";
import MyRecipes from "views/admin/my-recipes";
// TODO: Re-enable when authentication is deployed
// import ProfileOverview from "views/admin/profile";

// Icon Imports
import {
  MdOutlineDashboard,
  MdOutlineMenuBook,
  MdOutlineInventory2,
  MdOutlineCalendarMonth,
  MdOutlineLocalFireDepartment,
  MdOutlineBookmark,
  // MdOutlineSettings, // TODO: Re-enable when authentication is deployed
} from "react-icons/md";

/**
 * Route Configuration
 *
 * Phase 1.3: Calorie Tracker and Nutrition Analytics have been merged
 * into a single "Nutrition & Tracking" page with a tabbed interface.
 * The old separate routes (/calorie-tracker and /nutrition) are removed.
 */
const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdOutlineDashboard className="h-6 w-6" />,
    component: <Dashboard />,
  },
  {
    name: "AI Recipe Generator",
    layout: "/admin",
    path: "recipe-generator",
    icon: <MdOutlineMenuBook className="h-6 w-6" />,
    component: <RecipeGenerator />,
  },
  {
    name: "My Recipes",
    layout: "/admin",
    path: "my-recipes",
    icon: <MdOutlineBookmark className="h-6 w-6" />,
    component: <MyRecipes />,
  },
  {
    name: "Pantry Manager",
    layout: "/admin",
    path: "pantry",
    icon: <MdOutlineInventory2 className="h-6 w-6" />,
    component: <PantryManager />,
  },
  {
    name: "Meal Planner",
    layout: "/admin",
    path: "meal-planner",
    icon: <MdOutlineCalendarMonth className="h-6 w-6" />,
    component: <MealPlanner />,
  },
  {
    name: "Nutrition & Tracking",
    layout: "/admin",
    path: "nutrition-tracking",
    icon: <MdOutlineLocalFireDepartment className="h-6 w-6" />,
    component: <NutritionTracking />,
  },
  // TODO: Re-enable when authentication is deployed
  // {
  //   name: "Profile Settings",
  //   layout: "/admin",
  //   path: "profile",
  //   icon: <MdOutlineSettings className="h-6 w-6" />,
  //   component: <ProfileOverview />,
  // },
];

export default routes;
