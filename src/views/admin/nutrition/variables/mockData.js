// ChefOne — Nutrition Analytics Mock Data

export const DAYS_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 7-day calorie intake (kcal)
export const calorieData = [1920, 2150, 1780, 2200, 1650, 2350, 1980];
export const calorieGoal = 2200;

// Daily macro breakdown per day (grams)
export const macroBreakdown = {
  protein: [95, 110, 88, 105, 78, 120, 98],
  carbs: [220, 260, 200, 250, 185, 290, 235],
  fat: [65, 72, 58, 70, 52, 80, 64],
};

// Calorie Trend Line Chart options
export const calorieLineChartData = [
  {
    name: "Calories",
    data: calorieData,
  },
  {
    name: "Goal",
    data: Array(7).fill(calorieGoal),
  },
];

export const calorieLineChartOptions = {
  chart: {
    toolbar: { show: false },
    type: "line",
    fontFamily: "DM Sans, sans-serif",
  },
  colors: ["#422AFB", "#E2E8F0"],
  stroke: {
    curve: "smooth",
    width: [3, 2],
    dashArray: [0, 6],
  },
  markers: {
    size: 4,
    colors: ["#422AFB"],
    strokeColors: "#fff",
    strokeWidth: 2,
  },
  xaxis: {
    categories: DAYS_LABELS,
    labels: {
      style: { colors: "#A3AED0", fontSize: "12px" },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: "#A3AED0", fontSize: "12px" },
      formatter: (v) => `${v} kcal`,
    },
  },
  grid: {
    borderColor: "#E2E8F0",
    strokeDashArray: 5,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
  },
  tooltip: {
    theme: "dark",
    y: { formatter: (v) => `${v} kcal` },
  },
  legend: {
    show: true,
    position: "top",
    labels: { colors: "#A3AED0" },
  },
};

// Macro Breakdown Bar Chart
export const macroBarChartData = [
  { name: "Protein", data: macroBreakdown.protein },
  { name: "Carbs", data: macroBreakdown.carbs },
  { name: "Fat", data: macroBreakdown.fat },
];

export const macroBarChartOptions = {
  chart: {
    toolbar: { show: false },
    stacked: false,
    fontFamily: "DM Sans, sans-serif",
  },
  colors: ["#422AFB", "#6AD2FF", "#f97316"],
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: "55%",
    },
  },
  xaxis: {
    categories: DAYS_LABELS,
    labels: {
      style: { colors: "#A3AED0", fontSize: "12px" },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: "#A3AED0", fontSize: "12px" },
      formatter: (v) => `${v}g`,
    },
  },
  grid: {
    borderColor: "#E2E8F0",
    strokeDashArray: 5,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
  },
  tooltip: {
    theme: "dark",
    y: { formatter: (v) => `${v}g` },
  },
  legend: {
    show: true,
    position: "top",
    labels: { colors: "#A3AED0" },
  },
};

// Computed summary stats
const avgCalories = Math.round(
  calorieData.reduce((a, b) => a + b, 0) / calorieData.length
);
const avgProtein = Math.round(
  macroBreakdown.protein.reduce((a, b) => a + b, 0) / macroBreakdown.protein.length
);
const goalDays = calorieData.filter((c) => c <= calorieGoal).length;
const goalCompliance = Math.round((goalDays / calorieData.length) * 100);

export const summaryStats = { avgCalories, avgProtein, goalCompliance };
