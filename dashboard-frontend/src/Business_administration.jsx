import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import ProjectCard from "./components/ProjectCard";
import SearchBar from "./components/SearchBar";
import DataTable from "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import {
  Loader2,
  Search,
  BarChart3,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import EmployeeProjectModal from "./components/EmployeeProjectModal";
export default function Business({ filter, searchTerm, setSearchTerm }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("project");
  const [greenProjects, setGreenProjects] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [joinedPeople, setJoinedPeople] = useState([]);
  const [closedProjects, setClosedProjects] = useState([]);
  const [clientProjects, setClientProjects] = useState([]);
  const [projectsPerMonth, setProjectsPerMonth] = useState([]);
  const [salesPerMonth, setSalesPerMonth] = useState([]);
  const [employeeEvolution, setEmployeeEvolution] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [projectSubproject, setProjectSubproject] = useState([]);
  const [employeeProjects, setEmployeeProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // ── Fetch project-subproject data ──
  // useEffect(() => {
  //   axios
  //     .get("http://localhost:5000/api/accounts/project-subproject-data")
  //     .then((res) => {
  //       setProjectSubproject(Array.isArray(res.data) ? res.data : []);
  //     })
  //     .catch((err) => console.error("Projzect subproject error:", err));
  // }, []);

  // ── Fetch employee evolution ──
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/accounts/employee-evolution")
      .then((res) => {
        console.log("TOTAL ROWS:", res.data.length);
        console.log("SAMPLE ROW:", res.data[0]);
        setEmployeeEvolution(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Employee evolution error:", err));
  }, []);

  // ── Initialize DataTable when employee tab is active ──
  useEffect(() => {
    if (activeTab === "employee" && employeeEvolution.length > 0) {
      // Destroy existing table if any
      if (DataTable.isDataTable("#myTable")) {
        new DataTable("#myTable").destroy();
      }

      const table = new DataTable("#myTable", {
        destroy: true,
        pageLength: 50,
        responsive: true,
        order: [[0, "asc"]],
        // Use DataTables built-in column classes
        columnDefs: [{ targets: [0, 1, 2, 3], className: "dt-center" }],
      });

      return () => {
        if (table) table.destroy();
      };
    }
  }, [activeTab, employeeEvolution]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/accounts/sales-per-month")
      .then((res) => {
        setSalesPerMonth(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Sales per month error:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/accounts/project-per-month")
      .then((res) => {
        setProjectsPerMonth(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Projects per month error:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/accounts/client-project")
      .then((res) => {
        setClientProjects(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Client projects error:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/accounts/purple-closed")
      .then((res) => {
        setClosedProjects(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Closed projects error:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/accounts/joining-date-people")
      .then((res) => {
        setJoinedPeople(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Join projects error:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/accounts/monthly-total")
      .then((res) => {
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const formatted = (Array.isArray(res.data) ? res.data : []).map(
          (row, i, arr) => {
            const [year, month] = row.service_month.split("-");
            const label = `${monthNames[parseInt(month) - 1]} ${String(year).slice(2)}`;
            const aud = parseFloat(row.sumTotal) || 0;
            const window = arr.slice(Math.max(0, i - 2), i + 1);
            const trend = Math.round(
              window.reduce((s, w) => s + (parseFloat(w.sumTotal) || 0), 0) /
                window.length,
            );
            return { month: label, aud, trend };
          },
        );
        setMonthlyTotals(formatted);
      })
      .catch((err) => console.error("Monthly totals error:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/accounts/urgency-openproject")
      .then((res) => {
        setGreenProjects(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Green urgency projects error:", err));
  }, []);

  // ── Projects per Client ──
  const projectsPerClientData = useMemo(() => {
    if (!clientProjects.length) return [];
    const countMap = {};
    clientProjects.forEach((row) => {
      const name = row.customer_name || "Unknown";
      countMap[name] =
        (countMap[name] || 0) + (parseInt(row.total_projects) || 0);
    });
    return Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .filter(({ count }) => count > 3)
      .sort((a, b) => a.count - b.count);
  }, [clientProjects]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/detailed-projects-accounts")
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

  const handleEmployeeClick = useCallback(async (emp) => {
    setSelectedEmployee(emp);
    setLoadingProjects(true); // show spinner

    try {
      const res = await axios.get(
        `http://localhost:5000/api/accounts/employee-projects/${emp.user_id}`,
      );
      setEmployeeProjects(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch employee projects:", err);
      setEmployeeProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  }, []);
  // ── Shared helper: build last 24 months ──
  const last24Months = useMemo(() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const now = new Date();
    return Array.from({ length: 24 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (23 - i), 1);
      return {
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
      };
    });
  }, []);

  const last6MonthsFromJuly2025 = useMemo(() => {
    const start = new Date(2025, 6, 1);
    const now = new Date();
    return last24Months.filter((m) => {
      const [year, month] = m.key.split("-").map(Number);
      const d = new Date(year, month - 1, 1);
      return d >= start && d <= now;
    });
  }, [last24Months]);

  const stats = useMemo(() => {
    if (!projects.length) return null;
    const filteredForStats = projects.filter((p) => {
      if (!p) return false;
      const matchesSearch =
        p.project_name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        p.project_id?.toString().includes(searchTerm);
      return searchTerm?.trim() !== "" ? matchesSearch : p.p_team === filter;
    });
    const statusData = [
      {
        name: "Running",
        value: projects.filter((p) => p.urgency === "green").length,
        color: "#10b981",
      },
      {
        name: "Closed",
        value: projects.filter((p) => p.urgency === "purple").length,
        color: "#8b5cf6",
      },
      {
        name: "Delayed/Urgent",
        value: projects.filter((p) => ["red", "orange"].includes(p.urgency))
          .length,
        color: "#ef4444",
      },
      {
        name: "Hold",
        value: projects.filter((p) => p.urgency === "yellow").length,
        color: "#f59e0b",
      },
    ];
    const workloadData = filteredForStats
      .map((p) => ({
        fullName: p.project_name,
        name: p.project_name,
        hours:
          p.contributors?.reduce(
            (sum, c) => sum + parseFloat(c.total_hours || 0),
            0,
          ) || 0,
      }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
    const concentrationData = projects
      .map((p) => ({
        fullName: p.project_name,
        name: p.project_name,
        staff: p.contributors?.length || 0,
      }))
      .sort((a, b) => b.staff - a.staff)
      .slice(0, 5);
    return { statusData, workloadData, concentrationData };
  }, [projects, filter, searchTerm]);

  const peopleVsOpenData = useMemo(() => {
    const joinMap = {};
    joinedPeople.forEach((row) => {
      joinMap[row.join_month] = parseInt(row.cumulative_joins) || 0;
    });
    const openMap = {};
    greenProjects.forEach((p) => {
      if (!p.start_date) return;
      const date = new Date(p.start_date);
      if (isNaN(date)) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      openMap[key] = (openMap[key] || 0) + 1;
    });
    return last6MonthsFromJuly2025.map((m) => ({
      month: m.month,
      people: joinMap[m.key] || 0,
      openProjects: openMap[m.key] || 0,
    }));
  }, [greenProjects, joinedPeople, last6MonthsFromJuly2025]);

  const peopleVsClosedData = useMemo(() => {
    const closedMap = {};
    closedProjects.forEach((row) => {
      closedMap[row.close_month] = parseInt(row.total_closed_projects) || 0;
    });
    const joinMap = {};
    joinedPeople.forEach((row) => {
      joinMap[row.join_month] = parseInt(row.cumulative_joins) || 0;
    });
    return last6MonthsFromJuly2025.map((m) => ({
      month: m.month,
      people: joinMap[m.key] || 0,
      closedProjects: closedMap[m.key] || 0,
    }));
  }, [closedProjects, joinedPeople, last6MonthsFromJuly2025]);

  const tinyBarData = useMemo(() => {
    if (!projects.length) return [];
    const monthMap = {};
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    projects.forEach((p) => {
      if (!p.start_date) return;
      const date = new Date(p.start_date);
      if (isNaN(date)) return;
      const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
      const label = `${monthNames[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
      if (!monthMap[key]) monthMap[key] = { key, month: label, aud: 0 };
      const spend =
        p.contributors?.reduce(
          (sum, c) => sum + parseFloat(c.total_hours || 0),
          0,
        ) || 0;
      monthMap[key].aud += spend * 150;
    });
    const sorted = Object.values(monthMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-12);
    return sorted.map((d, i, arr) => {
      const window = arr.slice(Math.max(0, i - 2), i + 1);
      const trend = Math.round(
        window.reduce((s, w) => s + w.aud, 0) / window.length,
      );
      return { ...d, trend };
    });
  }, [projects]);

  const companiesPerMonthData = useMemo(() => {
    const monthMap = {};
    projectsPerMonth.forEach((row) => {
      monthMap[row.project_month] = parseInt(row.total_projects) || 0;
    });
    const sorted = last24Months.map((m) => ({
      month: m.month,
      companies: monthMap[m.key] || 0,
    }));
    const vals = sorted.map((d) => d.companies);
    const n = vals.length;
    const sumX = vals.reduce((s, _, i) => s + i, 0);
    const sumY = vals.reduce((s, v) => s + v, 0);
    const sumXY = vals.reduce((s, v, i) => s + i * v, 0);
    const sumX2 = vals.reduce((s, _, i) => s + i * i, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
    const intercept = (sumY - slope * sumX) / n;
    return sorted.map((d, i) => ({
      ...d,
      trend: parseFloat((intercept + slope * i).toFixed(2)),
    }));
  }, [projectsPerMonth, last24Months]);

  const salesAndPeopleData = useMemo(() => {
    const salesMap = {};
    salesPerMonth.forEach((row) => {
      salesMap[row.invoice_month] = parseFloat(row.total_amount) || 0;
    });
    const joinMap = {};
    joinedPeople.forEach((row) => {
      joinMap[row.join_month] = parseInt(row.cumulative_joins) || 0;
    });
    let lastPeopleValue = 0;
    return last24Months.map((m) => {
      if (joinMap[m.key] !== undefined) {
        lastPeopleValue = joinMap[m.key];
      }
      return {
        month: m.month,
        sales: Math.round(salesMap[m.key] || 0),
        people: lastPeopleValue,
      };
    });
  }, [salesPerMonth, joinedPeople, last24Months]);

  const recentProjects = useMemo(
    () => [...projects].sort((a, b) => b.project_id - a.project_id).slice(0, 5),
    [projects],
  );

  const notStartedProjects = useMemo(
    () => projects.filter((p) => p.urgency === "white").slice(0, 5),
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

  const handleBarClick = useCallback((data) => {
    if (data?.fullName) setSearchTerm(data.fullName);
  }, []);

  const RotatedTick = ({ x, y, payload }) => (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#94a3b8"
        fontSize={9}
        fontWeight={700}
        transform="rotate(-45)"
      >
        {payload.value}
      </text>
    </g>
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
    <>
      <div className="p-6 lg:p-12">
        {/* Tab Bar */}
        <div className="flex gap-2 mb-10">
          {["project", "finance", "employee"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-black uppercase tracking-wide transition
              ${activeTab === tab ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            >
              {tab === "employee" ? "Employee Evolution" : tab}
            </button>
          ))}
        </div>

        {/* ── PROJECT TAB ── */}
        {activeTab === "project" && (
          <>
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
              {/* People vs Open Projects */}
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-black text-slate-400 uppercase flex items-center gap-2">
                    <TrendingUp size={16} /> People v/s Open Projects
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-4 h-[2px] bg-[#93c5fd] rounded"></span>
                      People
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-4 h-[2px] bg-[#10b981] rounded"></span>
                      Open Projects
                    </span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">
                  Jul 24 – Present
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart
                    data={peopleVsOpenData}
                    margin={{ top: 10, right: 50, left: 10, bottom: 80 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={<RotatedTick />}
                    />
                    <YAxis
                      yAxisId="left"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{ fill: "#94a3b8", fontWeight: 700 }}
                      label={{
                        value: "People",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fill: "#94a3b8",
                          fontSize: 10,
                          fontWeight: 800,
                        },
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{ fill: "#10b981", fontWeight: 700 }}
                      label={{
                        value: "Open",
                        angle: 90,
                        position: "insideRight",
                        style: {
                          textAnchor: "middle",
                          fill: "#10b981",
                          fontSize: 10,
                          fontWeight: 800,
                        },
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        name === "people" ? "People" : "Open Projects",
                      ]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="people"
                      stroke="#93c5fd"
                      strokeWidth={6}
                      dot={false}
                      activeDot={{ r: 5, fill: "#3b82f6" }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="openProjects"
                      stroke="#10b981"
                      strokeWidth={6}
                      dot={false}
                      activeDot={{ r: 5, fill: "#10b981" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* People vs Closed Projects */}
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-black text-slate-400 uppercase flex items-center gap-2">
                    <AlertTriangle size={16} /> People v/s Closed Projects
                  </h3>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-4 h-[2px] bg-[#93c5fd] rounded"></span>
                      People
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-4 h-[2px] bg-[#8b5cf6] rounded"></span>
                      Closed Projects
                    </span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">
                  Jul 24 – Present
                </p>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart
                    data={peopleVsClosedData}
                    margin={{ top: 10, right: 50, left: 10, bottom: 80 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={<RotatedTick />}
                    />
                    <YAxis
                      yAxisId="left"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{ fill: "#94a3b8", fontWeight: 700 }}
                      label={{
                        value: "People",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fill: "#94a3b8",
                          fontSize: 10,
                          fontWeight: 800,
                        },
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{ fill: "#8b5cf6", fontWeight: 700 }}
                      label={{
                        value: "Closed",
                        angle: 90,
                        position: "insideRight",
                        style: {
                          textAnchor: "middle",
                          fill: "#8b5cf6",
                          fontSize: 10,
                          fontWeight: 800,
                        },
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        value,
                        name === "people" ? "People" : "Closed Projects",
                      ]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="people"
                      stroke="#93c5fd"
                      strokeWidth={6}
                      dot={false}
                      activeDot={{ r: 5, fill: "#3b82f6" }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="closedProjects"
                      stroke="#8b5cf6"
                      strokeWidth={6}
                      dot={false}
                      activeDot={{ r: 5, fill: "#8b5cf6" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Projects per Client */}
            <section className="mb-8">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-black text-slate-400 uppercase flex items-center gap-2">
                    <BarChart3 size={16} /> Projects per Client
                  </h3>
                </div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">
                  All time
                </p>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={projectsPerClientData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 100 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      tick={<RotatedTick />}
                    />
                    <YAxis
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{ fill: "#94a3b8", fontWeight: 700 }}
                      label={{
                        value: "Num of project",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fill: "#94a3b8",
                          fontSize: 10,
                          fontWeight: 800,
                        },
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [value, "Projects"]}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                      }}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#2c6cd3"
                      radius={[6, 6, 0, 0]}
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* 3 chart row */}
            <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
                <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <TrendingUp size={16} /> Project Health
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={stats?.statusData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats?.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      iconType="circle"
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
                <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <BarChart3 size={16} /> Effort (Hours)
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={stats?.workloadData}
                    layout="vertical"
                    margin={{ left: 40, right: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      type="number"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      fontSize={9}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip cursor={{ fill: "#f8fafc" }} />
                    <Bar
                      dataKey="hours"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      onClick={handleBarClick}
                      className="cursor-pointer"
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
                <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
                  <AlertTriangle size={16} /> Staff Concentration
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={stats?.concentrationData}
                    layout="vertical"
                    margin={{ left: 40, right: 20 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      type="number"
                      fontSize={10}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      fontSize={9}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="staff"
                      fill="#f59e0b"
                      radius={[0, 4, 4, 0]}
                      onClick={handleBarClick}
                      className="cursor-pointer"
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Recently Created + Pending Start */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={16} className="text-blue-500" /> Recently
                    Created
                  </h3>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                    New Entries
                  </span>
                </div>
                <div className="space-y-4">
                  {recentProjects.map((p) => (
                    <div
                      key={p.project_id}
                      onClick={() => setSearchTerm(p.project_name)}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">
                          #{p.project_id}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">
                            {p.project_name}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                            {p.p_team}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-slate-400">
                        {p.start_date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={16} className="text-slate-400" />{" "}
                    Pending Start
                  </h3>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                    Not Started
                  </span>
                </div>
                <div className="space-y-4">
                  {notStartedProjects.length > 0 ? (
                    notStartedProjects.map((p) => (
                      <div
                        key={p.project_id}
                        onClick={() => setSearchTerm(p.project_name)}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-bold text-xs">
                            #{p.project_id}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">
                              {p.project_name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {p.p_team}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-slate-400">
                          {p.start_date}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="h-40 flex items-center justify-center text-slate-300 font-bold text-sm italic">
                      All projects are currently in progress.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Search + Project Cards */}
            <header className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                  Account Projects
                </h1>
                {searchTerm && (
                  <p className="text-blue-600 font-bold text-sm mt-2 flex items-center gap-2">
                    <Search size={14} /> Result for: "{searchTerm}"
                  </p>
                )}
              </div>
              <SearchBar
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.project_id} project={project} />
              ))}
            </div>
          </>
        )}

        {/* ── FINANCE TAB ── */}
        {activeTab === "finance" && (
          <div className="space-y-8">
            {/* Total Sales Monthly */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
              <h3 className="text-sm font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
                <BarChart3 size={16} /> Total Sales Monthly
              </h3>
              <ResponsiveContainer width="100%" height="82%">
                <ComposedChart
                  data={monthlyTotals.length ? monthlyTotals : tinyBarData}
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

            {/* Total Company vs Month */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-black text-slate-400 uppercase flex items-center gap-2">
                  <TrendingUp size={16} /> Total Company v/s Month
                </h3>
              </div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">
                Last 24 months
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart
                  data={companiesPerMonthData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 80 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tick={<RotatedTick />}
                  />
                  <YAxis
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#94a3b8", fontWeight: 700 }}
                    label={{
                      value: "projects",
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        textAnchor: "middle",
                        fill: "#94a3b8",
                        fontSize: 10,
                        fontWeight: 800,
                      },
                    }}
                  />
                  <Tooltip
                    formatter={(value) => [value, "Projects"]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="companies"
                    stroke="#93c5fd"
                    strokeWidth={6}
                    dot={false}
                    activeDot={{ r: 5, fill: "#3b82f6" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Sales vs People */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-black text-slate-400 uppercase flex items-center gap-2">
                  <BarChart3 size={16} /> Sales v/s People
                </h3>
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-4 h-[2px] bg-[#93c5fd] rounded"></span>
                    Sales (AUD)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-4 h-[2px] bg-[#f97316] rounded"></span>
                    People
                  </span>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">
                Last 24 months
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart
                  data={salesAndPeopleData}
                  margin={{ top: 10, right: 50, left: 10, bottom: 80 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tick={<RotatedTick />}
                  />
                  <YAxis
                    yAxisId="left"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                    }
                    tick={{ fill: "#94a3b8", fontWeight: 700 }}
                    label={{
                      value: "Sales",
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        textAnchor: "middle",
                        fill: "#94a3b8",
                        fontSize: 10,
                        fontWeight: 800,
                      },
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#f97316", fontWeight: 700 }}
                    label={{
                      value: "People",
                      angle: 90,
                      position: "insideRight",
                      style: {
                        textAnchor: "middle",
                        fill: "#f97316",
                        fontSize: 10,
                        fontWeight: 800,
                      },
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "sales"
                        ? `$${value.toLocaleString()} AUD`
                        : `${value} people`,
                      name === "sales" ? "Sales" : "People",
                    ]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    stroke="#93c5fd"
                    strokeWidth={6}
                    dot={false}
                    activeDot={{ r: 5, fill: "#3b82f6" }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="people"
                    stroke="#f97316"
                    strokeWidth={6}
                    dot={false}
                    activeDot={{ r: 5, fill: "#f97316" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── EMPLOYEE EVOLUTION TAB ── */}
        {activeTab === "employee" && (
          <div className="w-full bg-slate-50 rounded-3xl border border-slate-200 p-6">
            <table className="w-full border-collapse" id="myTable">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wide">
                  <th className="border border-slate-200 px-4 py-2 text-left">
                    Name
                  </th>
                  <th className="border border-slate-200 px-4 py-2 text-left">
                    Designation
                  </th>
                  <th className="border border-slate-200 px-4 py-2 text-center">
                    Total Projects
                  </th>
                  <th className="border border-slate-200 px-4 py-2 text-center">
                    Total Subprojects
                  </th>
                </tr>
              </thead>
              <tbody>
                {employeeEvolution.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-slate-200 px-4 py-8 text-center text-slate-400 italic"
                    >
                      No employee data found.
                    </td>
                  </tr>
                ) : (
                  employeeEvolution.map((emp, idx) => (
                    <tr
                      key={idx}
                      // ✅ FIX: Call handleEmployeeClick so projects are fetched
                      onClick={() => handleEmployeeClick(emp)}
                      className="cursor-pointer hover:bg-blue-50 transition-colors"
                    >
                      <td className="border border-slate-200 px-4 py-2">
                        {emp.fullname || "—"}
                      </td>
                      <td className="border border-slate-200 px-4 py-2">
                        {emp.designation || "—"}
                      </td>
                      <td className="border border-slate-200 px-4 py-2 text-center">
                        {emp.total_projects_worked ?? 0}
                      </td>
                      <td className="border border-slate-200 px-4 py-2 text-center">
                        {emp.total_subprojects_worked ?? 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedEmployee && (
        <EmployeeProjectModal
          selectedEmployee={selectedEmployee}
          employeeProjects={employeeProjects}
          loadingProjects={loadingProjects}
          setSelectedEmployee={setSelectedEmployee}
          setSearchTerm={setSearchTerm}
        />
      )}
    </>
  );
}
