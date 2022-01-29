import React from "react";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
// eslint-disable-next-line no-unused-vars
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const RadarChart = ({ data, loading }) => {
  return <>{<Radar data={data} />}</>;
};

export default RadarChart;
