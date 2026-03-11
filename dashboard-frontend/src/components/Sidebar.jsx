import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  HardHat,
  Cpu,
  Factory,
  BarChart3,
  BriefcaseBusiness,
  TrendingUp,
} from "lucide-react";
import logoNavy from "../assets/logoNavy.png";
const teams = [
  {
    id: "Finance Team",
    icon: <BarChart3 size={20} />,
    label: "Finance",
    path: "/finance",
  },
  {
    id: "Building Team",
    icon: <HardHat size={20} />,
    label: "Building",
    path: "/building",
  },
  {
    id: "Industrial Team",
    icon: <Factory size={20} />,
    label: "Industrial",
    path: "/industrial",
  },
  { id: "IT", icon: <Cpu size={20} />, label: "IT & AI", path: "/it" },
  {
    id: "Accounts",
    icon: <BriefcaseBusiness size={20} />,
    label: "Business",
    path: "/business",
  },
  {
    id: "Sales Quotation",
    icon: <TrendingUp size={20} />,
    label: "Sales & Quotation",
    path: "/sales",
  },
];

export default function Sidebar({ setFilter, setSearchTerm }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="group w-24 hover:w-72 bg-white border-r border-slate-200 flex flex-col p-6 hidden lg:flex sticky top-0 h-screen transition-all duration-300 ease-in-out z-30 shadow-sm overflow-x-hidden">
      {/* Logo */}
      <div className="flex items-center gap-4 mb-10 px-2 h-10">
        <div className="min-w-[40px]">
          <img
            src={logoNavy}
            alt="RAE Analytics"
            className="w-10 h-10 object-contain"
          />
        </div>

        <span className="font-black text-2xl tracking-tighter text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          RAE Analytics
        </span>
      </div>

      {/* Nav Items */}
      <nav className="space-y-4 flex-1">
        {teams.map((team) => {
          const isActive =
            location.pathname === team.path ||
            (location.pathname === "/" && team.path === "/finance");
          return (
            <button
              key={team.id}
              onClick={() => {
                setFilter(team.id);
                setSearchTerm("");
                navigate(team.path);
              }}
              className={`flex items-center transition-all duration-300 relative group/btn
                ${isActive ? "w-full" : "w-14 group-hover:w-full"}`}
            >
              <div
                className={`flex items-center justify-center transition-all duration-300 shrink-0
                ${
                  isActive
                    ? "w-14 h-14 bg-blue-600 rounded-[1.25rem] shadow-xl shadow-blue-200 text-white"
                    : "w-14 h-14 bg-transparent group-hover/btn:bg-slate-50 rounded-2xl text-slate-400 hover:text-blue-600"
                }`}
              >
                {React.cloneElement(team.icon, { size: 24 })}
              </div>
              <span
                className={`font-bold text-sm ml-4 whitespace-nowrap transition-all duration-300
                ${isActive ? "text-blue-600" : "text-slate-500"}
                opacity-0 group-hover:opacity-100 hidden group-hover:block`}
              >
                {team.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Status Footer */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <div className="flex items-center gap-4 px-2 h-10">
          <div className="min-w-[12px] flex justify-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            DDEV Active
          </p>
        </div>
      </div>
    </aside>
  );
}
//C:\Users\shrey\Desktop\raeanaylytics\raeAnalytics\dashboard-frontend\src\components\Sidebar.jsx
