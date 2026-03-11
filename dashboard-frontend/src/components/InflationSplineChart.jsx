import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";

export default function InflationSplineChart({ data = [] }) {
  const chartRef = useRef(null);

  const categories = data.map((row) =>
    new Date(row.service_month + "-01").toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    }),
  );

  const actualData = data.map((row) => Number(row.sumTotal));

  const trendData = actualData.map((_, i, arr) => {
    const slice = arr.slice(0, i + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });

  useEffect(() => {
    if (!data.length) return;

    Highcharts.chart(chartRef.current, {
      chart: {
        type: "line",
        backgroundColor: "#ffffff",
      },
      title: { text: null },
      credits: { enabled: false },
      legend: { enabled: true },

      xAxis: {
        categories,
        labels: {
          rotation: -45,
          style: { fontSize: "10px", fontWeight: 700 },
        },
      },

      yAxis: {
        title: { text: "AUD" },
        labels: {
          formatter() {
            return `$${(this.value / 1000).toFixed(0)}k`;
          },
        },
        tickAmount: 6,
      },

      series: [
        {
          name: "Total Sales",
          data: actualData,
          color: "#2f6fd6",
          lineWidth: 4,
        },
        {
          name: "Trend",
          data: trendData,
          color: "#f97316",
          dashStyle: "ShortDash",
        },
      ],
    });
  }, [data]);

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
}
