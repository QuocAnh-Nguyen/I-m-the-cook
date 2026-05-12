/**
 * ============================================================================
 * Dashboard — The Ultimate Aggregator
 * ============================================================================
 * 
 * Phase 1.1: Fix Dashboard Inconsistent State
 * - No longer uses hardcoded 0 values
 * - Subscribes to Zustand store for real-time metrics
 *
 * Phase 2.G: ALL Modules → Dashboard
 * - Displays total pantry items, recipes, today's calories, meal plans
 * - Shows urgent alerts (expiring items, expired items, no meals logged)
 * - All data is reactive — updates when any module changes state
 *
 * BUG FIX: Instead of calling store methods inside selectors (which return
 * new references on every call causing infinite re-renders), we subscribe
 * to raw state and compute derived values with useMemo.
 * ============================================================================
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Card from "components/card";
import useAppStore from "store/useAppStore";
import {
  MdOutlineLocalFireDepartment,
  MdOutlineMenuBook,
  MdOutlineCalendarMonth,
  MdOutlineInventory2,
  MdOutlineAutoAwesome,
  MdOutlineSettings,
  MdOutlineWarning,
  MdOutlineError,
  MdOutlineInfo,
  MdOutlineChevronRight,
  MdOutlineCameraAlt,
} from "react-icons/md";

// ─── Helper functions (moved outside component, referentially stable) ──────

const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

const toISODate = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().split("T")[0];
};

/**
 * Compute dashboard alerts from raw state.
 * Called inside useMemo to avoid creating new references on every render.
 */
const computeAlerts = (pantryItems, calorieEntries) => {
  const alerts = [];
  const today = new Date();

  // Expiring pantry items (within 3 days)
  const expiring = pantryItems.filter((item) => {
    const expiry = new Date(item.expiry);
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diff <= 3 && diff >= 0;
  });

  if (expiring.length > 0) {
    alerts.push({
      type: "warning",
      icon: "⚠️",
      title: `${expiring.length} item${expiring.length > 1 ? "s" : ""} expiring soon`,
      description: expiring.map((i) => i.name).join(", "),
      severity: "high",
    });
  }

  // Expired items
  const expired = pantryItems.filter((item) => isExpired(item.expiry));
  if (expired.length > 0) {
    alerts.push({
      type: "error",
      icon: "🚨",
      title: `${expired.length} item${expired.length > 1 ? "s" : ""} expired`,
      description: expired.map((i) => i.name).join(", "),
      severity: "critical",
    });
  }

  // Today's calorie tracking
  const todayDate = toISODate(today);
  const todayEntries = calorieEntries.filter((e) => e.date === todayDate);
  if (todayEntries.length === 0) {
    alerts.push({
      type: "info",
      icon: "📝",
      title: "No meals logged today",
      description: "Start tracking your calories for today.",
      severity: "low",
    });
  }

  // Low pantry
  if (pantryItems.length < 5) {
    alerts.push({
      type: "info",
      icon: "🛒",
      title: "Pantry running low",
      description: `Only ${pantryItems.length} items in your pantry. Consider restocking.`,
      severity: "medium",
    });
  }

  return alerts.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.severity] || 3) - (order[b.severity] || 3);
  });
};

const Dashboard = () => {
  const navigate = useNavigate();

  // ─── Subscribe to RAW primitive/stable state (avoids new reference loops) ─
  const totalRecipes = useAppStore((s) => s.recipes.length);
  const totalPantryItems = useAppStore((s) => s.pantryItems.length);
  const mealsPlanned = useAppStore((s) => Object.keys(s.weeklyPlan).length);

  // Today's calories: subscribe to primitive number (computed with useMemo)
  const calorieEntries = useAppStore((s) => s.calorieEntries);

  const todayCalories = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return calorieEntries
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + (Number(e.calories) || 0), 0);
  }, [calorieEntries]);

  // Alerts: computed from raw state via useMemo (avoids store method calls)
  const pantryItems = useAppStore((s) => s.pantryItems);

  const alerts = useMemo(
    () => computeAlerts(pantryItems, calorieEntries),
    [pantryItems, calorieEntries]
  );

  // ─── Stat cards — pulling live data from the store ───────────────────────
  const stats = [
    {
      icon: <MdOutlineMenuBook className="h-7 w-7 text-brand-500" />,
      bg: "bg-brand-50 dark:bg-navy-700",
      label: "Recipes Created",
      value: totalRecipes,
      path: "/admin/my-recipes",
    },
    {
      icon: <MdOutlineCalendarMonth className="h-7 w-7 text-green-500" />,
      bg: "bg-green-50 dark:bg-navy-700",
      label: "Meals Planned",
      value: mealsPlanned,
      path: "/admin/meal-planner",
    },
    {
      icon: <MdOutlineInventory2 className="h-7 w-7 text-amber-500" />,
      bg: "bg-amber-50 dark:bg-navy-700",
      label: "Pantry Items",
      value: totalPantryItems,
      path: "/admin/pantry",
    },
    {
      icon: <MdOutlineLocalFireDepartment className="h-7 w-7 text-red-500" />,
      bg: "bg-red-50 dark:bg-navy-700",
      label: "Calories Today",
      value: todayCalories,
      path: "/admin/nutrition-tracking",
    },
  ];

  const quickActions = [
    {
      icon: <MdOutlineLocalFireDepartment className="h-8 w-8 text-brand-500" />,
      label: "Track Calories",
      path: "/admin/nutrition-tracking",
      bg: "bg-brand-50 hover:bg-brand-100 dark:bg-navy-700 dark:hover:bg-navy-600",
    },
    {
      icon: <MdOutlineAutoAwesome className="h-8 w-8 text-purple-500" />,
      label: "AI Recipe Generator",
      path: "/admin/recipe-generator",
      bg: "bg-purple-50 hover:bg-purple-100 dark:bg-navy-700 dark:hover:bg-navy-600",
    },
    {
      icon: <MdOutlineInventory2 className="h-8 w-8 text-green-500" />,
      label: "My Pantry",
      path: "/admin/pantry",
      bg: "bg-green-50 hover:bg-green-100 dark:bg-navy-700 dark:hover:bg-navy-600",
    },
    {
      icon: <MdOutlineCalendarMonth className="h-8 w-8 text-amber-500" />,
      label: "Meal Planner",
      path: "/admin/meal-planner",
      bg: "bg-amber-50 hover:bg-amber-100 dark:bg-navy-700 dark:hover:bg-navy-600",
    },
    {
      icon: <MdOutlineMenuBook className="h-8 w-8 text-blue-500" />,
      label: "My Recipes",
      path: "/admin/my-recipes",
      bg: "bg-blue-50 hover:bg-blue-100 dark:bg-navy-700 dark:hover:bg-navy-600",
    },
    {
      icon: <MdOutlineCameraAlt className="h-8 w-8 text-orange-500" />,
      label: "Scan Food",
      path: "/admin/nutrition-tracking",
      bg: "bg-orange-50 hover:bg-orange-100 dark:bg-navy-700 dark:hover:bg-navy-600",
    },
    {
      icon: <MdOutlineSettings className="h-8 w-8 text-gray-500" />,
      label: "Profile Settings",
      path: "/admin/profile",
      bg: "bg-gray-50 hover:bg-gray-100 dark:bg-navy-700 dark:hover:bg-navy-600",
    },
  ];

  // Alert icon mapping
  const alertIcons = {
    warning: <MdOutlineWarning className="h-5 w-5 text-amber-500" />,
    error: <MdOutlineError className="h-5 w-5 text-red-500" />,
    info: <MdOutlineInfo className="h-5 w-5 text-blue-500" />,
  };

  const alertColors = {
    warning: "border-l-amber-500 bg-amber-50 dark:bg-amber-900/20",
    error: "border-l-red-500 bg-red-50 dark:bg-red-900/20",
    info: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20",
  };

  return (
    <div>
      {/* Greeting */}
      <div className="mt-3 mb-6">
        <h1 className="text-3xl font-bold text-navy-700 dark:text-white">
          Welcome back, User 👋
        </h1>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
          Ready to cook something amazing today?
        </p>
      </div>

      {/* ─── Urgent Alerts ─────────────────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="mb-5 space-y-3">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 rounded-xl border-l-4 p-4 ${alertColors[alert.type]}`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {alertIcons[alert.type]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-navy-700 dark:text-white">
                  {alert.icon} {alert.title}
                </p>
                <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                  {alert.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Stat Cards — Live Data from Global Store ──────────────────────── */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            extra="!flex-row flex-grow items-center rounded-[20px] p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(stat.path)}
          >
            <div
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${stat.bg}`}
            >
              {stat.icon}
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
              <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString()
                  : stat.value}
              </h4>
            </div>
            <MdOutlineChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
          </Card>
        ))}
      </div>

      {/* ─── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`flex flex-col items-center justify-center rounded-2xl p-6 transition-all duration-200 ${action.bg}`}
            >
              {action.icon}
              <span className="mt-3 text-sm font-semibold text-navy-700 dark:text-white">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
