import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";
// eslint-disable-next-line no-unused-vars
import { Pie } from "react-chartjs-2";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const PieChart = ({ data, loading }) => {
  return <>{<Pie data={data} />}</>;
};

export default PieChart;
