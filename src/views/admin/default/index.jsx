import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "components/card";
import {
  MdOutlineLocalFireDepartment,
  MdOutlineMenuBook,
  MdOutlineCalendarMonth,
  MdOutlineInventory2,
  MdOutlineAutoAwesome,
  MdOutlineSettings,
} from "react-icons/md";

const Dashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      icon: <MdOutlineMenuBook className="h-7 w-7 text-brand-500" />,
      bg: "bg-brand-50 dark:bg-navy-700",
      label: "Recipes Created",
      value: "0",
    },
    {
      icon: <MdOutlineCalendarMonth className="h-7 w-7 text-green-500" />,
      bg: "bg-green-50 dark:bg-navy-700",
      label: "Meal Plans",
      value: "0",
    },
    {
      icon: <MdOutlineInventory2 className="h-7 w-7 text-amber-500" />,
      bg: "bg-amber-50 dark:bg-navy-700",
      label: "Pantry Items",
      value: "0",
    },
    {
      icon: <MdOutlineLocalFireDepartment className="h-7 w-7 text-red-500" />,
      bg: "bg-red-50 dark:bg-navy-700",
      label: "Calories Today",
      value: "0",
    },
  ];

  const quickActions = [
    {
      icon: <MdOutlineLocalFireDepartment className="h-8 w-8 text-brand-500" />,
      label: "Track Calories",
      path: "/admin/calorie-tracker",
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
      icon: <MdOutlineSettings className="h-8 w-8 text-gray-500" />,
      label: "Profile Settings",
      path: "/admin/profile",
      bg: "bg-gray-50 hover:bg-gray-100 dark:bg-navy-700 dark:hover:bg-navy-600",
    },
  ];

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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            extra="!flex-row flex-grow items-center rounded-[20px] p-4"
          >
            <div
              className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${stat.bg}`}
            >
              {stat.icon}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
              <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
                {stat.value}
              </h4>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6">
        <h2 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
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
