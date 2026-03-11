import React, { useMemo } from "react";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  X,
  AlertCircle,
  CheckCircle,
  Timer,
} from "lucide-react";

// ─────────────────────────────────────────────
// Utility: parse employee_hours string
// "Alice (12h), Bob (8h)" → [{ name, hours }]
// ─────────────────────────────────────────────
function parseEmployeeHours(raw) {
  if (!raw || raw === "—") return [];
  const entries = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(/^(.+?)\s*\((\d+(?:\.\d+)?)h?\)$/);
      if (match) return { name: match[1].trim(), hours: parseFloat(match[2]) };
      return { name: entry, hours: 0 };
    });

  // Deduplicate: sum hours for same employee name
  const merged = {};
  for (const e of entries) {
    if (merged[e.name]) {
      merged[e.name] += e.hours;
    } else {
      merged[e.name] = e.hours;
    }
  }
  return Object.entries(merged).map(([name, hours]) => ({ name, hours }));
}

// ─────────────────────────────────────────────
// Mini Progress Bar
// ─────────────────────────────────────────────
function ProgressBar({ value, max, color = "#3b82f6" }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const over = max > 0 && value > max;
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: over ? "linear-gradient(90deg,#ef4444,#f97316)" : color,
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// Stat pill for summary cards
// ─────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "blue" }) {
  const palette = {
    blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-500" },
    green: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: "text-green-500",
    },
    red: { bg: "bg-red-50", text: "text-red-700", icon: "text-red-500" },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      icon: "text-purple-500",
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      icon: "text-amber-500",
    },
  };
  const p = palette[color] || palette.blue;
  return (
    <div className={`${p.bg} rounded-2xl p-4 flex flex-col gap-1`}>
      <div
        className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${p.icon}`}
      >
        <Icon size={13} /> {label}
      </div>
      <p className={`text-2xl font-black ${p.text} leading-none`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 font-semibold">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Single Project Detail Row (expanded)
// ─────────────────────────────────────────────
function ProjectRow({ project, idx }) {
  const employees = parseEmployeeHours(project.employee_hours);
  const expected = parseFloat(project.expected_project_hours) || 0;
  const actual = parseFloat(project.actual_hours_taken) || 0;
  const diff = parseFloat(project.hours_difference) ?? expected - actual;
  const isOver = diff < 0;
  const isOnTime = diff >= 0;
  const efficiency =
    expected > 0 ? Math.round((actual / expected) * 100) : null;

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden mb-4 hover:border-blue-200 transition-all">
      {/* Project Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
            {idx + 1}
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm leading-tight">
              {project.project_title || "—"}
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {project.team || "—"}{" "}
              {project.invoiced_date
                ? `· ${new Date(project.invoiced_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`
                : ""}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${
            isOver ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {isOver ? <TrendingDown size={12} /> : <CheckCircle size={12} />}
          {isOver
            ? `${Math.abs(diff).toFixed(1)}h Over Budget`
            : `${diff.toFixed(1)}h Under Budget`}
        </div>
      </div>

      {/* Hours Grid */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white">
        <div className="px-5 py-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Timer size={10} /> Expected
          </p>
          <p className="text-xl font-black text-slate-700">
            {expected > 0 ? `${expected}h` : "—"}
          </p>
        </div>
        <div className="px-5 py-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Clock size={10} /> Actual
          </p>
          <p
            className={`text-xl font-black ${isOver ? "text-red-600" : "text-slate-700"}`}
          >
            {actual > 0 ? `${actual.toFixed(1)}h` : "—"}
          </p>
        </div>
        <div className="px-5 py-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <TrendingUp size={10} /> Efficiency
          </p>
          <p
            className={`text-xl font-black ${
              efficiency == null
                ? "text-slate-300"
                : efficiency > 100
                  ? "text-red-600"
                  : efficiency > 80
                    ? "text-amber-600"
                    : "text-green-600"
            }`}
          >
            {efficiency != null ? `${efficiency}%` : "—"}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      {expected > 0 && (
        <div className="px-5 pb-3 bg-white">
          <ProgressBar
            value={actual}
            max={expected}
            color={isOver ? "#ef4444" : "#3b82f6"}
          />
          <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
            {efficiency != null
              ? `${Math.min(efficiency, 100)}% of budget used`
              : "No budget set"}
          </p>
        </div>
      )}

      {/* Employee breakdown */}
      {employees.length > 0 && (
        <div className="px-5 py-4 bg-white border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Users size={11} /> Team Hours Breakdown
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {employees.map((emp, ei) => {
              const share =
                actual > 0 ? Math.round((emp.hours / actual) * 100) : 0;
              return (
                <div key={ei} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 shrink-0">
                    {emp.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-xs font-bold text-slate-700 truncate">
                        {emp.name}
                      </span>
                      <span className="text-xs font-black text-slate-500 shrink-0 ml-2">
                        {emp.hours}h
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full">
                      <div
                        className="h-1.5 rounded-full bg-blue-400"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">
                      {share}% of project
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Amount row */}
      {project.amount && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
          <DollarSign size={13} className="text-green-500" />
          <span className="text-xs font-black text-green-700">
            ${parseFloat(project.amount).toLocaleString()} invoiced
          </span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Modal Export
// ─────────────────────────────────────────────
export default function CustomerProjectModal({
  selectedCustomer,
  customerProjects,
  setSelectedCustomer,
}) {
  if (!selectedCustomer) return null;

  const totalAmount = customerProjects.reduce(
    (s, p) => s + (parseFloat(p.amount) || 0),
    0,
  );
  const totalPeople = customerProjects.reduce(
    (s, p) => s + (p.total_people || 0),
    0,
  );
  const totalExp = customerProjects.reduce(
    (s, p) => s + (parseFloat(p.expected_project_hours) || 0),
    0,
  );
  const totalActual = customerProjects.reduce(
    (s, p) => s + (parseFloat(p.actual_hours_taken) || 0),
    0,
  );
  const totalDiff = totalExp - totalActual;
  const overBudget = customerProjects.filter(
    (p) =>
      (parseFloat(p.hours_difference) ??
        parseFloat(p.expected_project_hours) -
          parseFloat(p.actual_hours_taken)) < 0,
  ).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* ── Header ── */}
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">
                {selectedCustomer.client_name || "Customer"}
              </h2>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500 font-semibold">
                {selectedCustomer.contact_phone && (
                  <span>📞 {selectedCustomer.contact_phone}</span>
                )}
                {selectedCustomer.contact_email && (
                  <span>✉️ {selectedCustomer.contact_email}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedCustomer(null)}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition rounded-xl p-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
            <StatCard
              icon={TrendingUp}
              label="Projects"
              value={customerProjects.length}
              color="blue"
            />
            <StatCard
              icon={DollarSign}
              label="Total Invoiced"
              value={`$${Math.round(totalAmount).toLocaleString()}`}
              color="green"
            />
            <StatCard
              icon={Users}
              label="Total People"
              value={totalPeople}
              color="purple"
            />
            <StatCard
              icon={Clock}
              label="Budget Used"
              value={`${totalActual.toFixed(0)}h`}
              sub={totalExp > 0 ? `of ${totalExp}h budgeted` : "No budget set"}
              color={totalActual > totalExp ? "red" : "amber"}
            />
            <StatCard
              icon={totalDiff >= 0 ? CheckCircle : AlertCircle}
              label={totalDiff >= 0 ? "Saved" : "Overrun"}
              value={`${Math.abs(totalDiff).toFixed(0)}h`}
              sub={`${overBudget} project${overBudget !== 1 ? "s" : ""} over budget`}
              color={totalDiff >= 0 ? "green" : "red"}
            />
          </div>
        </div>

        {/* ── Project List ── */}
        <div className="overflow-y-auto flex-1 px-8 py-6">
          {customerProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-300">
              <AlertCircle size={32} className="mb-2" />
              <p className="font-bold text-sm italic">
                No projects found for this customer.
              </p>
            </div>
          ) : (
            customerProjects.map((project, idx) => (
              <ProjectRow key={idx} project={project} idx={idx} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
