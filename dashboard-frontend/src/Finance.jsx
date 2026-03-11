import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import ProjectCard from "./components/ProjectCard";
import SearchBar from "./components/SearchBar";
import InflationSplineChart from "./components/InflationSplineChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  Sector,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Scatter,
} from "recharts";
import {
  Loader2,
  Search,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Building2,
  Factory,
  Monitor,
  LayoutDashboard,
} from "lucide-react";

const mixData = [
  { name: "July", building: 4000, industrial: 2400, it: 2400 },
  { name: "Aug", building: 3000, industrial: 1398, it: 2210 },
  { name: "Sept", building: 2000, industrial: 9800, it: 2290 },
  { name: "Oct", building: 2780, industrial: 3908, it: 2000 },
  { name: "Nov", building: 1890, industrial: 4800, it: 2181 },
  { name: "Dec", building: 2390, industrial: 3800, it: 2500 },
  { name: "Jan", building: 3490, industrial: 4300, it: 2100 },
];

const tabData = {
  AUS: [],
  China: [],
  "New ZE": [],
  Upcoming: [],
};
const TAB_COLORS = {
  AUS: "#3b82f6",
  China: "#ef4444",
  "New ZE": "#10b981",
  Upcoming: "#f59e0b",
};
const TABS = ["AUS", "China", "New ZE", "Upcoming"];

function MixBarChart({ data = [] }) {
  const [focusedDataKey, setFocusedDataKey] = useState(null);
  const [locked, setLocked] = useState(false);

  const onLegendMouseEnter = (p) => {
    if (!locked) setFocusedDataKey(String(p.dataKey));
  };
  const onLegendMouseOut = () => {
    if (!locked) setFocusedDataKey(null);
  };
  const onLegendClick = (p) => {
    if (focusedDataKey === String(p.dataKey)) {
      setLocked(!locked);
      if (locked) setFocusedDataKey(null);
    } else {
      setFocusedDataKey(String(p.dataKey));
      setLocked(true);
    }
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
        barCategoryGap={10}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
        <YAxis
          fontSize={10}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fill: "#94a3b8", fontWeight: 700 }}
          label={{
            value: "AUD",
            angle: -90,
            position: "insideLeft",
            style: {
              textAnchor: "middle",
              fill: "#94a3b8",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.08em",
            },
          }}
        />
        <Tooltip />
        <Legend
          onMouseEnter={onLegendMouseEnter}
          onMouseOut={onLegendMouseOut}
          onClick={onLegendClick}
          wrapperStyle={{ cursor: "pointer", fontSize: "11px" }}
        />
        <Bar
          dataKey="building"
          fill={
            focusedDataKey == null || focusedDataKey === "building"
              ? "#8884d8"
              : "#e5e7eb"
          }
          barSize={10}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="industrial"
          fill={
            focusedDataKey == null || focusedDataKey === "industrial"
              ? "#82ca9d"
              : "#e5e7eb"
          }
          barSize={10}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="it"
          fill={
            focusedDataKey == null || focusedDataKey === "it"
              ? "#ffc658"
              : "#e5e7eb"
          }
          barSize={10}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

function calculateTotalGrowthPct(summary) {
  if (!summary) return null;

  const teams = [
    {
      current: Number(summary.building_current),
      growthPct: Number(summary.building_growth_pct),
    },
    {
      current: Number(summary.industrial_current),
      growthPct: Number(summary.industrial_growth_pct),
    },
    {
      current: Number(summary.it_current),
      growthPct: Number(summary.it_growth_pct),
    },
  ];

  let totalCurrent = 0;
  let totalPrevious = 0;

  teams.forEach(({ current, growthPct }) => {
    if (isNaN(current) || isNaN(growthPct)) return;

    const previous = current / (1 + growthPct / 100);

    totalCurrent += current;
    totalPrevious += previous;
  });

  if (totalPrevious === 0) return null;

  return ((totalCurrent - totalPrevious) / totalPrevious) * 100;
}

const pie1 = {
  label: "Nov",
  data: [
    { name: "Done", value: 68 },
    { name: "Left", value: 32 },
  ],
  colors: ["#0088FE", "#00C49F"],
};
const pie2 = {
  label: "Dec",
  data: [
    { name: "Billable", value: 45 },
    { name: "Internal", value: 30 },
    { name: "Other", value: 25 },
  ],
  colors: ["#0088FE", "#00C49F", "#FFBB28"],
};
const pie3 = {
  label: "Jan",
  data: [
    { name: "On Time", value: 80 },
    { name: "Late", value: 12 },
    { name: "At Risk", value: 8 },
  ],
  colors: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"],
};
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null)
    return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const ncx = Number(cx);
  const ncy = Number(cy);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > ncx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight="bold"
    >
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  );
};
const makeCustomPie = (colors) => (props) => (
  <Sector {...props} fill={colors[props.index % colors.length]} />
);
function SmallCustomPie({ data, colors, label }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <PieChart width={110} height={110}>
        <Tooltip
          formatter={(value, name) => [`${value}`, name]}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            fontSize: "11px",
            fontWeight: 700,
          }}
        />
        <Pie
          data={data}
          dataKey="value"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={50}
          shape={makeCustomPie(colors)}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
      </PieChart>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
        {label}
      </p>
    </div>
  );
}

export default function Finance({ filter, searchTerm, setSearchTerm }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("AUS");
  const [cardSummary, setCardSummary] = useState(null);
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [yearlyTotals, setYearlyTotals] = useState([]);
  const [teamPercentage, setTeamPercentage] = useState([]);
  const [teamTotals, setTeamTotals] = useState([]);
  const [stateSales, setStateSales] = useState([]);
  const [stateLoading, setStateLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/finance/state-sales-summary")
      .then((res) => {
        setStateSales(res.data);
        setStateLoading(false);
      })
      .catch((err) => {
        console.error("State sales error:", err);
        setStateLoading(false);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/finance/monthly-team-query")
      .then((res) => {
        const sortedData = [...res.data].sort((a, b) =>
          a.service_month.localeCompare(b.service_month),
        );
        const lastSixMonths = sortedData.slice(-6);

        const transformedData = lastSixMonths.map((item) => {
          const date = new Date(item.service_month + "-01");
          const month = date.toLocaleString("en-US", { month: "short" });
          const year = date.getFullYear().toString().slice(-2);

          return {
            name: `${month} '${year}`,
            building: Number(item.building_total),
            industrial: Number(item.industrial_total),
            it: Number(item.it_total),
          };
        });
        setTeamTotals(transformedData);
      })
      .catch((err) => console.error("Team totals error:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/finance/monthly-team-percentage")
      .then((res) => setTeamPercentage(res.data))
      .catch((err) => console.error("Percentage error  ", err));
  }, []);
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/finance/yearly-total")
      .then((res) => setYearlyTotals(res.data))
      .catch((err) => console.error("Yearly total error", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/finance/monthly-total")
      .then((res) => setMonthlyTotals(res.data))
      .catch((err) => console.error("Monthly total error:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/finance/card-summary")
      .then((res) => setCardSummary(res.data))
      .catch((err) => console.error("Card summary error:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/detailed-projects")
      .then((res) => {
        setProjects(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("csarae_search", searchTerm);
  }, [searchTerm]);

  const stateChartData = useMemo(() => {
    const STATE_DISPLAY = {
      nsw: "NSW",
      qld: "QLD",
      victoria: "VICTORIA",
      wa: "WA",
    };
    if (!Array.isArray(stateSales)) return [];
    return stateSales.map((row) => ({
      state: (() => {
        const raw = row.state?.trim() ?? "";
        const mapped = STATE_DISPLAY[raw.toLowerCase()];
        if (mapped) return mapped;
        if (!raw || raw.toLowerCase() === "n/a" || raw.toLowerCase() === "null")
          return "Unassigned";
        return raw;
      })(),
      amount: Number(row.total_amount),
    }));
  }, [stateSales]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const TEAM_COLORS = {
    building: "#3b82f6", // blue
    industrial: "#10b981", // green
    it: "#8b5cf6", // violet
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
          <p className="text-sm font-bold text-slate-700 mb-1">{data.name}</p>
          <p className="text-xs text-slate-500">
            Amount:{" "}
            <span className="font-bold text-slate-700">
              {formatCurrency(data.amount)}
            </span>
          </p>
          <p className="text-xs text-slate-500">
            {/* Percentage:{" "} */}
            <span className="font-bold text-slate-700">{data.percentage}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const totalSalesMonthlyData = useMemo(() => {
    return monthlyTotals.map((row) => ({
      month: new Date(row.service_month + "-01").toLocaleString("en-US", {
        month: "short",
      }),
      aud: Number(row.sumTotal),
    }));
  }, [monthlyTotals]);

  const totalGrowthPct = calculateTotalGrowthPct(cardSummary);

  const liveSummaryCards = [
    {
      title: "Building",

      value: cardSummary
        ? `$${Number(cardSummary.building_current).toLocaleString()}`
        : "Loading...",

      sub: cardSummary?.building_growth_pct != null ? `` : "N/A",

      change:
        cardSummary?.building_growth_pct != null
          ? `${cardSummary.building_growth_pct > 0 ? "+" : ""}${cardSummary.building_growth_pct}%`
          : "—",

      positive:
        cardSummary?.building_growth_pct != null &&
        cardSummary.building_growth_pct >= 0,
      icon: Building2,
      bg: "bg-blue-50",
      iconColor: "text-blue-500",
      border: "border-blue-100",
      badge:
        cardSummary?.building_growth_pct != null &&
        cardSummary.building_growth_pct >= 0
          ? "bg-blue-100 text-blue-600"
          : "bg-red-100 text-red-500",
    },
    {
      title: "Industrial",
      value: cardSummary
        ? `$${Number(cardSummary.industrial_current).toLocaleString()}`
        : "Loading...",

      sub: cardSummary?.industrial_growth_pct != null ? `` : "N/A",

      change:
        cardSummary?.industrial_growth_pct != null
          ? `${cardSummary.industrial_growth_pct > 0 ? "+" : ""}${cardSummary.industrial_growth_pct}%`
          : "—",
      positive:
        cardSummary?.industrial_growth_pct != null &&
        cardSummary.industrial_growth_pct >= 0,
      icon: Factory,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      border: "border-emerald-100",
      badge:
        cardSummary?.industrial_growth_pct != null &&
        cardSummary.industrial_growth_pct >= 0
          ? "bg-emerald-100 text-emerald-600"
          : "bg-red-100 text-red-500",
    },
    {
      title: "IT",
      value: cardSummary
        ? `$${Number(cardSummary.it_current || 0).toLocaleString()}`
        : "Loading...",

      sub: cardSummary?.it_growth_pct == null ? "" : "",

      change:
        cardSummary?.it_growth_pct == null
          ? "No data"
          : `${cardSummary.it_growth_pct > 0 ? "+" : ""}${cardSummary.it_growth_pct}%`,

      positive:
        cardSummary?.it_growth_pct != null && cardSummary.it_growth_pct >= 0,

      icon: Monitor,
      bg: "bg-violet-50",
      iconColor: "text-violet-500",
      border: "border-violet-100",

      badge:
        cardSummary?.it_growth_pct == null
          ? "bg-slate-200 text-slate-500"
          : cardSummary.it_growth_pct >= 0
            ? "bg-violet-100 text-violet-600"
            : "bg-red-100 text-red-500",
    },
    {
      title: "Total",
      value: cardSummary
        ? `$${(
            Number(cardSummary.building_current) +
            Number(cardSummary.industrial_current) +
            Number(cardSummary.it_current)
          ).toLocaleString()}`
        : "...",

      sub: "",

      change:
        totalGrowthPct != null
          ? `${totalGrowthPct > 0 ? "+" : ""}${totalGrowthPct.toFixed(1)}%`
          : "—",

      positive: totalGrowthPct != null && totalGrowthPct >= 0,

      icon: LayoutDashboard,
      bg: "bg-orange-50",
      iconColor: "text-orange-500",
      border: "border-orange-100",
    },
  ];

  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => b.project_id - a.project_id).slice(0, 5),
    [projects],
  );

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) => {
        if (!p) return false;
        const matchesSearch =
          p.project_name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
          p.project_id?.toString().includes(searchTerm);
        return searchTerm?.trim() !== "" ? matchesSearch : p.p_team === filter;
      }),
    [projects, searchTerm, filter],
  );

  if (loading)
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-500 font-bold tracking-tight">
          Syncing DDEV Analytics...
        </p>
      </div>
    );

  return (
    <div className="p-6 lg:p-12">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Finance Analytics
          </h1>
          {searchTerm && (
            <p className="text-blue-600 font-bold text-sm mt-2 flex items-center gap-2">
              <Search size={14} />
              Result for: "{searchTerm}"
            </p>
          )}
        </div>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* ✅ 4 Summary Cards — powered by live API */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {liveSummaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-white p-6 rounded-[2rem] shadow-sm border ${card.border} flex flex-col gap-4 hover:shadow-md transition-shadow duration-200`}
            >
              {/* Top row: icon + title on left, badge on right */}
              <div className="flex items-center justify-between">
                {/* Icon + Title */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-11 h-11 ${card.bg} rounded-2xl flex items-center justify-center`}
                  >
                    <Icon size={20} className={card.iconColor} />
                  </div>
                  <p className="text-[13px] font-black text-slate-700 uppercase tracking-wide">
                    {card.title}
                  </p>
                </div>

                {/* Badge + vs Last Month */}
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                      card.positive
                        ? "bg-green-400 text-white-600"
                        : "bg-red-400 text-white-700"
                    }`}
                  >
                    {card.positive ? (
                      <TrendingUp size={13} strokeWidth={2.5} />
                    ) : (
                      <TrendingDown size={13} strokeWidth={2.5} />
                    )}
                    <span className="text-[10px] font-black uppercase tracking-wider">
                      {card.change}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 tracking-wide">
                    vs Last Month
                  </span>
                </div>
              </div>

              {/* Value */}
              <div className="flex flex-col gap-1">
                <p className="text-3xl font-black text-slate-800 leading-none">
                  {card.value}
                </p>
                <p className="text-[11px] font-bold text-slate-400">
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Top Charts */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
        {/* Box 1: Total Sales Monthly */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
            <BarChart3 size={16} />
            Total Sales Monthly
          </h3>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4"></p>
          <ResponsiveContainer width="100%" height="82%">
            <ComposedChart
              data={totalSalesMonthlyData}
              margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="month"
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontWeight: 700 }}
              />
              <YAxis
                fontSize={10}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fill: "#94a3b8", fontWeight: 700 }}
                label={{
                  value: "AUD",
                  angle: -90,
                  position: "insideLeft",
                  style: {
                    textAnchor: "middle",
                    fill: "#94a3b8",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                  },
                }}
              />
              <Tooltip
                formatter={(value, name) => [
                  `$${value.toLocaleString()} AUD`,
                  name === "aud" ? "Spend" : "Trend",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar
                dataKey="aud"
                fill="#8884d8"
                radius={[8, 8, 0, 0]}
                barSize={28}
              />
              <Line
                type="monotone"
                dataKey="trend"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#f97316", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Box 2: Team Sales Ratio */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
            <Loader2 size={16} />
            Team Sales Ratio - Last 3 Months
          </h3>
          <div className="flex items-center justify-around h-[calc(100%-5rem)]">
            {teamPercentage.length > 0 ? (
              teamPercentage.slice(-3).map((monthData, index) => {
                const monthName = new Date(
                  monthData.service_month + "-01",
                ).toLocaleString("en-US", { month: "short" });
                const pieData = [
                  {
                    name: "Building",
                    value: monthData.building_percentage,
                    amount: monthData.building,
                    color: "#3b82f6",
                  },
                  {
                    name: "Industrial",
                    value: monthData.industrial_percentage,
                    amount: monthData.industrial,
                    color: "#10b981",
                  },
                  {
                    name: "IT",
                    value: monthData.it_percentage,
                    amount: monthData.it,
                    color: "#8b5cf6",
                  },
                ].filter((item) => item.value > 0);

                return (
                  <React.Fragment key={monthData.service_month}>
                    {index > 0 && <div className="w-px h-24 bg-slate-100" />}
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <PieChart width={110} height={110}>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Pie
                          data={pieData}
                          dataKey="value"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={50}
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={`cell-${i}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                        {monthName}
                      </p>
                    </div>
                  </React.Fragment>
                );
              })
            ) : (
              <p className="text-slate-400">Loading team data...</p>
            )}
          </div>
        </div>
      </section>

      {/* Quick-Lists */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Sales by Team - Now with real data */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" /> Sales by Team
            </h3>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
              {teamTotals.length > 0
                ? `${teamTotals.length} Months`
                : "Loading..."}
            </span>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">
              Monthly Breakdown
            </p>
            <MixBarChart data={teamTotals} />
          </div>
        </div>

        {/* Sales By Area */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} className="text-slate-400" /> Sales By
              Area
            </h3>
            {/* <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
              Not Started
            </span> */}
          </div>
          <div className="flex gap-2 mb-6 p-1 bg-slate-50 rounded-2xl">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${activeTab === tab ? "text-white shadow-md" : "text-slate-400 hover:text-slate-600"}`}
                style={
                  activeTab === tab ? { backgroundColor: TAB_COLORS[tab] } : {}
                }
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === "AUS" ? (
            stateLoading ? (
              <div className="flex items-center justify-center h-[260px]">
                <Loader2 className="animate-spin text-slate-300" size={28} />
              </div>
            ) : stateChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[260px]">
                <p className="text-slate-400 text-sm font-bold">
                  No state data found
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={stateChartData}
                  layout="vertical"
                  margin={{ top: 0, right: 80, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    type="number"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fill: "#94a3b8", fontWeight: 700 }}
                  />
                  <YAxis
                    dataKey="state"
                    type="category"
                    fontSize={11}
                    axisLine={false}
                    tickLine={false}
                    width={75}
                    tick={{ fill: "#64748b", fontWeight: 800 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      `$${Number(value).toLocaleString()} AUD`,
                      "Sales",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill={TAB_COLORS["AUS"]}
                    radius={[0, 8, 8, 0]}
                    barSize={28}
                    label={{
                      position: "right",
                      fontSize: 10,
                      fontWeight: 700,
                      fill: "#94a3b8",
                      formatter: (v) => `$${(v / 1000).toFixed(1)}k`,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-[260px] gap-3">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                <BarChart3 size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-black text-slate-300 uppercase tracking-widest">
                Coming Soon
              </p>
              <p className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">
                {activeTab} data not yet available
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Inflation / Spline Overview */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
          <BarChart3 size={16} /> Yearly Sales Performace
        </h3>
        <div className="w-full h-[350px]">
          <InflationSplineChart data={yearlyTotals} />
        </div>
      </div>
    </div>
  );
}
