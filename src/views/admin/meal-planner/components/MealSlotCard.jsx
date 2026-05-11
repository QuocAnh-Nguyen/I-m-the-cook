import React from "react";
import { MdOutlineAdd, MdOutlineClose, MdOutlineLocalFireDepartment } from "react-icons/md";

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

const MealSlotCard = ({ day, mealType, meal, onAssign, onRemove }) => {
  const key = `${day}-${mealType}`;
  const colorClass = mealTypeColors[mealType] || "border-gray-200 bg-gray-50";
  const dotColor = mealTypeDotColors[mealType] || "bg-gray-400";

  return (
    <div
      className={`rounded-xl border ${colorClass} p-2 min-h-[72px] flex flex-col justify-between`}
    >
      {/* Meal type label */}
      <div className="flex items-center gap-1 mb-1">
        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${dotColor}`} />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {mealType}
        </span>
      </div>

      {meal ? (
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-navy-700 dark:text-white leading-tight truncate">
              {meal.name}
            </p>
            <div className="flex items-center gap-0.5 mt-0.5">
              <MdOutlineLocalFireDepartment className="h-3 w-3 text-red-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {meal.calories} kcal
              </span>
            </div>
          </div>
          <button
            onClick={() => onRemove(key)}
            className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white dark:bg-navy-700"
          >
            <MdOutlineClose className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onAssign(key)}
          className="flex items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 py-1.5 text-[10px] font-medium text-gray-400 hover:border-brand-400 hover:text-brand-500 transition dark:border-white/20 dark:hover:border-brand-400"
        >
          <MdOutlineAdd className="h-3 w-3" />
          Add
        </button>
      )}
    </div>
  );
};

export default MealSlotCard;
