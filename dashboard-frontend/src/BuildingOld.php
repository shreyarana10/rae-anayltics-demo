import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import ProjectCard from './components/ProjectCard';
import SearchBar from './components/SearchBar';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Loader2, Search, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export default function Building({ filter, searchTerm, setSearchTerm }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/detailed-projects')
      .then(res => { setProjects(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(err => { console.error("API Error:", err); setLoading(false); });
  }, []);

  useEffect(() => { localStorage.setItem('csarae_search', searchTerm); }, [searchTerm]);

  const stats = useMemo(() => {
    if (!projects.length) return null;
    const filteredForStats = projects.filter(p => {
      if (!p) return false;
      const matchesSearch = p.project_name?.toLowerCase().includes(searchTerm?.toLowerCase()) || p.project_id?.toString().includes(searchTerm);
      return searchTerm?.trim() !== "" ? matchesSearch : p.p_team === filter;
    });
    const statusData = [
      { name: 'Running', value: projects.filter(p => p.urgency === 'green').length, color: '#10b981' },
      { name: 'Closed', value: projects.filter(p => p.urgency === 'purple').length, color: '#8b5cf6' },
      { name: 'Delayed/Urgent', value: projects.filter(p => ['red', 'orange'].includes(p.urgency)).length, color: '#ef4444' },
      { name: 'Hold', value: projects.filter(p => p.urgency === 'yellow').length, color: '#f59e0b' },
    ];
    const workloadData = filteredForStats.map(p => ({ fullName: p.project_name, name: p.project_name, hours: p.contributors?.reduce((sum, c) => sum + parseFloat(c.total_hours || 0), 0) || 0 })).sort((a, b) => b.hours - a.hours).slice(0, 5);
    const concentrationData = projects.map(p => ({ fullName: p.project_name, name: p.project_name, staff: p.contributors?.length || 0 })).sort((a, b) => b.staff - a.staff).slice(0, 5);
    return { statusData, workloadData, concentrationData };
  }, [projects, filter, searchTerm]);

  const recentProjects = useMemo(() => [...projects].sort((a, b) => b.project_id - a.project_id).slice(0, 5), [projects]);
  const notStartedProjects = useMemo(() => projects.filter(p => p.urgency === 'white').slice(0, 5), [projects]);
  const filteredProjects = useMemo(() => projects.filter(p => {
    if (!p) return false;
    const matchesSearch = p.project_name?.toLowerCase().includes(searchTerm?.toLowerCase()) || p.project_id?.toString().includes(searchTerm);
    return searchTerm?.trim() !== "" ? matchesSearch : p.p_team === filter;
  }), [projects, searchTerm, filter]);

  const handleBarClick = useCallback((data) => { if (data?.fullName) setSearchTerm(data.fullName); }, []);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-slate-500 font-bold tracking-tight">Syncing DDEV Analytics...</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-12">
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><TrendingUp size={16} /> Project Health</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart><Pie data={stats?.statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{stats?.statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip /><Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} /></PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><BarChart3 size={16} /> Effort (Hours)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats?.workloadData} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" fontSize={9} axisLine={false} tickLine={false} width={100} />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="hours" fill="#3b82f6" radius={[0, 4, 4, 0]} onClick={handleBarClick} className="cursor-pointer" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-96">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-4 flex items-center gap-2"><AlertTriangle size={16} /> Staff Concentration</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={stats?.concentrationData} layout="vertical" margin={{ left: 40, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" fontSize={9} axisLine={false} tickLine={false} width={100} />
              <Tooltip />
              <Bar dataKey="staff" fill="#f59e0b" radius={[0, 4, 4, 0]} onClick={handleBarClick} className="cursor-pointer" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={16} className="text-blue-500" /> Recently Created</h3>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">New Entries</span>
          </div>
          <div className="space-y-4">
            {recentProjects.map(p => (
              <div key={p.project_id} onClick={() => setSearchTerm(p.project_name)} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">#{p.project_id}</div>
                  <div><p className="text-sm font-black text-slate-800">{p.project_name}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.p_team}</p></div>
                </div>
                <p className="text-xs font-bold text-slate-400">{p.start_date}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><AlertTriangle size={16} className="text-slate-400" /> Pending Start</h3>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">Not Started</span>
          </div>
          <div className="space-y-4">
            {notStartedProjects.length > 0 ? notStartedProjects.map(p => (
              <div key={p.project_id} onClick={() => setSearchTerm(p.project_name)} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center font-bold text-xs">#{p.project_id}</div>
                  <div><p className="text-sm font-black text-slate-800">{p.project_name}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{p.p_team}</p></div>
                </div>
                <p className="text-xs font-bold text-slate-400">{p.start_date}</p>
              </div>
            )) : <div className="h-40 flex items-center justify-center text-slate-300 font-bold text-sm italic">All projects are currently in progress.</div>}
          </div>
        </div>
      </section>

      <header className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Building Projects</h1>
          {searchTerm && <p className="text-blue-600 font-bold text-sm mt-2 flex items-center gap-2"><Search size={14} /> Result for: "{searchTerm}"</p>}
        </div>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {filteredProjects.map(project => <ProjectCard key={project.project_id} project={project} />)}
      </div>
    </div>
  );
}