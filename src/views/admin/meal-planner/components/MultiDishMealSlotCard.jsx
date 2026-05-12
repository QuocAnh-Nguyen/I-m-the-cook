/**
 * MultiDishMealSlotCard — Renders a meal slot with multiple dishes.
 * Supports the Vietnamese "mâm cơm" concept where each meal has 3-4 dishes.
 */
import React from "react";
import {
  MdOutlineAdd,
  MdOutlineClose,
  MdOutlineLocalFireDepartment,
} from "react-icons/md";

const mealTypeColors = {
  Breakfast: "border-amber-300 bg-amber-50 dark:bg-amber-900/20",
  Lunch: "border-blue-300 bg-blue-50 dark:bg-blue-900/20",
  Dinner: "border-brand-300 bg-brand-50 dark:bg-brand-900/20",
  Snack: "border-green-300 bg-green-50 dark:bg-green-900/20",
};

const mealTypeDotColors = {
  Breakfast: "bg-amber-400",
  Lunch: "bg-blue-400",
  Dinner: "bg-brand-500",
  Snack: "bg-green-500",
};

const MultiDishMealSlotCard = ({
  day,
  mealType,
  meal,
  onAssign,
  onAddDish,
  onRemove,
  isPast,
  isToday,
}) => {
  const key = `${day}-${mealType}`;
  const colorClass = mealTypeColors[mealType] || "border-gray-200 bg-gray-50";
  const dotColor = mealTypeDotColors[mealType] || "bg-gray-400";
  const dishes = meal?.dishes || [];
  const totalCalories = dishes.reduce((sum, d) => sum + (d.calories || 0), 0);

  return (
    <div
      className={`rounded-xl border ${colorClass} p-2 min-h-[80px] flex flex-col justify-between ${
        isToday ? "ring-1 ring-brand-300" : ""
      }`}
    >
      {/* Meal type label */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dotColor}`} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {mealType}
          </span>
        </div>
        {dishes.length > 0 && (
          <div className="flex items-center gap-0.5">
            <MdOutlineLocalFireDepartment className="h-3 w-3 text-red-400" />
            <span className="text-[10px] font-semibold text-gray-500">
              {totalCalories}
            </span>
          </div>
        )}
      </div>

      {dishes.length > 0 ? (
        <div className="flex-1">
          {/* Dish list */}
          <div className="space-y-0.5">
            {dishes.map((dish, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-0.5 group"
              >
                <div className="flex items-start gap-1 min-w-0 flex-1">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
                  <p className="text-[11px] leading-tight text-navy-700 dark:text-white truncate">
                    {dish.name || dish.customName || "Unknown"}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(key, idx);
                  }}
                  className="flex-shrink-0 h-4 w-4 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity dark:hover:bg-navy-700"
                >
                  <MdOutlineClose className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add another dish button */}
          <button
            onClick={() => onAddDish(key)}
            className="mt-1 flex w-full items-center justify-center gap-0.5 rounded-md border border-dashed border-gray-300/50 py-0.5 text-[9px] font-medium text-gray-400 hover:border-brand-400 hover:text-brand-500 transition dark:border-white/10"
          >
            <MdOutlineAdd className="h-2.5 w-2.5" />
            Add dish
          </button>
        </div>
      ) : (
        <button
          onClick={() => onAssign(key)}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 py-2 text-[10px] font-medium text-gray-400 hover:border-brand-400 hover:text-brand-500 transition dark:border-white/20 dark:hover:border-brand-400"
        >
          <MdOutlineAdd className="h-3 w-3" />
          Add meal
        </button>
      )}
    </div>
  );
};

export default MultiDishMealSlotCard;