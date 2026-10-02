import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquare, CheckCircle, X, Loader, GraduationCap, Users, FolderOpen, ClipboardCheck, Clock3 } from "lucide-react";
import { addFeedback, getAssignedStudents, markComplete } from "../../store/slices/teacherSlice";

const normalizeStatus = (status) => String(status || "pending").toLowerCase();

const statusPillClass = {
    pending: "bg-amber-100 text-amber-700 border border-amber-300",
    approved: "bg-blue-100 text-blue-700 border border-blue-300",
    completed: "bg-emerald-100 text-emerald-700 border border-emerald-300",
    rejected: "bg-rose-100 text-rose-700 border border-rose-300",
};

const statusText = {
    pending: "Pending",
    approved: "Approved",
    completed: "Completed",
    rejected: "Rejected",
};

const ModalShell = ({ children, onClose }) => {
    if (typeof document === "undefined") return null;

    return createPortal(
    <div
        className="fixed inset-0 z-[1200] flex min-h-screen w-screen items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
    >
        <div
        className="w-full max-w-md bg-white shadow-2xl rounded-xl"
        onClick={(e) => e.stopPropagation()}
        >
        {children}
        </div>
    </div>,
    document.body
    );
};

const AssignedStudents = () => {
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    type: "general",
    });

    const dispatch = useDispatch();
    const { assignedStudents = [], loading, error } = useSelector((state) => state.teacher);

    useEffect(() => {
    dispatch(getAssignedStudents());

    const handleFocus = () => {
        dispatch(getAssignedStudents());
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleFocus);
    };
    }, [dispatch]);

    const closeModal = () => {
    setShowFeedbackModal(false);
    setShowCompleteModal(false);
    setSelectedStudent(null);
    setFeedbackData({ title: "", message: "", type: "general" });
    };

    const sortedStudents = useMemo(() => {
    return [...assignedStudents].sort((a, b) => {
        return (a.name || "").localeCompare(b.name || "");
    });
    }, [assignedStudents]);

    const stats = useMemo(() => {
    return [
        {
        label: "Total Students",
        value: sortedStudents.length,
        icon: Users,
        bg: "bg-white",
        iconWrap: "bg-blue-100",
        text: "text-blue-700",
        sub: "text-slate-700",
        },
        {
        label: "Total Projects",
        value: sortedStudents.filter((s) => s?.project?._id).length,
        icon: FolderOpen,
        bg: "bg-white",
        iconWrap: "bg-violet-100",
        text: "text-violet-700",
        sub: "text-slate-700",
        },
        {
        label: "Projects Completed",
        value: sortedStudents.filter((s) => normalizeStatus(s?.project?.status) === "completed").length,
        icon: ClipboardCheck,
        bg: "bg-white",
        iconWrap: "bg-emerald-100",
        text: "text-emerald-700",
        sub: "text-slate-700",
        },
        {
        label: "Awaiting Decision",
        value: sortedStudents.filter((s) => normalizeStatus(s?.project?.status) === "pending").length,
        icon: Clock3,
        bg: "bg-white",
        iconWrap: "bg-amber-100",
        text: "text-amber-700",
        sub: "text-slate-700",
        },
    ];
    }, [sortedStudents]);

    const handleFeedback = (student) => {
    setSelectedStudent(student);
    setFeedbackData({ title: "", message: "", type: "general" });
    setShowFeedbackModal(true);
    };

    const handleMarkComplete = (student) => {
    setSelectedStudent(student);
    setShowCompleteModal(true);
    };

    const submitFeedback = () => {
    if (selectedStudent?.project?._id && feedbackData.title && feedbackData.message) {
        dispatch(
        addFeedback({
            projectId: selectedStudent.project._id,
            payload: feedbackData,
        })
        );
        closeModal();
    }
    };

    const confirmMarkComplete = () => {
    if (selectedStudent?.project?._id) {
        dispatch(markComplete(selectedStudent.project._id));
        closeModal();
    }
    };

    if (loading) {
    return (
        <div className="flex min-h-[260px] items-center justify-center">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
    );
    }

    if (error) {
    return <div className="py-10 font-medium text-center text-red-600">Error loading assigned students.</div>;
    }

    return (
    <>
        <div className="space-y-6">
        <div className="card">
            <div className="card-header">
            <h1 className="flex items-center gap-2 card-title"><GraduationCap className="w-5 h-5 text-blue-600" /> Assigned Students</h1>
            <p className="card-subtitle">Manage and monitor your assigned students and their projects</p>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {sortedStudents.map((student) => {
            const status = normalizeStatus(student?.project?.status);
            const canComplete = status === "approved";
            const isCompleted = status === "completed";
            const hasProject = Boolean(student?.project?._id);

            return (
                <div key={student._id} className="transition-all duration-300 card hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                        <span className="font-semibold text-blue-600">
                        {student.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "S"}
                        </span>
                    </div>

                    <div>
                        <h3 className="font-semibold text-slate-800">{student.name}</h3>
                        <p className="text-sm text-slate-600">{student.email}</p>
                    </div>
                    </div>

                    <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusPillClass[status] || statusPillClass.pending
                    }`}
                    >
                    {statusText[status] || statusText.pending}
                    </span>
                </div>

                <div className="mb-5">
                    <h4 className="mb-1 font-medium text-slate-700">{student?.project?.title || "No project title"}</h4>
                    <p className="text-xs text-slate-500">
                    Last Update: {new Date(student?.project?.updatedAt || new Date()).toLocaleDateString()}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                    onClick={() => handleFeedback(student)}
                    disabled={!hasProject}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                    <MessageSquare className="w-4 h-4" />
                    Feedback
                    </button>

                    {canComplete && (
                    <button
                        onClick={() => handleMarkComplete(student)}
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-700"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Mark Complete
                    </button>
                    )}

                    {isCompleted && (
                    <button
                        disabled
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg cursor-not-allowed bg-emerald-200 text-emerald-800"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Completed
                    </button>
                    )}

                    {!canComplete && !isCompleted && (
                    <button
                        disabled
                        className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg cursor-not-allowed bg-slate-200 text-slate-600"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Awaiting Approval
                    </button>
                    )}
                </div>
                </div>
            );
            })}

            {sortedStudents.length === 0 && (
            <div className="py-10 text-center card text-slate-600">No students assigned yet.</div>
            )}
        </div>
        </div>

        {showFeedbackModal && selectedStudent && (
        <ModalShell onClose={closeModal}>
            <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Provide Feedback</h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-4 mb-6 rounded-lg bg-slate-50">
                <div className="space-y-2 text-sm">
                <div>
                    <span className="font-medium text-slate-600">Project:</span>
                    <span className="ml-2 text-slate-800">{selectedStudent?.project?.title || "No project title"}</span>
                </div>
                <div>
                    <span className="font-medium text-slate-600">Student:</span>
                    <span className="ml-2 text-slate-800">{selectedStudent?.name || "No student name"}</span>
                </div>
                <div>
                    <span className="font-medium text-slate-600">Last Updated:</span>
                    <span className="ml-2 text-slate-800">
                    {new Date(selectedStudent?.project?.updatedAt || new Date()).toLocaleString()}
                    </span>
                </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Feedback Title</label>
                <input
                    type="text"
                    value={feedbackData.title}
                    onChange={(e) => setFeedbackData({ ...feedbackData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter feedback title"
                />
                </div>

                <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Feedback Type</label>
                <select
                    value={feedbackData.type}
                    onChange={(e) => setFeedbackData({ ...feedbackData, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                    <option value="general">General</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                </select>
                </div>

                <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Feedback Message</label>
                <textarea
                    value={feedbackData.message}
                    onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg resize-none border-slate-300 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter feedback message..."
                    rows={4}
                />
                </div>
            </div>

            <div className="flex gap-3 mt-6">
                <button onClick={closeModal} className="btn-danger">
                Cancel
                </button>
                <button
                className="btn-primary"
                onClick={submitFeedback}
                disabled={!feedbackData.title || !feedbackData.message}
                >
                Submit Feedback
                </button>
            </div>
            </div>
        </ModalShell>
        )}

        {showCompleteModal && selectedStudent && (
        <ModalShell onClose={closeModal}>
            <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Mark Complete</h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-4 mb-6 rounded-lg bg-slate-50">
                <div className="space-y-2 text-sm">
                <div>
                    <span className="font-medium text-slate-600">Student:</span>
                    <span className="ml-2 text-slate-800">{selectedStudent?.name}</span>
                </div>
                <div>
                    <span className="font-medium text-slate-600">Project:</span>
                    <span className="ml-2 text-slate-800">{selectedStudent?.project?.title || "No title"}</span>
                </div>
                <div>
                    <span className="font-medium text-slate-600">Current Status:</span>
                    <span className="ml-2 text-slate-800">
                    {statusText[normalizeStatus(selectedStudent?.project?.status)] || "Pending"}
                    </span>
                </div>
                </div>
            </div>

            <p className="mb-6 text-slate-600">Are you sure you want to mark this project as complete?</p>
            <div className="flex gap-3">
                <button onClick={closeModal} className="btn-danger">
                Cancel
                </button>
                <button onClick={confirmMarkComplete} className="btn-primary">
                Mark As Completed
                </button>
            </div>
            </div>
        </ModalShell>
        )}
    </>
    );
};

export default AssignedStudents;
