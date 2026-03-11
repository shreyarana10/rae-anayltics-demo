import React, { useState, useMemo, useEffect } from "react";
import SearchBar from "./components/SearchBar";
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
  ResponsiveContainer,
} from "recharts";
import {
  Loader2,
  Search,
  BarChart3,
  Building2,
  Factory,
  Monitor,
  AlertTriangle,
  Briefcase,
  MapPin,
} from "lucide-react";

// ============= TEAM TABS =============
const TEAM_TABS = [
  { key: "building", label: "Building", icon: Building2, color: "#3b82f6" },
  { key: "industrial", label: "Industrial", icon: Factory, color: "#10b981" },
  { key: "it", label: "IT", icon: Monitor, color: "#8b5cf6" },
  // { key: "accounts", label: "Accounts", icon: Briefcase, color: "#f59e0b" },
];

// ============= AREA (STATE) TABS =============
const AREA_TABS = [
  {
    key: "penq",
    label: "Project Enquiries",
    endpoint: "state-penq",
    color: "#8b5cf6",
  },
  {
    key: "qs",
    label: "Sent Quotations",
    endpoint: "state-qs",
    color: "#3b82f6",
  },
  {
    key: "cq",
    label: "Cancelled Quotations",
    endpoint: "state-cq",
    color: "#ef4444",
  },
  {
    key: "aq",
    label: "Accepted Quotations",
    endpoint: "state-aq",
    color: "#10b981",
  },
];

// ============= DUMMY DATA (fallback) =============
const DUMMY_PROJECTS = [
  {
    project_id: 1001,
    project_name: "Sydney Harbour Bridge Renovation",
    p_team: "building",
    status: "in_progress",
    location: "Sydney, NSW",
    start_date: "2024-01-15",
    end_date: "2024-12-20",
    budget: 2500000,
  },
  {
    project_id: 1002,
    project_name: "Melbourne Industrial Park",
    p_team: "industrial",
    status: "planning",
    location: "Melbourne, VIC",
    start_date: "2024-03-01",
    end_date: "2025-06-30",
    budget: 5800000,
  },
  {
    project_id: 1003,
    project_name: "Brisbane Data Center",
    p_team: "it",
    status: "completed",
    location: "Brisbane, QLD",
    start_date: "2023-08-10",
    end_date: "2024-02-28",
    budget: 4200000,
  },
  {
    project_id: 1004,
    project_name: "Perth Commercial Tower",
    p_team: "building",
    status: "in_progress",
    location: "Perth, WA",
    start_date: "2024-02-20",
    end_date: "2025-04-15",
    budget: 8900000,
  },
  {
    project_id: 1005,
    project_name: "Adelaide Manufacturing Plant",
    p_team: "industrial",
    status: "on_hold",
    location: "Adelaide, SA",
    start_date: "2023-11-05",
    end_date: "2024-09-30",
    budget: 3100000,
  },
  {
    project_id: 1006,
    project_name: "Canberra Government IT Hub",
    p_team: "it",
    status: "planning",
    location: "Canberra, ACT",
    start_date: "2024-05-01",
    end_date: "2024-12-15",
    budget: 1950000,
  },
  {
    project_id: 1007,
    project_name: "Gold Coast Resort Complex",
    p_team: "building",
    status: "completed",
    location: "Gold Coast, QLD",
    start_date: "2023-06-15",
    end_date: "2024-01-30",
    budget: 7350000,
  },
  {
    project_id: 1008,
    project_name: "Newcastle Port Upgrade",
    p_team: "industrial",
    status: "in_progress",
    location: "Newcastle, NSW",
    start_date: "2024-01-10",
    end_date: "2024-11-20",
    budget: 4670000,
  },
];

// ============= CONSTANTS =============
const PIPELINE_COLORS = {
  "Project Enquiries": "#94a3b8",
  "Quotations Sent": "#3b82f6",
  "Cancelled Quotations": "#ef4444",
  "Accepted Quotations": "#10b981",
};

// Labels for the 4 pie sections
const PIE_SECTION_LABELS = [
  { key: "penq", label: "Project Enquiries", short: "PENQ", color: "#94a3b8" },
  { key: "qs", label: "Quotations Sent", short: "QS", color: "#3b82f6" },
  { key: "cq", label: "Cancelled Quotes", short: "CQ", color: "#ef4444" },
  { key: "aq", label: "Accepted Quotes", short: "AQ", color: "#10b981" },
];

// Hunter / Gather colours — consistent across all 4 pies
const HUNTER_COLOR = "#3b82f6";
const GATHER_COLOR = "#10b981";

// ============= HELPERS =============
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const STATE_DISPLAY = {
  nsw: "NSW",
  qld: "QLD",
  victoria: "VICTORIA",
  vic: "VIC",
  wa: "WA",
  sa: "SA",
  tas: "TAS",
  act: "ACT",
  nt: "NT",
};

const normaliseState = (raw) => {
  if (!raw) return "Unassigned";
  const key = raw.trim().toLowerCase();
  if (!key || key === "n/a" || key === "null") return "Unassigned";
  return STATE_DISPLAY[key] ?? raw.trim();
};

const RADIAN = Math.PI / 180;

// Shows AUD amount inside each slice — no percentages
const renderAmountLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  value,
  percent,
}) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null)
    return null;
  if ((percent ?? 0) < 0.08) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = Number(cx) + radius * Math.cos(-midAngle * RADIAN);
  const y = Number(cy) + radius * Math.sin(-midAngle * RADIAN);
  const fmt = (v) => {
    if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
    return `$${v}`;
  };
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={10}
      fontWeight="bold"
    >
      {fmt(value)}
    </text>
  );
};

// ============= PIE TOOLTIP =============
function PieTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
        <p className="text-sm font-bold text-slate-700 mb-1">{d.name}</p>
        <p className="text-xs text-slate-500">
          Amount:{" "}
          <span className="font-bold text-slate-700">
            {formatCurrency(d.value)}
          </span>
        </p>
      </div>
    );
  }
  return null;
}

// ============= SINGLE PIE CARD =============
function SalesRatioPieCard({
  label,
  short,
  color,
  hunterAmount,
  gatherAmount,
  loading,
}) {
  const pieData = [
    { name: "Hunter", value: Number(hunterAmount) || 0, color: HUNTER_COLOR },
    { name: "Gather", value: Number(gatherAmount) || 0, color: GATHER_COLOR },
  ].filter((d) => d.value > 0);

  const total = (Number(hunterAmount) || 0) + (Number(gatherAmount) || 0);

  return (
    <div className="flex flex-col items-center gap-2 flex-1 min-w-[160px]">
      <span
        className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-1"
        style={{ backgroundColor: `${color}18`, color }}
      >
        {short}
      </span>

      {loading ? (
        <div
          className="flex items-center justify-center"
          style={{ width: 140, height: 140 }}
        >
          <Loader2 className="animate-spin text-slate-300" size={24} />
        </div>
      ) : total === 0 ? (
        <div
          className="flex items-center justify-center"
          style={{ width: 140, height: 140 }}
        >
          <p className="text-xs font-bold text-slate-300 text-center">
            No data
          </p>
        </div>
      ) : (
        <PieChart width={140} height={140}>
          <Tooltip content={<PieTooltip />} />
          <Pie
            data={pieData}
            dataKey="value"
            labelLine={false}
            label={renderAmountLabel}
            outerRadius={60}
            innerRadius={22}
          >
            {pieData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      )}
    </div>
  );
}

// ============= SALES BAR CHART =============
const BAR_SERIES = [
  { key: "penq", label: "PENQ", color: "#8b5cf6" },
  { key: "qs", label: "QS", color: "#22c55e" },
  { key: "aq", label: "AQ", color: "#f59e0b" },
  { key: "cq", label: "CQ", color: "#f97316" },
];

function SalesBarChart({ data = [], loading = false }) {
  const [focusedKey, setFocusedKey] = useState(null);
  const [locked, setLocked] = useState(false);

  const onMouseEnter = (p) => {
    if (!locked) setFocusedKey(String(p.dataKey));
  };
  const onMouseOut = () => {
    if (!locked) setFocusedKey(null);
  };
  const onClick = (p) => {
    if (focusedKey === String(p.dataKey)) {
      setLocked(!locked);
      if (locked) setFocusedKey(null);
    } else {
      setFocusedKey(String(p.dataKey));
      setLocked(true);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[220px]">
        <Loader2 className="animate-spin text-slate-300" size={28} />
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-[220px]">
        <p className="text-slate-300 text-sm font-bold">No data available</p>
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
        barCategoryGap={12}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="name"
          fontSize={10}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8" }}
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
          formatter={(value, name) => {
            const s = BAR_SERIES.find((b) => b.key === name);
            return [
              `$${Number(value).toLocaleString("en-AU")}`,
              s?.label || name,
            ];
          }}
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            fontSize: "11px",
          }}
        />
        <Legend
          formatter={(value) =>
            BAR_SERIES.find((b) => b.key === value)?.label || value
          }
          onMouseEnter={onMouseEnter}
          onMouseOut={onMouseOut}
          onClick={onClick}
          wrapperStyle={{ cursor: "pointer", fontSize: "11px" }}
        />
        {BAR_SERIES.map(({ key, color }) => (
          <Bar
            key={key}
            dataKey={key}
            fill={focusedKey == null || focusedKey === key ? color : "#e5e7eb"}
            barSize={10}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============= STATE BAR CHART =============
function StateBarChart({ data = [], color = "#3b82f6", loading = false }) {
  if (loading)
    return (
      <div className="flex items-center justify-center h-[280px]">
        <Loader2 className="animate-spin text-slate-300" size={28} />
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="flex flex-col items-center justify-center h-[280px] gap-3">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
          <MapPin size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-black text-slate-300 uppercase tracking-widest">
          No data found
        </p>
      </div>
    );

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 90, left: 10, bottom: 0 }}
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
          width={80}
          tick={{ fill: "#64748b", fontWeight: 800 }}
        />
        <Tooltip
          formatter={(value) => [
            `$${Number(value).toLocaleString()} AUD`,
            "Total Amount",
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
          fill={color}
          radius={[0, 8, 8, 0]}
          barSize={28}
          label={{
            position: "right",
            fontSize: 10,
            fontWeight: 700,
            fill: "#94a3b8",
            formatter: (v) =>
              v >= 1_000_000
                ? `$${(v / 1_000_000).toFixed(1)}M`
                : `$${(v / 1000).toFixed(1)}k`,
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ============= MAIN COMPONENT =============
export default function Sales({ filter, searchTerm, setSearchTerm }) {
  const [projects] = useState(DUMMY_PROJECTS);
  const [activeTeamTab, setActiveTeamTab] = useState("building");
  const [activeAreaTab, setActiveAreaTab] = useState("penq");

  // ---- State breakdown data per area tab ----
  const [stateData, setStateData] = useState({
    penq: [],
    qs: [],
    cq: [],
    aq: [],
  });
  const [stateLoading, setStateLoading] = useState(false);

  // ---- Bar chart data fetched from API ----
  const [barRawData, setBarRawData] = useState({
    penq: [],
    qs: [],
    aq: [],
    cq: [],
  });
  const [barLoading, setBarLoading] = useState(false);

  // ---- Pie data fetched from API ----
  const [pieData, setPieData] = useState({
    penq: null,
    qs: null,
    cq: null,
    aq: null,
  });
  const [pieLoading, setPieLoading] = useState(false);
  const [pieError, setPieError] = useState(null);

  // Fetch all 4 pie endpoints
  useEffect(() => {
    const fetchPieData = async () => {
      setPieLoading(true);
      setPieError(null);
      try {
        const BASE = "http://localhost:5000";
        const [penqRes, qsRes, cqRes, aqRes] = await Promise.all([
          fetch(
            `${BASE}/api/sales/potential-project-pie?team=${activeTeamTab}`,
          ),
          fetch(`${BASE}/api/sales/potential-sent-pie?team=${activeTeamTab}`),
          fetch(
            `${BASE}/api/sales/cancelled-quotation-pie?team=${activeTeamTab}`,
          ),
          fetch(
            `${BASE}/api/sales/accepted-quotation-pie?team=${activeTeamTab}`,
          ),
        ]);

        if (!penqRes.ok || !qsRes.ok || !cqRes.ok || !aqRes.ok)
          throw new Error("One or more API requests failed");

        const [penqData, qsData, cqData, aqData] = await Promise.all([
          penqRes.json(),
          qsRes.json(),
          cqRes.json(),
          aqRes.json(),
        ]);

        const extract = (rows) => {
          const row = Array.isArray(rows) ? rows[0] : rows;
          return {
            hunter_amount: Number(row?.hunter_amount) || 0,
            gather_amount: Number(row?.gather_amount) || 0,
            total_amount: Number(row?.total_amount) || 0,
            month: row?.month ?? null,
          };
        };

        setPieData({
          penq: extract(penqData),
          qs: extract(qsData),
          cq: extract(cqData),
          aq: extract(aqData),
        });
      } catch (err) {
        console.error("Pie data fetch error:", err);
        setPieError("Failed to load data from server.");
      } finally {
        setPieLoading(false);
      }
    };

    fetchPieData();
  }, [activeTeamTab]);

  // Fetch bar chart data
  useEffect(() => {
    const fetchBarData = async () => {
      setBarLoading(true);
      try {
        const BASE = "http://localhost:5000";
        const [penqRes, qsRes, aqRes, cqRes] = await Promise.all([
          fetch(`${BASE}/api/sales/team-penq?team=${activeTeamTab}`),
          fetch(`${BASE}/api/sales/team-qs?team=${activeTeamTab}`),
          fetch(`${BASE}/api/sales/team-aq?team=${activeTeamTab}`),
          fetch(`${BASE}/api/sales/team-cq?team=${activeTeamTab}`),
        ]);

        if (!penqRes.ok || !qsRes.ok || !aqRes.ok || !cqRes.ok)
          throw new Error("Bar chart API request failed");

        const [penqRows, qsRows, aqRows, cqRows] = await Promise.all([
          penqRes.json(),
          qsRes.json(),
          aqRes.json(),
          cqRes.json(),
        ]);

        setBarRawData({ penq: penqRows, qs: qsRows, aq: aqRows, cq: cqRows });
      } catch (err) {
        console.error("Bar chart fetch error:", err);
      } finally {
        setBarLoading(false);
      }
    };

    fetchBarData();
  }, [activeTeamTab]);

  // Fetch ALL 4 state breakdown endpoints whenever team changes
  useEffect(() => {
    const fetchAllStateData = async () => {
      setStateLoading(true);
      try {
        const BASE = "http://localhost:5000";
        const [penqRes, qsRes, cqRes, aqRes] = await Promise.all([
          fetch(`${BASE}/api/sales/state-penq?team=${activeTeamTab}`),
          fetch(`${BASE}/api/sales/state-qs?team=${activeTeamTab}`),
          fetch(`${BASE}/api/sales/state-cq?team=${activeTeamTab}`),
          fetch(`${BASE}/api/sales/state-aq?team=${activeTeamTab}`),
        ]);

        const parseRows = async (res) => {
          if (!res.ok) return [];
          const rows = await res.json();
          // Aggregate by state (sum total_amount across months)
          const map = {};
          (Array.isArray(rows) ? rows : []).forEach((row) => {
            const s = normaliseState(row.state);
            map[s] = (map[s] || 0) + (Number(row.total_amount) || 0);
          });
          return Object.entries(map)
            .map(([state, amount]) => ({ state, amount }))
            .sort((a, b) => b.amount - a.amount);
        };

        const [penqData, qsData, cqData, aqData] = await Promise.all([
          parseRows(penqRes),
          parseRows(qsRes),
          parseRows(cqRes),
          parseRows(aqRes),
        ]);

        setStateData({ penq: penqData, qs: qsData, cq: cqData, aq: aqData });
      } catch (err) {
        console.error("State data fetch error:", err);
        setStateData({ penq: [], qs: [], cq: [], aq: [] });
      } finally {
        setStateLoading(false);
      }
    };

    fetchAllStateData();
  }, [activeTeamTab]);

  // Search sync
  React.useEffect(() => {
    const savedSearch = localStorage.getItem("csarae_search");
    if (savedSearch && setSearchTerm) setSearchTerm(savedSearch);
  }, [setSearchTerm]);

  React.useEffect(() => {
    if (searchTerm) localStorage.setItem("csarae_search", searchTerm);
  }, [searchTerm]);

  const activeTeamColor =
    TEAM_TABS.find((t) => t.key === activeTeamTab)?.color || "#3b82f6";

  const activeAreaTabConfig = AREA_TABS.find((t) => t.key === activeAreaTab);

  const pieMonth = pieData.penq?.month
    ? new Date(pieData.penq.month + "-01").toLocaleString("en-AU", {
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleString("en-AU", { month: "long", year: "numeric" });

  // Merge bar chart rows by month
  const buildBarData = useMemo(() => {
    const amtKey = (field) => {
      const monthMap = {};
      const addRows = (rows, seriesKey) => {
        (rows || []).forEach((row) => {
          const m = row.month;
          if (!m) return;
          if (!monthMap[m]) monthMap[m] = { month: m };
          monthMap[m][seriesKey] = Number(row[field]) || 0;
        });
      };
      addRows(barRawData.penq, "penq");
      addRows(barRawData.qs, "qs");
      addRows(barRawData.aq, "aq");
      addRows(barRawData.cq, "cq");
      return Object.values(monthMap)
        .sort((a, b) => a.month.localeCompare(b.month))
        .map((row) => ({
          name: new Date(row.month + "-01").toLocaleString("en-AU", {
            month: "short",
            year: "2-digit",
          }),
          penq: row.penq || 0,
          qs: row.qs || 0,
          aq: row.aq || 0,
          cq: row.cq || 0,
        }));
    };
    return amtKey;
  }, [barRawData]);

  const hunterBarData = useMemo(
    () => buildBarData("hunter_amount"),
    [buildBarData],
  );
  const gatherBarData = useMemo(
    () => buildBarData("gather_amount"),
    [buildBarData],
  );
  const totalBarData = useMemo(
    () => buildBarData("total_amount"),
    [buildBarData],
  );

  return (
    <div className="p-6 lg:p-12">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            Sales Analytics
            {/* {TEAM_TABS.find((t) => t.key === activeTeamTab)?.label} */}
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

      {/* Team Tabs */}
      <div className="flex gap-2 mb-10 flex-wrap">
        {TEAM_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTeamTab(tab.key)}
              className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-wide transition-all flex items-center gap-2
                ${activeTeamTab === tab.key ? "text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              style={
                activeTeamTab === tab.key ? { backgroundColor: tab.color } : {}
              }
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===== PIE SECTION ===== */}
      <section className="mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={16} style={{ color: activeTeamColor }} />
              Team Sales Ratio — Hunter vs Gather
            </h3>
            <span
              className="text-[10px] font-bold px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${activeTeamColor}18`,
                color: activeTeamColor,
              }}
            >
              {pieMonth}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4 pl-1">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: HUNTER_COLOR }}
              />
              Hunter
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: GATHER_COLOR }}
              />
              Gather
            </span>
          </div>

          {pieError && (
            <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-bold flex items-center gap-2">
              <AlertTriangle size={13} />
              {pieError}
            </div>
          )}

          <div className="flex items-start justify-around gap-4 flex-wrap pt-2">
            {PIE_SECTION_LABELS.map((section, index) => (
              <React.Fragment key={section.key}>
                {index > 0 && (
                  <div className="hidden lg:block w-px self-stretch bg-slate-100 my-4" />
                )}
                <SalesRatioPieCard
                  label={section.label}
                  short={section.short}
                  color={section.color}
                  hunterAmount={pieData[section.key]?.hunter_amount ?? 0}
                  gatherAmount={pieData[section.key]?.gather_amount ?? 0}
                  loading={pieLoading}
                />
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bar: Hunter ── */}
      <section className="mb-12">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={16} style={{ color: activeTeamColor }} /> Sales
              by Team — Hunter
            </h3>
            <div className="flex items-center gap-2">
              {BAR_SERIES.map((s) => (
                <span
                  key={s.key}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400"
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <SalesBarChart data={hunterBarData} loading={barLoading} />
          </div>
        </div>
      </section>

      {/* ── Bar: Gather ── */}
      <section className="mb-12">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={16} style={{ color: activeTeamColor }} /> Sales
              by Team — Gather
            </h3>
            <div className="flex items-center gap-2">
              {BAR_SERIES.map((s) => (
                <span
                  key={s.key}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400"
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <SalesBarChart data={gatherBarData} loading={barLoading} />
          </div>
        </div>
      </section>

      {/* ── Bar: Total ── */}
      <section className="mb-12">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 size={16} style={{ color: activeTeamColor }} /> Sales
              by Team — Total
            </h3>
            <div className="flex items-center gap-2">
              {BAR_SERIES.map((s) => (
                <span
                  key={s.key}
                  className="flex items-center gap-1 text-[10px] font-bold text-slate-400"
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.label}
                </span>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-5">
            <SalesBarChart data={totalBarData} loading={barLoading} />
          </div>
        </div>
      </section>

      {/* ── Sales by Area (State Breakdown) ── */}
      <section className="mb-12">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          {/* Card header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} className="text-slate-400" />
              Sales By State
            </h3>
            {/* Active tab colour badge */}
            <span
              className="text-[10px] font-bold px-3 py-1 rounded-full"
              style={{
                backgroundColor: `${activeAreaTabConfig?.color}18`,
                color: activeAreaTabConfig?.color,
              }}
            >
              {pieMonth}
            </span>
          </div>

          {/* Area Tabs — pipeline categories */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-50 rounded-2xl flex-wrap">
            {AREA_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveAreaTab(tab.key)}
                className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                  activeAreaTab === tab.key
                    ? "text-white shadow-md"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                style={
                  activeAreaTab === tab.key
                    ? { backgroundColor: tab.color }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart for the active tab */}
          <StateBarChart
            data={stateData[activeAreaTab]}
            color={activeAreaTabConfig?.color ?? "#3b82f6"}
            loading={stateLoading}
          />
        </div>
      </section>
    </div>
  );
}
