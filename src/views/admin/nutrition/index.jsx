import React from "react";
import Card from "components/card";
import LineChart from "components/charts/LineChart";
import BarChart from "components/charts/BarChart";
import Widget from "components/widget/Widget";
import {
  MdOutlineLocalFireDepartment,
  MdOutlineFitnessCenter,
  MdOutlineTrackChanges,
} from "react-icons/md";
import {
  calorieLineChartData,
  calorieLineChartOptions,
  macroBarChartData,
  macroBarChartOptions,
  summaryStats,
  calorieData,
  macroBreakdown,
  DAYS_LABELS,
  calorieGoal,
} from "./variables/mockData";

const NutritionAnalytics = () => {
  return (
    <div>
      {/* Summary Widgets */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-3">
        <Widget
          icon={<MdOutlineLocalFireDepartment className="h-7 w-7" />}
          title={"Avg. Calories / Day"}
          subtitle={`${summaryStats.avgCalories} kcal`}
        />
        <Widget
          icon={<MdOutlineFitnessCenter className="h-7 w-7" />}
          title={"Avg. Protein / Day"}
          subtitle={`${summaryStats.avgProtein}g`}
        />
        <Widget
          icon={<MdOutlineTrackChanges className="h-7 w-7" />}
          title={"Goal Compliance"}
          subtitle={`${summaryStats.goalCompliance}%`}
        />
      </div>

      {/* Charts Row */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Calorie Trend Line Chart */}
        <Card extra="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-700 dark:text-white">
                Calorie Intake — 7 Days
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Daily vs. {calorieGoal} kcal goal
              </p>
            </div>
            <span className="rounded-xl bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-500">
              This Week
            </span>
          </div>
          <div className="h-[260px]">
            <LineChart
              series={calorieLineChartData}
              options={calorieLineChartOptions}
            />
          </div>
        </Card>

        {/* Macro Breakdown Bar Chart */}
        <Card extra="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-700 dark:text-white">
                Macro Breakdown — 7 Days
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Protein, Carbs & Fat (grams)
              </p>
            </div>
            <div className="flex gap-3">
              {[
                { label: "Protein", color: "bg-brand-500" },
                { label: "Carbs", color: "bg-cyan-400" },
                { label: "Fat", color: "bg-orange-500" },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-[260px]">
            <BarChart
              chartData={macroBarChartData}
              chartOptions={macroBarChartOptions}
            />
          </div>
        </Card>
      </div>

      {/* Daily Detail Table */}
      <div className="mt-5">
        <Card extra="p-5">
          <h2 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
            Daily Nutrition Breakdown
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {["Day", "Calories", "vs Goal", "Protein", "Carbs", "Fat", "Status"].map(
                    (col) => (
                      <th
                        key={col}
                        className="border-b border-gray-200 py-3 pr-4 text-left text-xs font-bold uppercase tracking-wide text-gray-600 dark:border-white/10"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {DAYS_LABELS.map((day, idx) => {
                  const cal = calorieData[idx];
                  const diff = cal - calorieGoal;
                  const underGoal = cal <= calorieGoal;
                  return (
                    <tr
                      key={day}
                      className="hover:bg-gray-50 dark:hover:bg-navy-700"
                    >
                      <td className="py-3 pr-4 text-sm font-bold text-navy-700 dark:text-white">
                        {day}
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-600 dark:text-white">
                        🔥 {cal.toLocaleString()} kcal
                      </td>
                      <td className="py-3 pr-4 text-sm">
                        <span
                          className={`font-medium ${
                            underGoal ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {underGoal ? "" : "+"}
                          {diff} kcal
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-600 dark:text-white">
                        {macroBreakdown.protein[idx]}g
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-600 dark:text-white">
                        {macroBreakdown.carbs[idx]}g
                      </td>
                      <td className="py-3 pr-4 text-sm text-gray-600 dark:text-white">
                        {macroBreakdown.fat[idx]}g
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            underGoal
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {underGoal ? "On Track" : "Over Goal"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NutritionAnalytics;
