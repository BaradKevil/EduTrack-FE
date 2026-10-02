import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import {Files,Eye,Download,UserRound,FolderOpen,BadgeCheck,Clock3,FileText,FileImage,FileArchive,
    FileCode2,File,X,Users,Presentation,} from "lucide-react";
import { downloadPanelFile, getAssignedStudents, getFiles } from "../../store/slices/teacherSlice";

const normalizeStatus = (status) => String(status || "pending").toLowerCase();

const statusClass = {
    pending: "bg-amber-100 text-amber-800 border border-amber-300",
    approved: "bg-sky-200 text-sky-900 border border-sky-300",
    completed: "bg-lime-200 text-lime-900 border border-lime-300",
    rejected: "bg-rose-100 text-rose-800 border border-rose-300",
};

const fileCategory = (name = "") => {
    const ext = String(name).split(".").pop()?.toLowerCase() || "";
    if (["pdf", "doc", "docx", "txt"].includes(ext)) return { type: ext.toUpperCase(), icon: FileText };
    if (["jpg", "jpeg", "png", "gif", "webp", "avif"].includes(ext)) return { type: ext.toUpperCase(), icon: FileImage };
    if (["zip", "rar", "7z"].includes(ext)) return { type: ext.toUpperCase(), icon: FileArchive };
    if (["js", "ts", "json", "html", "css"].includes(ext)) return { type: ext.toUpperCase(), icon: FileCode2 };
    return { type: ext ? ext.toUpperCase() : "FILE", icon: File };
};

const getFileGroup = (name = "") => {
    const ext = String(name).split(".").pop()?.toLowerCase() || "";
    if (["doc", "docx", "pdf", "txt"].includes(ext)) return "report";
    if (["ppt", "pptx"].includes(ext)) return "presentation";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "code";
    return "other";
};

const getStatusSortRank = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "approved") return 0;
    if (normalized === "completed") return 1;
    return 2;
};

const DetailsModal = ({ row, onClose, onDownloadOne, onDownloadAll }) => {
    if (!row || typeof document === "undefined") return null;

    return createPortal(
    <div
        className="fixed inset-0 z-[1200] flex min-h-screen w-screen items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
        className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        >
        <div className="p-5 border-b border-slate-200">
            <div className="flex items-start justify-between gap-4">
            <div>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                <FolderOpen className="w-5 h-5 text-blue-600" /> Project Details
                </h2>
                <p className="mt-1 text-sm text-slate-600">{row.projectTitle || "Untitled Project"}</p>
            </div>

            <button
                onClick={onClose}
                className="p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
                <X className="w-5 h-5" />
            </button>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-4 md:grid-cols-3">
            <p className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-slate-50 text-slate-700">
                <UserRound className="w-4 h-4" /> {row.studentName}
            </p>
            <p className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-slate-50 text-slate-700">
                <Clock3 className="w-4 h-4" />
                {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "-"}
            </p>
            <p className="px-3 py-2 text-sm rounded-lg bg-slate-50 text-slate-700">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass[row.status] || statusClass.pending}`}>
                {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                </span>
            </p>
            </div>

            <div className="mt-4">
            <button
                onClick={() => onDownloadAll(row)}
                disabled={row.files.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <Download className="w-4 h-4" /> Download All
            </button>
            </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-5">
            <div className="overflow-x-auto border rounded-xl border-slate-200">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-slate-700">
                <tr>
                    <th className="px-4 py-3 font-semibold text-left">File</th>
                    <th className="px-4 py-3 font-semibold text-left">Type</th>
                    <th className="px-4 py-3 font-semibold text-left">Uploaded</th>
                    <th className="px-4 py-3 font-semibold text-left">Action</th>
                </tr>
                </thead>
                <tbody>
                {row.files.map((f) => {
                    const meta = fileCategory(f.name);
                    const Icon = meta.icon;
                    return (
                    <tr key={f.fileId} className="border-t border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-3">
                        <span className="flex items-center gap-2 font-medium text-slate-800">
                            <Icon className="w-4 h-4 text-slate-600" />
                            {f.name}
                        </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{meta.type}</td>
                        <td className="px-4 py-3 text-slate-700">{f.uploadedAt ? new Date(f.uploadedAt).toLocaleString() : "-"}</td>
                        <td className="px-4 py-3">
                        <button
                            onClick={() => onDownloadOne(row, f)}
                            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                            <Download className="h-3.5 w-3.5" /> Download
                        </button>
                        </td>
                    </tr>
                    );
                })}

                {row.files.length === 0 && (
                    <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                        No files available for this project.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    </div>,
    document.body
    );
};

const TeacherFiles = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRow, setSelectedRow] = useState(null);

    const dispatch = useDispatch();
    const filesFromStore = useSelector((state) => state.teacher.files);
    const assignedStudents = useSelector((state) => state.teacher.assignedStudents);

    useEffect(() => {
    dispatch(getFiles());
    dispatch(getAssignedStudents());
    }, [dispatch]);

    const filesByProjectId = useMemo(() => {
    const map = new Map();

    for (const raw of filesFromStore || []) {
        const projectId = String(raw?.projectId || "");
        if (!projectId) continue;

        if (!map.has(projectId)) {
        map.set(projectId, {
            projectId,
            projectTitle: raw.projectTitle || "Untitled Project",
            studentName: raw.studentName || "Unknown Student",
            status: normalizeStatus(raw.projectStatus),
            updatedAt: raw.projectUpdatedAt || raw.uploadedAt || raw.createdAt || null,
            files: [],
        });
        }

        const bucket = map.get(projectId);
        bucket.files.push({
        fileId: raw.fileId || raw._id,
        name: raw.originalName || "unknown",
        uploadedAt: raw.uploadedAt || raw.createdAt,
        });

        if (!bucket.updatedAt || new Date(raw.uploadedAt || raw.createdAt || 0) > new Date(bucket.updatedAt || 0)) {
        bucket.updatedAt = raw.uploadedAt || raw.createdAt || bucket.updatedAt;
        }
    }

    return map;
    }, [filesFromStore]);

    const groupedRows = useMemo(() => {
    const rows = [];
    const seenProjectIds = new Set();

    for (const student of assignedStudents || []) {
        const project = student?.project;
        const projectId = String(project?._id || "");
        const status = normalizeStatus(project?.status);

        if (!projectId) continue;
        if (!["approved", "completed"].includes(status)) continue;

        const fileBucket = filesByProjectId.get(projectId);
        rows.push({
        projectId,
        projectTitle: project?.title || fileBucket?.projectTitle || "Untitled Project",
        studentName: student?.name || fileBucket?.studentName || "Unknown Student",
        status,
        updatedAt: project?.updatedAt || fileBucket?.updatedAt || null,
        files: fileBucket?.files || [],
        });
        seenProjectIds.add(projectId);
    }

    for (const [projectId, bucket] of filesByProjectId.entries()) {
        if (seenProjectIds.has(projectId)) continue;

        const status = normalizeStatus(bucket?.status);
        if (!["approved", "completed"].includes(status)) continue;

        rows.push({
        projectId,
        projectTitle: bucket?.projectTitle || "Untitled Project",
        studentName: bucket?.studentName || "Unknown Student",
        status,
        updatedAt: bucket?.updatedAt || null,
        files: bucket?.files || [],
        });
    }

    return rows.sort((a, b) => {
        const rankDiff = getStatusSortRank(a.status) - getStatusSortRank(b.status);
        if (rankDiff !== 0) return rankDiff;
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
    }, [assignedStudents, filesByProjectId]);

    const filteredRows = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return groupedRows.filter((row) => {
        return (
        row.studentName.toLowerCase().includes(term) ||
        row.projectTitle.toLowerCase().includes(term)
        );
    });
    }, [groupedRows, searchTerm]);

    const stats = useMemo(() => {
    const totalStudents = new Set(groupedRows.map((row) => row.studentName)).size;
    const totalProjects = groupedRows.length;
    let reportFiles = 0;
    let presentationFiles = 0;
    let codeFiles = 0;

    for (const row of groupedRows) {
        for (const file of row.files) {
        const type = getFileGroup(file.name);
        if (type === "report") reportFiles += 1;
        if (type === "presentation") presentationFiles += 1;
        if (type === "code") codeFiles += 1;
        }
    }

    return [
        {
        label: "Total Students",
        value: totalStudents,
        icon: Users,
        bg: "bg-white",
        iconWrap: "bg-blue-100",
        text: "text-blue-700",
        sub: "text-slate-700",
        },
        {
        label: "Total Projects",
        value: totalProjects,
        icon: FolderOpen,
        bg: "bg-white",
        iconWrap: "bg-violet-100",
        text: "text-violet-700",
        sub: "text-slate-700",
        },
        {
        label: "Report Files",
        value: reportFiles,
        icon: FileText,
        bg: "bg-white",
        iconWrap: "bg-emerald-100",
        text: "text-emerald-700",
        sub: "text-slate-700",
        },
        {
        label: "Presentation",
        value: presentationFiles,
        icon: Presentation,
        bg: "bg-white",
        iconWrap: "bg-amber-100",
        text: "text-amber-700",
        sub: "text-slate-700",
        },
        {
        label: "Code Files",
        value: codeFiles,
        icon: FileCode2,
        bg: "bg-white",
        iconWrap: "bg-cyan-100",
        text: "text-cyan-700",
        sub: "text-slate-700",
        },
    ];
    }, [groupedRows]);

    const downloadOne = async (row, file) => {
    const result = await dispatch(downloadPanelFile({ projectId: row.projectId, fileId: file.fileId }));
    const blob = result?.payload?.blob;
    if (!blob) return;

    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", file.name || "download");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    };

    const downloadAll = async (row) => {
    for (const file of row.files) {
      // Sequential to keep downloads predictable for users/browsers.
        await downloadOne(row, file);
    }
    };

    return (
    <>
        <div className="space-y-6">
        <div className="card">
            <div className="card-header">
            <h1 className="flex items-center gap-2 card-title">
                <Files className="w-5 h-5 text-blue-600" />
                Student Files
            </h1>
            <p className="card-subtitle">Simple table view of files submitted by students</p>
            </div>

            <div className="mb-4">
            <input
                type="text"
                className="input w-full md:w-[420px]"
                placeholder="Search by student or project title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {stats.map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl border border-slate-200 p-4`}>
                <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${item.iconWrap}`}>
                    <item.icon className={`h-5 w-5 ${item.text}`} />
                    </div>
                    <div className="min-w-0">
                    <p className={`text-sm font-medium ${item.sub}`}>{item.label}</p>
                    <p className={`text-lg font-semibold ${item.text}`}>{item.value}</p>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>

        <div className="overflow-x-auto card">
            <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
                <tr>
                <th className="px-4 py-3 font-semibold text-left">Student Name</th>
                <th className="px-4 py-3 font-semibold text-left">Project Title</th>
                <th className="px-4 py-3 font-semibold text-left">Status</th>
                <th className="px-4 py-3 font-semibold text-left">Total Files</th>
                <th className="px-4 py-3 font-semibold text-left">Download All</th>
                <th className="px-4 py-3 font-semibold text-left">View</th>
                </tr>
            </thead>
            <tbody>
                {filteredRows.map((row) => (
                <tr key={row.projectId} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{row.studentName}</td>
                    <td className="px-4 py-3 text-slate-700">{row.projectTitle}</td>
                    <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[row.status] || statusClass.pending}`}>
                        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{row.files.length}</td>
                    <td className="px-4 py-3">
                    <button
                        onClick={() => downloadAll(row)}
                        disabled={row.files.length === 0}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Download className="h-3.5 w-3.5" /> All Files
                    </button>
                    </td>
                    <td className="px-4 py-3">
                    <button
                        onClick={() => setSelectedRow(row)}
                        className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                        <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    </td>
                </tr>
                ))}

                {filteredRows.length === 0 && (
                <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No project files found.
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
        </div>

        <DetailsModal
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
        onDownloadOne={downloadOne}
        onDownloadAll={downloadAll}
        />
    </>
    );
};

export default TeacherFiles;
