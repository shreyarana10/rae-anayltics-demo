import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";
// Polynomial regression (degree 2 = quadratic curve)
function polynomialRegression(data, degree = 2) {
  const n = data.length;
  const xVals = data.map((_, i) => i);

  // Build Vandermonde matrix
  const X = xVals.map((x) =>
    Array.from({ length: degree + 1 }, (_, d) => Math.pow(x, d)),
  );

  // Normal equation: coeffs = (X'X)^-1 X'y
  const XT = X[0].map((_, col) => X.map((row) => row[col]));
  const XTX = XT.map((row1) =>
    XT.map((row2) => row1.reduce((s, _, k) => s + row1[k] * row2[k], 0)),
  );
  const XTy = XT.map((row) => row.reduce((s, _, k) => s + row[k] * data[k], 0));

  // Gaussian elimination to solve XTX * coeffs = XTy
  const aug = XTX.map((row, i) => [...row, XTy[i]]);
  const size = aug.length;
  for (let col = 0; col < size; col++) {
    let maxRow = col;
    for (let row = col + 1; row < size; row++)
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
    for (let row = col + 1; row < size; row++) {
      const factor = aug[row][col] / aug[col][col];
      for (let j = col; j <= size; j++) aug[row][j] -= factor * aug[col][j];
    }
  }
  const coeffs = new Array(size).fill(0);
  for (let i = size - 1; i >= 0; i--) {
    coeffs[i] = aug[i][size] / aug[i][i];
    for (let j = i - 1; j >= 0; j--) aug[j][size] -= aug[j][i] * coeffs[i];
  }

  return xVals.map((x) =>
    coeffs.reduce((sum, c, d) => sum + c * Math.pow(x, d), 0),
  );
}
export default function InflationSplineChart({ data = [] }) {
  const chartRef = useRef(null);

  const categories = data.map((row) =>
    new Date(row.service_month + "-01").toLocaleString("en-US", {
      month: "short",
      year: "numeric",
    }),
  );

  const actualData = data.map((row) => Number(row.sumTotal));

  const trendData = polynomialRegression(actualData, 2);
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
