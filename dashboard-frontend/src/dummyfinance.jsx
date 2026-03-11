import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ProjectCard from './components/ProjectCard';
import SearchBar from './components/SearchBar';
import InflationSplineChart from './components/InflationSplineChart';
import {
BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
PieChart, Pie, Cell, Sector, ResponsiveContainer,
ComposedChart, Line, Area, Scatter
} from 'recharts';
import { Loader2, Search, BarChart3, TrendingUp, AlertTriangle, Building2, Factory, Monitor, LayoutDashboard } from 'lucide-react';

// --- Summary Card Data ---
const summaryCards = [
  {
    title: 'Building',
    value: '$2.4M',
    change: '+12.5%',
    positive: true,
    icon: Building2,
    color: 'blue',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    border: 'border-blue-100',
    badge: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Industrial',
    value: '$1.8M',
    change: '+8.3%',
    positive: true,
    icon: Factory,
    color: 'emerald',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    border: 'border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'IT',
    value: '$980K',
    change: '-3.1%',
    positive: false,
    icon: Monitor,
    color: 'violet',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-500',
    border: 'border-violet-100',
    badge: 'bg-violet-100 text-violet-600',
  },
  {
    title: 'Total',
    value: '$5.18M',
    change: '+7.9%',
    positive: true,
    icon: LayoutDashboard,
    color: 'orange',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    border: 'border-orange-100',
    badge: 'bg-orange-100 text-orange-600',
  },
];

// --- Project Health data (Y=months, X=AUD amount) ---
const tinyBarData = [
{ month: 'Jan', aud: 42000 },
{ month: 'Feb', aud: 38500 },
{ month: 'Mar', aud: 51000 },
{ month: 'Apr', aud: 47200 },
{ month: 'May', aud: 63800 },
{ month: 'Jun', aud: 59100 },
{ month: 'Jul', aud: 71400 },
];
// --- MixBarChart data ---
const mixData = [
  { name: 'July', building: 4000, industrial: 2400, it: 2400 },
  { name: 'Aug', building: 3000, industrial: 1398, it: 2210 },
  { name: 'Sept', building: 2000, industrial: 9800, it: 2290 },
  { name: 'Oct', building: 2780, industrial: 3908, it: 2000 },
  { name: 'Nov', building: 1890, industrial: 4800, it: 2181 },
  { name: 'Dec', building: 2390, industrial: 3800, it: 2500 },
  { name: 'Jan', building: 3490, industrial: 4300, it: 2100 },
];

// --- ComposedChart data ---
const composedData = [
  { name: 'Page A', building: 590, industrial: 800, it: 490 },
  { name: 'Page B', building: 868, industrial: 967, it: 590 },
  { name: 'Page C', building: 1397, industrial: 1098, it: 350 },
  { name: 'Page D', building: 1480, industrial: 1200, it: 480 },
  { name: 'Page E', building: 1520, industrial: 1108, it: 460 },
  { name: 'Page F', building: 1400, industrial: 680, it: 380 },
];

// --- Tab data for Pending Start ---
const tabData = {
AUS:      [{ project: 'Bridge Upgrade', budget: 420 }, { project: 'Solar Farm', budget: 310 }, { project: 'Rail Link', budget: 580 }, { project: 'Port Expansion', budget: 270 }, { project: 'Highway 9', budget: 390 }],
China:    [{ project: 'Smart City', budget: 720 }, { project: 'Data Centre', budget: 490 }, { project: 'Metro Line 4', budget: 860 }, { project: 'Wind Farm', budget: 340 }, { project: 'Fibre Grid', budget: 210 }],
'New ZE': [{ project: 'Tunnel Works', budget: 180 }, { project: 'Airport Link', budget: 320 }, { project: 'Hydro Plant', budget: 410 }, { project: 'Road Sealing', budget: 140 }, { project: 'Bridge NZ-3', budget: 260 }],
Upcoming: [{ project: 'Stadium Build', budget: 640 }, { project: 'EV Charging', budget: 190 }, { project: 'Waste Plant', budget: 370 }, { project: 'Hospital Wing', budget: 530 }, { project: 'School Block', budget: 220 }],
};
const TAB_COLORS = { AUS: '#3b82f6', China: '#ef4444', 'New ZE': '#10b981', Upcoming: '#f59e0b' };
const TABS = ['AUS', 'China', 'New ZE', 'Upcoming'];

// --- MixBarChart ---
function MixBarChart() {
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
        data={mixData}
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
          tick={{ fill: '#94a3b8', fontWeight: 700 }}
          label={{
            value: 'AUD',
            angle: -90,
            position: 'insideLeft',
            style: {
              textAnchor: 'middle',
              fill: '#94a3b8',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
            },
          }}
        />
        <Tooltip />
        <Legend
          onMouseEnter={onLegendMouseEnter}
          onMouseOut={onLegendMouseOut}
          onClick={onLegendClick}
          wrapperStyle={{ cursor: 'pointer', fontSize: '11px' }}
        />
        <Bar dataKey="building" fill={focusedDataKey == null || focusedDataKey === 'pv' ? '#8884d8' : '#e5e7eb'} barSize={10} radius={[4, 4, 0, 0]} />
        <Bar dataKey="industrial" fill={focusedDataKey == null || focusedDataKey === 'amt' ? '#82ca9d' : '#e5e7eb'} barSize={10} radius={[4, 4, 0, 0]} />
        <Bar dataKey="it" fill={focusedDataKey == null || focusedDataKey === 'uv' ? '#ffc658' : '#e5e7eb'} barSize={10} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Pie helpers ---
const pie1 = { label: 'Nov',   data: [{ name: 'Done', value: 68 }, { name: 'Left', value: 32 }],                                      colors: ['#0088FE', '#00C49F'] };
const pie2 = { label: 'Dec',     data: [{ name: 'Billable', value: 45 }, { name: 'Internal', value: 30 }, { name: 'Other', value: 25 }], colors: ['#0088FE', '#00C49F', '#FFBB28'] };
const pie3 = { label: 'Jan', data: [{ name: 'On Time', value: 80 }, { name: 'Late', value: 12 }, { name: 'At Risk', value: 8 }],     colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'] };
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const ncx = Number(cx); const ncy = Number(cy);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor={x > ncx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  );
};
const makeCustomPie = (colors) => (props) => <Sector {...props} fill={colors[props.index % colors.length]} />;
function SmallCustomPie({ data, colors, label }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <PieChart width={110} height={110}>
        <Tooltip
          formatter={(value, name) => [`${value}`, name]}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: '11px', fontWeight: 700 }}
        />
        <Pie data={data} dataKey="value" labelLine={false} label={renderCustomizedLabel} outerRadius={50} shape={makeCustomPie(colors)}>
          {data.map((_, i) => (<Cell key={i} fill={colors[i % colors.length]} />))}
        </Pie>
      </PieChart>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">{label}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
export default function Finance({ filter, searchTerm, setSearchTerm }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('AUS');

  useEffect(() => {
    axios.get('http://localhost:5000/api/detailed-projects')
      .then(res => { setProjects(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(err => { console.error("API Error:", err); setLoading(false); });
  }, []);

  useEffect(() => { localStorage.setItem('csarae_search', searchTerm); }, [searchTerm]);

  const recentProjects = useMemo(() =>
    [...projects].sort((a, b) => b.project_id - a.project_id).slice(0, 5), [projects]);

  const filteredProjects = useMemo(() => projects.filter(p => {
    if (!p) return false;
    const matchesSearch = p.project_name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      p.project_id?.toString().includes(searchTerm);
    return searchTerm?.trim() !== "" ? matchesSearch : p.p_team === filter;
  }), [projects, searchTerm, filter]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold tracking-tight">Syncing DDEV Analytics...</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-12">

      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Finance Analytics</h1>
          {searchTerm && (
            <p className="text-blue-600 font-bold text-sm mt-2 flex items-center gap-2">
              <Search size={14} />
              Result for: "{searchTerm}"
            </p>
          )}
        </div>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </div>

      {/* ✅ 4 Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-white p-6 rounded-[2rem] shadow-sm border ${card.border} flex flex-col gap-4 hover:shadow-md transition-shadow duration-200`}
            >
              {/* Top row: icon + badge */}
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 ${card.bg} rounded-2xl flex items-center justify-center`}>
                  <Icon size={20} className={card.iconColor} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${card.badge}`}>
                  {card.positive ? '▲' : '▼'} {card.change}
                </span>
              </div>

              {/* Value */}
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.title}</p>
                <p className="text-3xl font-black text-slate-800 leading-none">{card.value}</p>
              </div>

              {/* Mini progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${card.bg.replace('bg-', 'bg-').replace('-50', '-400')}`}
                  style={{ width: card.positive ? '72%' : '38%' }}
                />
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
            <BarChart data={tinyBarData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
              <YAxis
                fontSize={10} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                tick={{ fill: '#94a3b8', fontWeight: 700 }}
                label={{ value: 'AUD', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 11, fontWeight: 800, letterSpacing: '0.08em' } }}
              />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()} AUD`, 'Spend']} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="aud" fill="#8884d8" radius={[8, 8, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Box 2: Team Sales Ratio */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
            <Loader2 size={16} />
            Team Sales Ratio
          </h3>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4"></p>
          <div className="flex items-center justify-around h-[calc(100%-5rem)]">
            <SmallCustomPie data={pie1.data} colors={pie1.colors} label={pie1.label} />
            <div className="w-px h-24 bg-slate-100" />
            <SmallCustomPie data={pie2.data} colors={pie2.colors} label={pie2.label} />
            <div className="w-px h-24 bg-slate-100" />
            <SmallCustomPie data={pie3.data} colors={pie3.colors} label={pie3.label} />
          </div>
        </div>
      </section>

      {/* Quick-Lists */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Sales by Team */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" /> Sales by Team
            </h3>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">New Entries</span>
          </div>
          <div className="space-y-3 mb-6">
            {recentProjects.map(p => (
              <div key={p.project_id} onClick={() => setSearchTerm(p.project_name)} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">#{p.project_id}</div>
                  <div>
                    <p className="text-sm font-black text-slate-800">{p.project_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.p_team}</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-400">{p.start_date}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-5">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3"></p>
            <MixBarChart />
          </div>
        </div>

        {/* Sales By Area */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={16} className="text-slate-400" /> Sales By Area
            </h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">Not Started</span>
          </div>
          <div className="flex gap-2 mb-6 p-1 bg-slate-50 rounded-2xl">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${activeTab === tab ? 'text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                style={activeTab === tab ? { backgroundColor: TAB_COLORS[tab] } : {}}
              >{tab}</button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tabData[activeTab]} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis dataKey="project" type="category" fontSize={10} axisLine={false} tickLine={false} width={90} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="budget" fill={TAB_COLORS[activeTab]} radius={[0, 8, 8, 0]} barSize={22}
                label={{ position: 'right', fontSize: 10, fontWeight: 700, fill: '#94a3b8', formatter: (v) => `${v}h` }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Project Overview — ComposedChart */}
      {/* <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
          <BarChart3 size={16} /> Project Overview
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={composedData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="name" scale="band" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="industrial" barSize={20} fill="#413ea0" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="building" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} />
            <Scatter dataKey="it" fill="red" />
          </ComposedChart>
        </ResponsiveContainer>
      </div> */}

      {/* Inflation / Spline Overview */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 mb-10">
        <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2">
          <TrendingUp size={16} /> Yearly Sales Performace
        </h3>
        <div className="w-full h-[350px]">
          <InflationSplineChart />
        </div>
      </div>

    </div>
  );
}