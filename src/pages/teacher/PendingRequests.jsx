import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { FileText, X, Clock3, UserRound, Mail, CalendarDays } from "lucide-react";
import {
    acceptProjectRequest,
    getTeacherRequests,
    rejectProjectRequest,
} from "../../store/slices/teacherSlice";

const normalizeStatus = (status) => String(status || "pending").toLowerCase();

const statusTheme = {
    pending: {
    card: "bg-amber-50 border-amber-300",
    chip: "bg-amber-100 text-amber-800 border border-amber-300",
    text: "Awaiting Review",
    },
    approved: {
    card: "bg-blue-50 border-blue-300",
    chip: "bg-blue-100 text-blue-800 border border-blue-300",
    text: "Approved",
    },
    completed: {
    card: "bg-emerald-50 border-emerald-300",
    chip: "bg-emerald-100 text-emerald-800 border border-emerald-300",
    text: "Completed",
    },
    rejected: {
    card: "bg-rose-50 border-rose-300",
    chip: "bg-rose-100 text-rose-800 border border-rose-300",
    text: "Rejected",
    },
};

const RequestDetailModal = ({ request, onClose }) => {
    if (!request || typeof document === "undefined") return null;

    const project = request?.latestProject || request;
    const displayStatus = normalizeStatus(project?.status || request?.status);
    const theme = statusTheme[displayStatus] || statusTheme.pending;

    return createPortal(
    <div
        className="fixed inset-0 z-[1200] flex min-h-screen w-screen items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
        className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        >
        <div className="p-6 border-b border-slate-200">
            <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Project Proposal</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{project?.title || "Untitled Project"}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="w-5 h-5" />
            </button>
            </div>

            <div className="mt-4">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${theme.chip}`}>
                {theme.text}
            </span>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
            <div className="p-4 rounded-xl bg-slate-50">
            <p className="mb-3 text-sm font-semibold text-slate-700">Student</p>
            <div className="space-y-2 text-sm text-slate-700">
                <p className="flex items-center gap-2"><UserRound className="w-4 h-4" /> {request?.student?.name || "Unknown Student"}</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {request?.student?.email || "Not available"}</p>
            </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50">
            <p className="mb-3 text-sm font-semibold text-slate-700">Submission</p>
            <div className="space-y-2 text-sm text-slate-700">
                <p className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : "-"}
                </p>
                <p className="flex items-center gap-2">
                <Clock3 className="w-4 h-4" />
                {project?.createdAt ? new Date(project.createdAt).toLocaleTimeString() : "-"}
                </p>
                <p className="flex items-center gap-2">
                <Clock3 className="w-4 h-4" />
                Last Updated: {project?.updatedAt ? new Date(project.updatedAt).toLocaleString() : "-"}
                </p>
            </div>
            </div>
        </div>

        <div className="px-6 pb-6">
            <div className="p-4 border rounded-xl border-slate-200">
            <p className="mb-3 text-sm font-semibold text-slate-700">Description</p>
            <p className="text-sm leading-6 whitespace-pre-wrap text-slate-700">
                {project?.description || "No project description provided."}
            </p>
            </div>

        </div>
        </div>
    </div>,
    document.body
    );
};

const PendingRequests = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [loadingMap, setLoadingMap] = useState({});
    const [selectedRequest, setSelectedRequest] = useState(null);

    const dispatch = useDispatch();
    const { pendingRequests = [] } = useSelector((state) => state.teacher);
    const { authUser } = useSelector((state) => state.auth);

    useEffect(() => {
    if (authUser?._id) {
        dispatch(getTeacherRequests());
    }
    }, [dispatch, authUser?._id]);

    const setLoading = (id, key, value) => {
    setLoadingMap((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || {}), [key]: value },
    }));
    };

    const handleAccept = async (request) => {
    const id = request._id;
    setLoading(id, "accepting", true);

    try {
        await dispatch(acceptProjectRequest(id)).unwrap();
    } catch (error) {
        console.error("Accept request failed:", error);
    } finally {
        setLoading(id, "accepting", false);
    }
    };

    const handleReject = async (request) => {
    const id = request._id;
    setLoading(id, "rejecting", true);

    try {
        await dispatch(rejectProjectRequest(id)).unwrap();
    } catch (error) {
        console.error("Reject request failed:", error);
    } finally {
        setLoading(id, "rejecting", false);
    }
    };

    const filteredRequests = useMemo(() => {
    return (pendingRequests || []).filter((request) => {
        const project = request?.latestProject || request;
        const normalizedStatus = normalizeStatus(project?.status || request?.status);
        const searchText = searchTerm.toLowerCase();

        const matchesSearch =
        (request?.student?.name || "").toLowerCase().includes(searchText) ||
        (project?.title || "").toLowerCase().includes(searchText);

        const matchesStatus = filterStatus === "all" || normalizedStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });
    }, [pendingRequests, searchTerm, filterStatus]);

    return (
    <>
        <div className="space-y-6">
        <div className="card">
            <div className="card-header">
            <h1 className="card-title">Project Review Queue</h1>
            <p className="card-subtitle">Review proposals, track approvals, and monitor completed projects</p>
            </div>

            <div className="flex flex-col gap-4 mb-6 md:flex-row">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or project title..."
                className="flex-1 w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
                className="px-4 py-2 bg-white border rounded-lg border-slate-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
            </select>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredRequests.map((req) => {
            const id = req._id;
            const project = req?.latestProject || req;
            const displayStatus = normalizeStatus(project?.status || req?.status);
            const theme = statusTheme[displayStatus] || statusTheme.pending;
            const canAccept = displayStatus === "pending";
            const lm = loadingMap[id] || {};

            return (
                <div key={id} className={`card h-full border ${theme.card} transition-all`}>
                <div className="flex flex-col justify-between h-full">
                    <button
                    onClick={() => setSelectedRequest(req)}
                    className="text-left"
                    >
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-800">{req?.student?.name || "Unknown Student"}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme.chip}`}>{theme.text}</span>
                    </div>

                    <p className="mb-2 text-sm text-slate-600">{req?.student?.email || "Email not available"}</p>
                    <h4 className="mb-2 font-medium text-slate-700">{project?.title || "Project title not available"}</h4>
                    <p className="text-xs text-slate-500">
                        Submitted: {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : "-"}
                    </p>
                    <p className="mt-2 text-xs text-blue-700 underline decoration-dotted underline-offset-2">
                        Click to view full details
                    </p>
                    </button>

                    {displayStatus === "pending" && (
                    <div className="flex items-center gap-3 mt-4">
                        <button
                        className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                            canAccept ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-300 text-gray-500"
                        }`}
                        disabled={lm.accepting || !canAccept}
                        onClick={() => handleAccept(req)}
                        >
                        {lm.accepting ? "Accepting..." : "Accept"}
                        </button>

                        <button
                        className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={lm.rejecting || lm.accepting}
                        onClick={() => handleReject(req)}
                        >
                        {lm.rejecting ? "Rejecting..." : "Reject"}
                        </button>
                    </div>
                    )}
                </div>
                </div>
            );
            })}

            {filteredRequests.length === 0 && (
            <div className="py-8 text-center card md:col-span-2 xl:col-span-3">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="mb-2 text-lg font-medium text-slate-800">No Requests Found</h3>
                <p className="text-slate-600">No project requests match your filters.</p>
            </div>
            )}
        </div>
        </div>

        <RequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
    </>
    );
};

export default PendingRequests;
