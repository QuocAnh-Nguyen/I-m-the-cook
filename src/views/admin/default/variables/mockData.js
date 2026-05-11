// ChefOne Dashboard Mock Data

export const recentRecipes = [
  {
    id: 1,
    name: "Spaghetti Carbonara",
    prepTime: "15 min",
    cookTime: "20 min",
    calories: 620,
    date: "2026-05-10",
    tags: ["Italian", "Pasta"],
  },
  {
    id: 2,
    name: "Thai Green Curry",
    prepTime: "20 min",
    cookTime: "30 min",
    calories: 480,
    date: "2026-05-09",
    tags: ["Thai", "Curry"],
  },
  {
    id: 3,
    name: "Avocado Toast with Egg",
    prepTime: "5 min",
    cookTime: "10 min",
    calories: 320,
    date: "2026-05-09",
    tags: ["Breakfast", "Healthy"],
  },
  {
    id: 4,
    name: "Grilled Salmon with Quinoa",
    prepTime: "10 min",
    cookTime: "25 min",
    calories: 540,
    date: "2026-05-08",
    tags: ["Seafood", "High Protein"],
  },
  {
    id: 5,
    name: "Chicken Caesar Salad",
    prepTime: "15 min",
    cookTime: "15 min",
    calories: 410,
    date: "2026-05-08",
    tags: ["Salad", "Healthy"],
  },
  {
    id: 6,
    name: "Mushroom Risotto",
    prepTime: "10 min",
    cookTime: "35 min",
    calories: 570,
    date: "2026-05-07",
    tags: ["Italian", "Vegetarian"],
  },
];

export const macroData = [
  { name: "Protein", value: 28, color: "#422AFB" },
  { name: "Carbs", value: 45, color: "#6AD2FF" },
  { name: "Fat", value: 27, color: "#EFF4FB" },
];

export const macroChartData = [28, 45, 27];
export const macroChartOptions = {
  labels: ["Protein", "Carbs", "Fat"],
  colors: ["#422AFB", "#6AD2FF", "#EFF4FB"],
  chart: {
    width: "50px",
  },
  states: {
    hover: {
      filter: {
        type: "none",
      },
    },
  },
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  hover: { mode: null },
  plotOptions: {
    donut: {
      expandOnClick: false,
      donut: {
        labels: {
          show: false,
        },
      },
    },
  },
  fill: {
    colors: ["#422AFB", "#6AD2FF", "#EFF4FB"],
  },
  tooltip: {
    enabled: true,
    theme: "dark",
    style: {
      fontSize: "12px",
      fontFamily: undefined,
      backgroundColor: "#000000",
    },
  },
};

export const columnsRecentRecipes = [
  { Header: "RECIPE", accessor: "name" },
  { Header: "PREP TIME", accessor: "prepTime" },
  { Header: "CALORIES", accessor: "calories" },
  { Header: "DATE", accessor: "date" },
];
