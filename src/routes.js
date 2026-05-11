import React from "react";

// ChefOne View Imports
import Dashboard from "views/admin/default";
import RecipeGenerator from "views/admin/recipe-generator";
import PantryManager from "views/admin/pantry";
import MealPlanner from "views/admin/meal-planner";
import NutritionAnalytics from "views/admin/nutrition";
import CalorieTracker from "views/admin/calorie-tracker";
import MyRecipes from "views/admin/my-recipes";
import ProfileOverview from "views/admin/profile";

// Icon Imports
import {
  MdOutlineDashboard,
  MdOutlineMenuBook,
  MdOutlineInventory2,
  MdOutlineCalendarMonth,
  MdOutlineBarChart,
  MdOutlineLocalFireDepartment,
  MdOutlineBookmark,
  MdOutlineSettings,
} from "react-icons/md";

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
    name: "Calorie Tracker",
    layout: "/admin",
    path: "calorie-tracker",
    icon: <MdOutlineLocalFireDepartment className="h-6 w-6" />,
    component: <CalorieTracker />,
  },
  {
    name: "Nutrition Analytics",
    layout: "/admin",
    path: "nutrition",
    icon: <MdOutlineBarChart className="h-6 w-6" />,
    component: <NutritionAnalytics />,
  },
  {
    name: "Profile Settings",
    layout: "/admin",
    path: "profile",
    icon: <MdOutlineSettings className="h-6 w-6" />,
    component: <ProfileOverview />,
  },
];

export default routes;
