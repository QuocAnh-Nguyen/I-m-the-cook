/**
 * BarChart — Functional component (refactored from class component)
 * 
 * Now reactive: re-renders when chartData or chartOptions change.
 * This is critical for Phase 2.F (Calorie Tracker → Nutrition Analytics)
 * where logging food must immediately update the charts.
 */
import React from "react";
import Chart from "react-apexcharts";

const BarChart = ({ chartData, chartOptions }) => {
  return (
    <Chart
      options={chartOptions}
      series={chartData}
      type="bar"
      width="100%"
      height="100%"
    />
  );
};

export default BarChart;
