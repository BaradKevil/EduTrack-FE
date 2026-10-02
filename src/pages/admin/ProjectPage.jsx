/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProjects } from "../../store/slices/adminSlice";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import {
  Search, FolderOpen, User, ChevronDown, ChevronUp,
  FileText, CheckCircle, Eye, X,
  Mail, BookOpen, Paperclip, MessageSquare, Download
} from "lucide-react";

const StatusBadge = ({ status }) => {
  const map = {
    approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    pending:  "bg-amber-100 text-amber-700 border border-amber-200",
    rejected: "bg-red-100 text-red-700 border border-red-200",
    completed: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-gray-100 text-gray-600 border border-gray-200"}`}>
      {status || "Unknown"}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-4 p-5 bg-white border shadow-sm rounded-xl border-slate-100">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const ProjectDetailModal = ({ project, onClose, onDownloadSingle, onDownloadAll }) => {
  if (!project) return null;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "N/A";


  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{project.title || "Untitled Project"}</h2>
            <p className="text-sm text-slate-500 mt-0.5">Project Details</p>
          </div>
          <button onClick={onClose} className="p-2 transition-colors rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Student Info */}
          <div className="p-4 border rounded-xl bg-slate-50 border-slate-100">
            <p className="mb-3 text-xs font-semibold tracking-wider uppercase text-slate-400">Student</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <span className="text-sm font-bold text-blue-600">
                  {project.student?.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{project.student?.name || "N/A"}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Mail className="w-3 h-3" /> {project.student?.email || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-slate-400">Status</p>
            <StatusBadge status={project.status} />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-slate-400">Description</p>
            <p className="p-3 text-sm leading-relaxed border rounded-lg text-slate-700 bg-slate-50 border-slate-100">
              {project.description || "No description provided."}
            </p>
          </div>

          {/* Files */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                Files ({project.files?.length || 0})
              </p>
              {/* {(project.files?.length || 0) > 0 && (
                <button
                  type="button"
                  onClick={() => onDownloadAll(project)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download All Files
                </button>
              )} */}
            </div>
            {project.files?.length > 0 ? (
              <div className="space-y-2">
                {project.files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 border-slate-100">
                    <Paperclip className="flex-shrink-0 w-4 h-4 text-slate-400" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate text-slate-700">{file.originalName}</p>
                      <p className="text-xs text-slate-400">{formatDate(file.uploadedAt)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDownloadSingle(project._id, file)}
                      className="ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-slate-400">No files uploaded</p>
            )}
          </div>

          {/* Feedback */}
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-slate-400">
              Feedback ({project.feedback?.length || 0})
            </p>
            {project.feedback?.length > 0 ? (
              <div className="space-y-2">
                {project.feedback.map((fb, i) => (
                  <div key={i} className="p-3 border rounded-lg bg-slate-50 border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-slate-700">{fb.title || "Feedback"}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        fb.type === "positive" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      }`}>{fb.type}</span>
                    </div>
                    <p className="text-sm text-slate-600">{fb.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(fb.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-slate-400">No feedback yet</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const AdminProjects = () => {
  const dispatch = useDispatch();
  const { projects = [], isLoading } = useSelector((state) => state.admin);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const downloadSingleFile = async (projectId, file) => {
    try {
      const fileId = file?._id;
      if (!fileId) {
        toast.error("File id is missing");
        return;
      }

      const res = await axiosInstance.get(`/project/${projectId}/files/${fileId}/download`, {
        responseType: "blob",
      });

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.originalName || "downloaded-file";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download file");
    }
  };

  const downloadAllFiles = async (project) => {
    const files = project?.files || [];
    if (!files.length) {
      toast.info("No files available for this project");
      return;
    }

    for (const file of files) {
      // Sequential download so each file is fetched correctly with auth.
      // eslint-disable-next-line no-await-in-loop
      await downloadSingleFile(project._id, file);
    }
  };

  useEffect(() => {
    dispatch(getAllProjects());

    const intervalId = setInterval(() => {
      dispatch(getAllProjects());
    }, 3000);

    const refreshOnFocus = () => {
      dispatch(getAllProjects());
    };

    document.addEventListener("visibilitychange", refreshOnFocus);
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshOnFocus);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [dispatch]);

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "N/A";

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = projects
    .filter((p) => ["approved", "completed"].includes(String(p.status || "").toLowerCase()))
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch =
        p.title?.toLowerCase().includes(q) ||
        p.student?.name?.toLowerCase().includes(q) ||
        p.student?.email?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      let av = sortField === "createdAt" ? new Date(a.createdAt) : (a[sortField] || "");
      let bv = sortField === "createdAt" ? new Date(b.createdAt) : (b[sortField] || "");
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0; 
    });

  const stats = {
    total: projects.filter((p) => ["approved", "completed"].includes(String(p.status || "").toLowerCase())).length,
    approved: projects.filter(p => p.status === "approved").length,
    completed: projects.filter(p => p.status === "completed").length,
  };

  const SortIcon = ({ field }) => (
    <span className="inline-flex flex-col ml-1">
      {sortField === field
        ? sortDir === "asc"
          ? <ChevronUp className="w-3 h-3 text-blue-500" />
          : <ChevronDown className="w-3 h-3 text-blue-500" />
        : <ChevronDown className="w-3 h-3 text-slate-300" />}
    </span>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="p-6 text-white shadow-md rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
        <h1 className="mb-1 text-2xl font-bold">All Projects</h1>
        <p className="text-sm text-blue-100">View and manage all student project submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={FolderOpen} label="Total Projects" value={stats.total} color="bg-blue-100 text-blue-600" />
        <StatCard icon={CheckCircle} label="Approved" value={stats.approved} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="bg-blue-100 text-blue-600" />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 p-4 bg-white border shadow-sm border-slate-100 rounded-xl sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by project title or student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2 pr-4 text-sm border rounded-lg pl-9 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 text-sm bg-white border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
        >
          <option value="all">All</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white border shadow-sm border-slate-100 rounded-xl">
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 mx-auto mb-3 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />
            <p className="text-sm text-slate-400">Loading projects...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="text-sm text-slate-400">No projects found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th
                    className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort("title")}
                  >
                    Project Title <SortIcon field="title" />
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Files
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Feedback
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                    Download Files
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((project, index) => (
                  <tr key={project._id || index} className="transition-colors hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-xs font-bold text-blue-600">
                            {project.student?.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{project.student?.name || "N/A"}</p>
                          <p className="text-xs text-slate-400">{project.student?.email || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="mb-1">
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="font-medium text-slate-800 max-w-[180px] truncate">{project.title || "Untitled"}</p>
                      <p className="text-xs text-slate-400 max-w-[180px] truncate">{project.description || ""}</p>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm">{project.files?.length || 0}</span>
                      </div>
                    </td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm">{project.feedback?.length || 0}</span>
                      </div>
                    </td>
                    <td className="hidden px-5 py-4 lg:table-cell">
                      <button
                        type="button"
                        onClick={() => downloadAllFiles(project)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download All
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of{" "}
              <span className="font-semibold text-slate-600">{projects.length}</span> projects
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onDownloadSingle={downloadSingleFile}
          onDownloadAll={downloadAllFiles}
        />
      )}

    </div>
  );
};

export default AdminProjects;
