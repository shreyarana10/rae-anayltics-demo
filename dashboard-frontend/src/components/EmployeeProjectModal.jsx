import React, { useState, useMemo } from "react";
import axios from "axios";
import {
  Loader2,
  Search,
  X,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Mail,
  Phone,
} from "lucide-react";

const urgencyColor = {
  green: "bg-green-500",
  red: "bg-red-500",
  orange: "bg-orange-400",
  yellow: "bg-yellow-400",
  purple: "bg-purple-500",
  white: "bg-gray-200",
};

const urgencyTextColor = {
  green: "text-white",
  red: "text-white",
  orange: "text-white",
  yellow: "text-slate-800",
  purple: "text-white",
  white: "text-slate-600",
};

// Detailed Project Modal Component
function ProjectDetailModal({ projectId, team, onClose, setSearchTerm }) {
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState(null);

  // Fetch project details when modal opens
  React.useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/${team}/project-details/${projectId}`,
        );
        setProjectData(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching project details:", err);
        setError("Failed to load project details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    // Handle null, undefined, or non-string values
    if (!status) return "bg-gray-100 text-gray-700";

    // Convert to string and lowercase safely
    const statusStr = String(status).toLowerCase();

    const colors = {
      completed: "bg-green-100 text-green-700",
      "in progress": "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
      delayed: "bg-red-100 text-red-700",
    };
    return colors[statusStr] || "bg-gray-100 text-gray-700";
  };

  const getStatusText = (status) => {
    if (!status) return "—";
    return String(status);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-3xl p-8 flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-slate-500 font-bold">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !projectData) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-3xl p-8 max-w-md">
          <h3 className="text-xl font-black text-red-600 mb-2">Error</h3>
          <p className="text-slate-600 mb-4">{error || "Project not found"}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 rounded-lg font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const { project, subprojects, contributors, summary } = projectData;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 overflow-y-auto py-8">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-3xl z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {project.project_name}
            </h2>
            <p className="text-sm font-bold text-slate-400">
              Project ID: {project.project_id}
              {project.revision_project_id && (
                <span className="ml-2 text-red-500">
                  (Revision of:{" "}
                  {project.revision_project_name || project.revision_project_id}
                  )
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="text-center">
            <p className="text-2xl font-black text-blue-600">
              {summary.total_subprojects}
            </p>
            <p className="text-xs font-bold text-slate-400">Subprojects</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-green-600">
              {summary.total_contributors}
            </p>
            <p className="text-xs font-bold text-slate-400">Team Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-orange-600">
              {summary.project_progress}%
            </p>
            <p className="text-xs font-bold text-slate-400">Progress</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b border-slate-200">
          {["details", "team", "subprojects"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-bold uppercase rounded-t-lg transition
                ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-600"
                }`}
            >
              {tab} {tab === "subprojects" && `(${subprojects.length})`}
              {tab === "team" && `(${summary.total_contributors})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 280px)" }}
        >
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Project Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase">
                    Basic Information
                  </h3>

                  <div>
                    <label className="text-xs font-bold text-slate-400">
                      Project Details
                    </label>
                    <p className="text-sm mt-1 bg-slate-50 p-3 rounded-lg">
                      {project.project_details || "—"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400">
                        Start Date
                      </label>
                      <p className="text-sm mt-1 flex items-center gap-1 bg-slate-50 p-3 rounded-lg">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(project.start_date)}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400">
                        End Date
                      </label>
                      <p className="text-sm mt-1 flex items-center gap-1 bg-slate-50 p-3 rounded-lg">
                        <Calendar size={14} className="text-slate-400" />
                        {formatDate(project.end_date)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">
                      Progress
                    </label>
                    <div className="mt-1 bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${project.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold">
                          {project.progress || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-400 uppercase">
                    Status & Urgency
                  </h3>

                  <div className="flex items-center gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400">
                        Status
                      </label>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-xs font-black
                          ${urgencyColor[project.urgency] || "bg-gray-300"} 
                          ${urgencyTextColor[project.urgency] || "text-white"}`}
                        >
                          {project.urgency?.toUpperCase() || "UNKNOWN"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-400">
                        Team
                      </label>
                      <p className="text-sm mt-1 font-bold">
                        {project.p_team || "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">
                      EPT (Hours)
                    </label>
                    <p className="text-sm mt-1 bg-slate-50 p-3 rounded-lg font-bold">
                      {project.EPT || "—"} hours
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">
                      Delivery Date
                    </label>
                    <p className="text-sm mt-1 bg-slate-50 p-3 rounded-lg">
                      {formatDate(project.delivery_date)}
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">
                      State
                    </label>
                    <p className="text-sm mt-1 bg-slate-50 p-3 rounded-lg">
                      {project.state || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Links and Comments */}
              {(project.links || project.comments) && (
                <div className="border-t border-slate-200 pt-4">
                  {project.links && (
                    <div className="mb-3">
                      <label className="text-xs font-bold text-slate-400">
                        Links
                      </label>
                      <p className="text-sm mt-1 text-blue-600 break-all">
                        <a
                          href={project.links}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {project.links}
                        </a>
                      </p>
                    </div>
                  )}
                  {project.comments && (
                    <div>
                      <label className="text-xs font-bold text-slate-400">
                        Comments
                      </label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {project.comments}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Team Tab */}
          {activeTab === "team" && (
            <div className="space-y-6">
              {/* Key Team Members */}
              <div>
                <h3 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2">
                  <Users size={18} className="text-green-500" />
                  Key Team Members
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Manager */}
                  <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {project.project_manager_name?.charAt(0) || "PM"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase">
                          Project Manager
                        </p>
                        <p className="font-black text-slate-800">
                          {project.project_manager_name ||
                            project.project_manager ||
                            "—"}
                        </p>
                      </div>
                    </div>
                    {project.project_managers_id && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 ml-12">
                        <User size={12} /> ID: {project.project_managers_id}
                      </p>
                    )}
                  </div>

                  {/* Team Lead */}
                  <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {project.team_lead_name?.charAt(0) || "TL"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-purple-600 uppercase">
                          Team Lead
                        </p>
                        <p className="font-black text-slate-800">
                          {project.team_lead_name || project.team_lead || "—"}
                        </p>
                      </div>
                    </div>
                    {project.team_lead_id && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 ml-12">
                        <User size={12} /> ID: {project.team_lead_id}
                      </p>
                    )}
                  </div>

                  {/* Assigned To */}
                  <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {project.assign_to_name?.charAt(0) || "AS"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-600 uppercase">
                          Assigned To
                        </p>
                        <p className="font-black text-slate-800">
                          {project.assign_to_name || project.assign_to || "—"}
                        </p>
                      </div>
                    </div>
                    {project.assign_to_id && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 ml-12">
                        <User size={12} /> ID: {project.assign_to_id}
                      </p>
                    )}
                  </div>

                  {/* Verified By */}
                  {/* <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {project.verify_by_fullname?.charAt(0) || "VB"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-orange-600 uppercase">
                          Verified By
                        </p>
                        <p className="font-black text-slate-800">
                          {project.verify_by_fullname ||
                            project.verify_by_name ||
                            project.verify_by ||
                            "—"}
                        </p>
                      </div>
                    </div>
                    <div className="ml-12 mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          project.verify_status === "verified"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {getStatusText(project.verify_status)}
                      </span>
                    </div>
                  </div> */}
                </div>

                {/* Additional Engineers */}
                {/* Additional Engineers */}
                {project.additional_engineer_details &&
                  project.additional_engineer_details.length > 0 && (
                    <div className="mt-4 bg-slate-50 p-4 rounded-xl">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Additional Engineers
                      </label>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        {project.additional_engineer_details.map((eng) => (
                          <div
                            key={eng.user_id}
                            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200"
                          >
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                              {eng.fullname?.charAt(0)}
                            </div>

                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {eng.fullname}
                              </p>
                              <p className="text-xs text-slate-400">
                                ID: {eng.user_id}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* All Contributors List */}
              {contributors && contributors.length > 0 && (
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-indigo-500" />
                    All Contributors ({contributors.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {contributors.map((contributor) => (
                      <div
                        key={contributor.user_id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                      >
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {contributor.fullname?.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold">
                            {contributor.fullname}
                          </p>
                          <p className="text-xs text-slate-400">
                            {contributor.role_display}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification & Status Summary */}
              {/* <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2">
                  <CheckCircle size={18} className="text-yellow-500" />
                  Verification & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Verification Status
                    </label>
                    <p className="text-sm mt-1 font-bold">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          project.verify_status === "verified"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {getStatusText(project.verify_status)}
                      </span>
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Deliverable Status
                    </label>
                    <p className="text-sm mt-1 font-bold">
                      {getStatusText(project.deliverable_status)}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Deliverable Mail Date
                    </label>
                    <p className="text-sm mt-1">
                      {formatDate(project.deliverable_mailDate)}
                    </p>
                  </div>
                </div>
              </div> */}
            </div>
          )}

          {/* Subprojects Tab */}
          {activeTab === "subprojects" && (
            <div>
              <h3 className="text-lg font-black text-slate-700 mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-red-500" />
                All Subprojects ({subprojects.length})
              </h3>

              {subprojects.length === 0 ? (
                <p className="text-center py-12 text-slate-400 italic bg-slate-50 rounded-xl">
                  No subprojects found for this project.
                </p>
              ) : (
                <div className="space-y-4">
                  {subprojects.map((sp) => (
                    <div
                      key={sp.table_id}
                      className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition bg-white"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-slate-800 text-lg">
                            {sp.subproject_name || "Unnamed Subproject"}
                          </h4>
                          <p className="text-xs text-slate-400">
                            Table ID: {sp.table_id}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSearchTerm(sp.subproject_name);
                            onClose();
                          }}
                          className="px-4 py-2 text-xs font-bold rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                        >
                          View in Dashboard
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase">
                            Status
                          </label>
                          <p className="mt-1">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-bold inline-block ${getStatusBadge(sp.subproject_status)}`}
                            >
                              {getStatusText(sp.subproject_status)}
                            </span>
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase">
                            Status
                          </label>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-black
                              ${urgencyColor[sp.urgency] || "bg-gray-300"} 
                              ${urgencyTextColor[sp.urgency] || "text-white"}`}
                            >
                              {sp.urgency?.toUpperCase() || "—"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase">
                            Progress
                          </label>
                          <p className="mt-1 font-bold text-lg">
                            {sp.sub_progress || 0}%
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-400 uppercase">
                            End Date
                          </label>
                          <p className="mt-1 flex items-center gap-1">
                            <Calendar size={14} className="text-slate-400" />
                            {formatDate(sp.sub_end_date)}
                          </p>
                        </div>
                      </div>

                      {/* Subproject Team */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-lg mt-3">
                        <div>
                          <span className="font-bold text-slate-500">
                            Manager:
                          </span>{" "}
                          <span className="font-medium">
                            {sp.subproject_manager_name ||
                              sp.project_manager ||
                              "—"}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-500">
                            Team Lead:
                          </span>{" "}
                          <span className="font-medium">
                            {sp.subproject_team_lead_name ||
                              sp.team_lead ||
                              "—"}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-500">
                            Assigned:
                          </span>{" "}
                          <span className="font-medium">
                            {sp.subproject_assign_to_name ||
                              sp.assign_to ||
                              "—"}
                          </span>
                        </div>
                      </div>

                      {sp.subproject_details && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <label className="text-xs font-bold text-slate-400 uppercase">
                            Details
                          </label>
                          <p className="text-sm mt-2 text-slate-600">
                            {sp.subproject_details}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-4 flex justify-end gap-2 sticky bottom-0 bg-white rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeProjectModal({
  selectedEmployee,
  employeeProjects,
  loadingProjects,
  setSelectedEmployee,
  setSearchTerm,
}) {
  const [search, setSearch] = useState("");
  const [expandedProject, setExpandedProject] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Group projects and subprojects
  const groupedData = useMemo(() => {
    const projects = {};
    const subprojects = [];

    employeeProjects.forEach((row) => {
      if (row.record_type === "project") {
        if (!projects[row.project_id]) {
          projects[row.project_id] = {
            ...row,
            subprojects: [],
            type: "project",
            urgency: row.project_urgency,
            isRevision: !!row.revision_project_id,
          };
        }
      } else if (row.record_type === "subproject") {
        subprojects.push({
          ...row,
          type: "subproject",
          urgency: row.subproject_urgency || row.project_urgency,
        });

        if (!projects[row.project_id]) {
          projects[row.project_id] = {
            project_id: row.project_id,
            project_name: row.project_name,
            project_urgency: row.project_urgency,
            revision_project_id: row.revision_project_id,
            revision_project_name: row.revision_project_name,
            revision_urgency: row.revision_urgency,
            subprojects: [],
            type: "project",
            urgency: row.project_urgency,
          };
        }

        projects[row.project_id].subprojects.push({
          subproject_id: row.subproject_id,
          subproject_name: row.subproject_name,
          subproject_status: row.subproject_status,
          subproject_urgency: row.subproject_urgency,
          sub_end_date: row.sub_end_date,
          sub_progress: row.sub_progress,
        });
      }
    });

    return { projects: Object.values(projects), subprojects };
  }, [employeeProjects]);

  // Filter based on search
  const filteredProjects = useMemo(() => {
    return groupedData.projects.filter(
      (proj) =>
        proj.project_name?.toLowerCase().includes(search.toLowerCase()) ||
        String(proj.project_id).includes(search),
    );
  }, [groupedData.projects, search]);

  const getUrgencyBadge = (urgency, type = "project") => {
    const bgColor = urgencyColor[urgency] || "bg-gray-300";
    const txtColor = urgencyTextColor[urgency] || "text-white";
    const size =
      type === "subproject" ? "text-[8px] px-1.5 py-0.5" : "text-xs px-2 py-1";

    return (
      <span
        className={`inline-flex items-center justify-center rounded-md font-black ${bgColor} ${txtColor} ${size}`}
      >
        {urgency?.toUpperCase() || "UNKNOWN"}
      </span>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
        <div
          className="bg-white w-full max-w-5xl rounded-3xl shadow-xl p-6 max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {selectedEmployee?.fullname}
              </h2>
              <p className="text-xs font-bold text-slate-400 uppercase">
                {selectedEmployee?.designation} • Project Details
              </p>
            </div>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-4 flex-shrink-0">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by project ID or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {loadingProjects ? (
            <div className="flex items-center justify-center py-20 flex-1">
              <Loader2 className="animate-spin text-blue-600" size={36} />
            </div>
          ) : (
            <div className="overflow-auto flex-1">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wide">
                    <th className="border border-slate-200 px-4 py-3 text-left">
                      Project ID
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-left">
                      Project Name
                    </th>
                    <th className="border border-slate-200 px-4 py-3 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="border border-slate-200 px-4 py-10 text-center text-slate-400 italic"
                      >
                        No projects found for this employee.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((proj) => (
                      <React.Fragment key={proj.project_id}>
                        {/* Main project row */}
                        <tr
                          className="hover:bg-slate-50 transition cursor-pointer"
                          onClick={() =>
                            setExpandedProject(
                              expandedProject === proj.project_id
                                ? null
                                : proj.project_id,
                            )
                          }
                        >
                          <td className="border border-slate-200 px-4 py-3">
                            <div className="flex flex-col gap-1.5">
                              {/* Project ID badge with urgency color */}
                              <span
                                className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-black w-fit
                                  ${urgencyColor[proj.project_urgency] || "bg-gray-300"} 
                                  ${urgencyTextColor[proj.project_urgency] || "text-white"}`}
                              >
                                {proj.project_id}
                              </span>

                              {/* Subproject and Revision indicators */}
                              <div className="flex flex-wrap items-center gap-1">
                                {/* Revision indicator */}
                                {proj.revision_project_id && (
                                  <span
                                    title={`Revision: ${proj.revision_project_name}`}
                                    className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-black bg-red-500 text-white"
                                  >
                                    R{proj.revision_project_id}
                                  </span>
                                )}

                                {/* Subproject indicators - Show only first 3, then +X */}
                                {proj.subprojects.length > 0 ? (
                                  <>
                                    {/* Show first 3 subproject indicators */}
                                    {proj.subprojects
                                      .slice(0, 3)
                                      .map((sp, idx) => (
                                        <span
                                          key={sp.subproject_id}
                                          title={sp.subproject_name || ""}
                                          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[8px] font-black bg-red-500 text-white"
                                        >
                                          S{idx + 1}
                                        </span>
                                      ))}

                                    {/* If there are more than 3 subprojects, show +X */}
                                    {proj.subprojects.length > 3 && (
                                      <span
                                        title={`${proj.subprojects.length - 3} more subprojects`}
                                        className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[8px] font-black bg-red-500 text-white"
                                      >
                                        +{proj.subprojects.length - 3}
                                      </span>
                                    )}
                                  </>
                                ) : (
                                  /* If no subprojects and no revision, show nothing */
                                  !proj.revision_project_id && (
                                    <span className="text-[8px] text-slate-300">
                                      —
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="border border-slate-200 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {proj.project_name}
                              </span>
                            </div>
                          </td>

                          <td className="border border-slate-200 px-4 py-3 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProjectId(proj.project_id);
                              }}
                              className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>

                        {/* Expanded subprojects */}
                        {expandedProject === proj.project_id &&
                          proj.subprojects.length > 0 && (
                            <tr className="bg-slate-50">
                              <td
                                colSpan={3}
                                className="border border-slate-200 p-0"
                              >
                                <div className="p-4">
                                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
                                    Subprojects ({proj.subprojects.length})
                                  </h4>
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-slate-500 text-[10px] uppercase">
                                        <th className="text-left pb-2">ID</th>
                                        <th className="text-left pb-2">Name</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {proj.subprojects.map((sp, idx) => (
                                        <tr
                                          key={sp.subproject_id}
                                          className="border-t border-slate-200"
                                        >
                                          <td className="py-2 font-mono text-xs">
                                            S{idx + 1}
                                          </td>
                                          <td className="py-2">
                                            {sp.subproject_name || "—"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>

              {/* Summary footer */}
              <p className="text-xs text-slate-400 mt-4 text-right border-t border-slate-100 pt-2">
                Showing {filteredProjects.length} of{" "}
                {groupedData.projects.length} projects •{" "}
                {groupedData.subprojects.length} total subprojects
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProjectId && (
        <ProjectDetailModal
          projectId={selectedProjectId}
          team={selectedEmployee?.p_team?.toLowerCase()}
          onClose={() => setSelectedProjectId(null)}
          setSearchTerm={setSearchTerm}
        />
      )}
    </>
  );
}
