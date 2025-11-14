"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface LineChartProps {
  data: number[];
  labels?: string[];
  borderColor?: string;
  backgroundColor?: string;
}

export function LineChart({
  data,
  labels,
  borderColor = '#8884d8',
  backgroundColor = 'rgba(136, 132, 216, 0.1)'
}: LineChartProps) {
  const chartData = {
    labels: labels || data.map((_, i) => i.toString()),
    datasets: [
      {
        data,
        borderColor,
        backgroundColor,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  return <Line data={chartData} options={options} />;
} 