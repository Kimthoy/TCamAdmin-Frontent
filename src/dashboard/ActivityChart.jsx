// src/dashboard/ActivityChart.jsx
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export function ActivityChart({ data = [] }) {
  // data: expected array of numbers (e.g. [5, 8, 12, ...])
  const labels = useMemo(() => {
    if (data && data.length) {
      return data.map((_, i) => `T-${data.length - i}`);
    }
    // fallback labels
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  }, [data]);

  const dataset = useMemo(() => {
    const points = data && data.length ? data : [10, 20, 30, 25, 35, 40, 50];
    return {
      labels,
      datasets: [
        {
          label: "Active",
          data: points,
          fill: true,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 6,
          borderWidth: 3,
          // color assigned dynamically via canvas gradient in options
        },
      ],
    };
  }, [data, labels]);

  const options = {
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: "#111827",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        cornerRadius: 6,
        padding: 8,
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
    elements: {
      line: {
        borderJoinStyle: "round",
      },
    },
    onHover: (event, chartElement) => {
      event.native.target.style.cursor = chartElement[0]
        ? "pointer"
        : "default";
    },
  };

  // ChartJS gradient setup: use getContext callback
  const plugins = [
    {
      id: "gradientFill",
      beforeDraw: (chart) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const gradient = ctx.createLinearGradient(
          0,
          chartArea.top,
          0,
          chartArea.bottom
        );
        gradient.addColorStop(0, "rgba(59,130,246,0.45)"); // blue
        gradient.addColorStop(1, "rgba(99,102,241,0.05)"); // violet faint
        chart.data.datasets[0].backgroundColor = gradient;
        chart.data.datasets[0].borderColor = "rgba(59,130,246,1)";
        chart.data.datasets[0].pointBackgroundColor = "rgba(59,130,246,1)";
      },
    },
    // highlight last point plugin
    {
      id: "activePoint",
      afterDatasetDraw: (chart, args, opts) => {
        const { ctx, data, chartArea } = chart;
        const dataset = data.datasets[0].data;
        const meta = chart.getDatasetMeta(0);
        const lastIndex = dataset.length - 1;
        if (lastIndex < 0) return;
        const point = meta.data[lastIndex];
        if (!point) return;
        ctx.save();
        // ring
        ctx.beginPath();
        ctx.arc(point.x, point.y, 10, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(59,130,246,0.12)";
        ctx.fill();
        // inner dot
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = "rgba(59,130,246,1)";
        ctx.fill();
        ctx.restore();
      },
    },
  ];

  return (
    <div className="h-full w-full p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-2xl">
      <div className="h-full">
        <Line data={dataset} options={options} plugins={plugins} />
      </div>
    </div>
  );
}
