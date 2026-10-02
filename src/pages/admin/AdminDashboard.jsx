/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";
import {
  getAllPanels,
  getAllProjects,
  getAllUsers,
  getDashboardStats,
  sendFeedbackToPanel,
  sendFeedbackToStudent,
} from "../../store/slices/adminSlice";
import { getNotifications } from "../../store/slices/notificationSlice";
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  FolderKanban,
  User,
  Users,
} from "lucide-react";


const AdminDashboard = () => {
  const { isCreateStudentModalOpen, isCreateTeacherModalOpen } = useSelector((s) => s.popup);
  const { stats, projects, users, panels } = useSelector((s) => s.admin);
  const notifications = useSelector((s) => s.notification?.list || []);
  const dispatch = useDispatch();

  const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({
    type: "general",
    title: "",
    description: "",
  });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [panelSearch, setPanelSearch] = useState("");
  const [panelDepartmentFilter, setPanelDepartmentFilter] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentDepartmentFilter, setStudentDepartmentFilter] = useState("all");

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getNotifications());
    dispatch(getAllProjects());
    dispatch(getAllUsers());
    dispatch(getAllPanels());
  }, [dispatch]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(getNotifications());
      dispatch(getAllProjects());
      dispatch(getDashboardStats());
      dispatch(getAllUsers());
      dispatch(getAllPanels());
    }, 3000);

    const handleVisibilityOrFocus = () => {
      dispatch(getNotifications());
      dispatch(getAllProjects());
      dispatch(getDashboardStats());
      dispatch(getAllUsers());
      dispatch(getAllPanels());
    };
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
    };
  }, [dispatch]);

  const studentProjectMap = useMemo(() => {
    const map = new Map();
    (projects || []).forEach((project) => {
      const studentId =
        typeof project?.student === "string"
          ? project.student
          : project?.student?._id;
      if (studentId && !map.has(String(studentId))) {
        map.set(String(studentId), project);
      }
    });
    return map;
  }, [projects]);

  const studentList = useMemo(() => {
    return (users || [])
      .filter((user) => String(user?.role || "").toLowerCase() === "student")
      .map((student) => {
        const project = studentProjectMap.get(String(student._id));
        return {
          ...student,
          projectId: project?._id || null,
          projectTitle: project?.title || null,
          projectStatus: project?.status || null,
        };
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [users, studentProjectMap]);

  const panelList = useMemo(() => {
    return [...(panels || [])].sort((a, b) => (a.panelName || "").localeCompare(b.panelName || ""));
  }, [panels]);

  const panelDepartments = useMemo(() => {
    return [...new Set(panelList.map((panel) => panel?.department).filter(Boolean))].sort();
  }, [panelList]);

  const studentDepartments = useMemo(() => {
    return [...new Set(studentList.map((student) => student?.department).filter(Boolean))].sort();
  }, [studentList]);

  const filteredPanels = useMemo(() => {
    const q = panelSearch.trim().toLowerCase();
    return panelList.filter((panel) => {
      const panelName = String(panel?.panelName || "").toLowerCase();
      const teacherNames = (panel?.teachers || [])
        .map((teacher) => String(teacher?.name || "").toLowerCase())
        .join(" ");
      const matchesSearch = !q || panelName.includes(q) || teacherNames.includes(q);
      const matchesDepartment =
        panelDepartmentFilter === "all" || String(panel?.department || "") === panelDepartmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [panelList, panelSearch, panelDepartmentFilter]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return studentList.filter((student) => {
      const haystack = [student?.name, student?.email, student?.projectTitle]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesDepartment =
        studentDepartmentFilter === "all" || String(student?.department || "") === studentDepartmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [studentList, studentSearch, studentDepartmentFilter]);

  const feedbackStats = useMemo(() => {
    const totalStudents = studentList.length;
    const studentsWithProjects = studentList.filter((student) => Boolean(student.projectId)).length;
    return {
      totalPanels: panelList.length,
      totalStudents,
      studentsWithProjects,
    };
  }, [panelList, studentList]);

  const projectTableRows = useMemo(() => {
    return (projects || []).map((project) => {
      const student = project?.student || {};
      const panel = project?.panel || student?.panel || {};
      const teachers = Array.isArray(panel?.teachers)
        ? panel.teachers
            .map((teacher) => (typeof teacher === "string" ? "" : teacher?.name))
            .filter(Boolean)
        : [];

      return {
        id: project?._id,
        studentName: student?.name || "-",
        title: project?.title || "-",
        panelName: panel?.panelName || "Not Assigned",
        teachers,
        status: String(project?.status || "pending").toLowerCase(),
      };
    });
  }, [projects]);

  const getStatusBadgeClasses = (status) => {
    if (status === "completed") return "bg-emerald-100 text-emerald-700";
    if (status === "approved") return "bg-green-100 text-green-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  const resetFeedbackForm = () => {
    setFeedbackForm({
      type: "general",
      title: "",
      description: "",
    });
  };

  const openPanelFeedbackModal = (panel) => {
    setFeedbackTarget({
      kind: "panel",
      id: panel._id,
      name: panel.panelName || "Panel",
    });
    resetFeedbackForm();
    setIsPanelModalOpen(false);
    setIsFeedbackModalOpen(true);
  };

  const openAllPanelsFeedbackModal = () => {
    if (panelList.length === 0) {
      toast.error("No panels found");
      return;
    }

    setFeedbackTarget({
      kind: "all-panels",
      ids: panelList.map((panel) => panel._id),
      name: `All Panels (${panelList.length})`,
    });
    resetFeedbackForm();
    setIsPanelModalOpen(false);
    setIsFeedbackModalOpen(true);
  };

  const openStudentFeedbackModal = (student) => {
    if (!student.projectId) {
      toast.error("This student does not have a project yet");
      return;
    }

    setFeedbackTarget({
      kind: "student",
      id: student._id,
      name: student.name || "Student",
      projectTitle: student.projectTitle || "",
    });
    resetFeedbackForm();
    setIsStudentModalOpen(false);
    setIsFeedbackModalOpen(true);
  };

  const openAllStudentsFeedbackModal = () => {
    const studentIdsWithProject = studentList
      .filter((student) => Boolean(student.projectId))
      .map((student) => student._id);

    if (studentIdsWithProject.length === 0) {
      toast.error("No students with projects found");
      return;
    }

    setFeedbackTarget({
      kind: "all-students",
      ids: studentIdsWithProject,
      name: `All Students (${studentIdsWithProject.length})`,
    });
    resetFeedbackForm();
    setIsStudentModalOpen(false);
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackTarget(null);
    resetFeedbackForm();
  };

  const handleSendFeedback = async () => {
    const hasSingleTarget = Boolean(feedbackTarget?.id);
    const hasBulkTargets = Array.isArray(feedbackTarget?.ids) && feedbackTarget.ids.length > 0;

    if (!hasSingleTarget && !hasBulkTargets) {
      toast.error("Please select a target first");
      return;
    }

    if (!feedbackForm.title.trim() || !feedbackForm.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const payload = {
        type: feedbackForm.type,
        title: feedbackForm.title.trim(),
        description: feedbackForm.description.trim(),
      };

      if (feedbackTarget.kind === "panel") {
        await dispatch(sendFeedbackToPanel({ panelId: feedbackTarget.id, payload })).unwrap();
      } else if (feedbackTarget.kind === "student") {
        await dispatch(sendFeedbackToStudent({ studentId: feedbackTarget.id, payload })).unwrap();
      } else if (feedbackTarget.kind === "all-panels") {
        const results = await Promise.allSettled(
          (feedbackTarget.ids || []).map((panelId) =>
            axiosInstance.post(`/admin/feedback/panel/${panelId}`, payload)
          )
        );
        const sent = results.filter((result) => result.status === "fulfilled").length;
        const failed = results.length - sent;
        toast.success(`Feedback sent to ${sent} panel(s)${failed ? `, ${failed} failed` : ""}`);
      } else if (feedbackTarget.kind === "all-students") {
        const results = await Promise.allSettled(
          (feedbackTarget.ids || []).map((studentId) =>
            axiosInstance.post(`/admin/feedback/student/${studentId}`, payload)
          )
        );
        const sent = results.filter((result) => result.status === "fulfilled").length;
        const failed = results.length - sent;
        toast.success(`Feedback sent to ${sent} student(s)${failed ? `, ${failed} failed` : ""}`);
      }

      closeFeedbackModal();
      dispatch(getNotifications());
      dispatch(getAllProjects());
    } catch (error) {
      // Error toasts are already handled in thunks.
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const notificationStyles = (notification) => {
    const normalized = String(notification?.type || "").toLowerCase();
    const priority = String(notification?.priority || "").toLowerCase();
    if (normalized === "approval") {
      return {
        card: "bg-green-50 border-l-4 border-green-400",
        chip: "bg-green-100 text-green-700",
      };
    }
    if (normalized === "rejection") {
      return {
        card: "bg-red-50 border-l-4 border-red-400",
        chip: "bg-red-100 text-red-700",
      };
    }
    if (normalized === "delete") {
      return {
        card: "bg-red-100 border-l-4 border-red-500",
        chip: "bg-red-200 text-red-800",
      };
    }
    if (normalized === "request") {
      return {
        card: "bg-blue-50 border-l-4 border-blue-400",
        chip: "bg-blue-100 text-blue-700",
      };
    }
    if (normalized === "feedback") {
      if (priority === "high") {
        return {
          card: "bg-rose-50 border-l-4 border-rose-400",
          chip: "bg-rose-100 text-rose-700",
        };
      }
      if (priority === "low") {
        return {
          card: "bg-emerald-50 border-l-4 border-emerald-400",
          chip: "bg-emerald-100 text-emerald-700",
        };
      }
      return {
        card: "bg-cyan-50 border-l-4 border-cyan-400",
        chip: "bg-cyan-100 text-cyan-700",
      };
    }

    if (priority === "high") {
      return {
        card: "bg-rose-50 border-l-4 border-rose-400",
        chip: "bg-rose-100 text-rose-700",
      };
    }
    if (priority === "low") {
      return {
        card: "bg-emerald-50 border-l-4 border-emerald-400",
        chip: "bg-emerald-100 text-emerald-700",
      };
    }
    if (priority === "medium") {
      return {
        card: "bg-amber-50 border-l-4 border-amber-400",
        chip: "bg-amber-100 text-amber-700",
      };
    }

    return {
      card: "bg-slate-50 border-l-4 border-slate-300",
      chip: "bg-slate-100 text-slate-700",
    };
  };

  const getNotificationChipLabel = (notification) => {
    const normalized = String(notification?.type || "").toLowerCase();
    const priority = String(notification?.priority || "").toLowerCase();

    if (normalized === "feedback") {
      if (priority === "high") return "negative";
      if (priority === "low") return "positive";
      return "general";
    }

    return normalized || "general";
  };

  const displayedNotifications = useMemo(() => {
    return (notifications || []).slice(0, 15);
  }, [notifications]);

  const getNotificationViewModel = (notification) => {
    const rawMessage = String(notification?.message || "").trim();
    const sender = notification?.sender || {};
    const senderName = String(sender?.name || "").trim();
    const senderEmail = String(sender?.email || "").trim();
    const senderRole = String(sender?.role || "").trim();
    const senderPanelName = String(sender?.panelName || "").trim();

    let senderHeadline = String(notification?.senderLine || "").trim();
    let messageText = rawMessage;

    if (!senderHeadline && rawMessage.includes("\n")) {
      const [firstLine, ...rest] = rawMessage.split("\n");
      if (/^(general message from|message from)/i.test(firstLine.trim())) {
        senderHeadline = firstLine.trim();
        const tail = rest.join("\n").trim();
        if (tail) messageText = tail;
      }
    }

    if (!senderHeadline) {
      const inlineMatch = rawMessage.match(
        /^((?:general message from|message from)\s+.+?\(.+?\)(?:\s+to\s+.+?)?)\s+([\s\S]*)$/i
      );
      if (inlineMatch) {
        senderHeadline = inlineMatch[1].trim();
        const tail = inlineMatch[2].trim();
        if (tail) messageText = tail;
      }
    }

    if (!senderHeadline && senderName) {
      senderHeadline = `Message from ${senderName}${senderEmail ? ` (${senderEmail})` : ""}`;
    }

    const fallbackSenderName = (() => {
      const match = senderHeadline.match(/message from\s+(.+?)\s*\(/i);
      return match ? match[1].trim() : "";
    })();

    const panelNameFromLine = (() => {
      const match = senderHeadline.match(/\bto\s+(.+)$/i);
      return match ? match[1].trim() : "";
    })();

    const fromValue = (() => {
      if (senderRole.toLowerCase() === "admin") return `Admin (${senderName || "Unknown"})`;
      if (senderRole.toLowerCase() === "teacher")
        return `${senderPanelName || panelNameFromLine || "Panel"} (${senderName || "Unknown"})`; 
      if (senderRole.toLowerCase() === "student")
        return `Student (${senderPanelName || panelNameFromLine || senderName || "Unknown"})`;
      if (fallbackSenderName) return `${panelNameFromLine || "Panel"} (${fallbackSenderName})`;
      return senderName || "Unknown";
    })();

    return {
      messageText: messageText || "-",
      fromValue,
    };
  };

const statCards = [
  {
    label: "Total Students",
    value: stats?.totalStudents ?? "0",
    icon: Users,
    iconWrap: "bg-blue-100 text-blue-600",
  },
  {
    label: "Total Panels",
    value: stats?.totalPanels ?? "0",
    icon: BookOpen,
    iconWrap: "bg-indigo-100 text-indigo-600",
  },
  {
    label: "Total Projects",
    value: stats?.totalProjects ?? "0",
    icon: FolderKanban,
    iconWrap: "bg-cyan-100 text-cyan-600",
  },
  {
    label: "Completed",
    value: stats?.completedProjects ?? "0",
    icon: CheckCircle2,
    iconWrap: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Approved",
    value: stats?.approvedProjects ?? "0",
    icon: BadgeCheck,
    iconWrap: "bg-green-100 text-green-600",
  },
];

  return (
    <>
      {isCreateStudentModalOpen && <AddStudent />}
      {isCreateTeacherModalOpen && <AddTeacher />}

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-slate-200">
          <div className="mx-auto max-w-7xl">
            <h1 className="text-xl font-semibold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="px-6 py-6 mx-auto space-y-6 max-w-7xl">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
            {statCards.map((c) => (
              <div className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm border-slate-200">
                <div className={`p-3 rounded-xl flex-shrink-0 ${c.iconWrap}`}>
                  <c.icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col">
                  <p className="text-xs font-medium leading-tight text-slate-500">{c.label}</p>
                  <p className="text-2xl font-bold leading-tight text-slate-900">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback Center + Notifications */}
          <div className="grid items-start grid-cols-1 gap-6 lg:grid-cols-3 lg:auto-rows-fr lg:items-stretch">

            {/* Left: Feedback then Project Details */}
            <div className="space-y-6 lg:col-span-2">
              <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-800">Send Feedback</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Send feedback to all teachers in a panel or to an individual student.
                  </p>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setIsPanelModalOpen(true)}
                      className="flex flex-col items-start gap-1 p-4 text-left text-white transition rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    >
                      <span className="text-sm font-semibold">Send Feedback to Teachers</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsStudentModalOpen(true)}
                      className="flex flex-col items-start gap-1 p-4 text-left text-white transition rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
                    >
                      <span className="text-sm font-semibold">Send Feedback to Student</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-800">Project Details</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    All student projects with panel and current status.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">
                          Student Name
                        </th>
                        <th className="px-5 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">
                          Project Title
                        </th>
                        <th className="px-5 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">
                          Panel Name
                        </th>
                        <th className="px-5 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">
                          Project Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {projectTableRows.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-10 text-sm text-center text-slate-500">
                            No projects found
                          </td>
                        </tr>
                      ) : (
                        projectTableRows.map((row) => (
                          <tr key={row.id} className="transition-colors hover:bg-slate-50/70">
                            <td className="px-5 py-3 text-sm font-medium text-slate-800">{row.studentName}</td>
                            <td className="px-5 py-3 text-sm text-slate-700">{row.title}</td>
                            <td className="relative px-5 py-3 text-sm text-slate-700">
                              <div className="relative inline-block group">
                                <span className="underline decoration-dotted underline-offset-2 cursor-help">
                                  {row.panelName}
                                </span>
                                {row.teachers.length > 0 ? (
                                  <div className="absolute z-20 hidden p-3 mt-2 text-sm text-white -translate-x-1/2 rounded-md shadow-xl pointer-events-none min-w-56 left-1/2 top-full bg-slate-900 group-hover:block">
                                    <p className="mb-2 text-xs font-semibold tracking-wide uppercase text-slate-300">
                                      Teachers
                                    </p>
                                    <div className="space-y-1.5">
                                      {row.teachers.map((teacherName) => (
                                        <div key={`${row.id}-${teacherName}`} className="flex items-center gap-2">
                                          <User className="w-4 h-4 text-amber-300" />
                                          <span className="font-medium text-slate-100">{teacherName}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-sm">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${getStatusBadgeClasses(row.status)}`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Notifications - 1/3 width */}
            <div className="flex flex-col self-stretch overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200 lg:max-h-full">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-800">Notifications</h2>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {displayedNotifications.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {displayedNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <svg className="w-8 h-8 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-xs">No notifications</p>
                  </div>
                ) : (
                  displayedNotifications.map((n, i) => (
                    <div
                      key={n._id || i}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedNotification(n)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setSelectedNotification(n);
                        }
                      }}
                      className={`px-5 py-3 transition-colors hover:bg-slate-50 cursor-pointer ${notificationStyles(n).card}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate text-slate-700">
                          {n.message || "Notification"}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${notificationStyles(n).chip}`}>
                          {getNotificationChipLabel(n)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {selectedNotification && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="w-full max-w-lg bg-white border rounded-lg shadow-xl border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Notification Details</h3>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Close
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              <div>
                <p className="text-xs tracking-wide uppercase text-slate-500">Message</p>
                <p className="mt-1 text-sm break-words text-slate-800">
                  {getNotificationViewModel(selectedNotification).messageText}
                </p>
              </div>

              <div>
                <p className="text-xs tracking-wide uppercase text-slate-500">From</p>
                <p className="mt-1 text-sm break-words text-slate-800">
                  {getNotificationViewModel(selectedNotification).fromValue}
                </p>
              </div>

              <div>
                <p className="text-xs tracking-wide uppercase text-slate-500">Type</p>
                <p className="mt-1 text-sm capitalize text-slate-800">
                  {selectedNotification.type || "general"}
                </p>
              </div>

              <div>
                <p className="text-xs tracking-wide uppercase text-slate-500"> Date & Time</p>
                <p className="mt-1 text-sm text-slate-800">
                  {selectedNotification.createdAt
                    ? new Date(selectedNotification.createdAt).toLocaleString()
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-xs tracking-wide uppercase text-slate-500">Priority</p>
                <p className="mt-1 text-sm capitalize text-slate-800">
                  {selectedNotification.priority || "low"}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {isPanelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsPanelModalOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white border rounded-lg shadow-xl border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Select Panel</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openAllPanelsFeedbackModal}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
                >
                  Send to All Panels
                </button>
                <button
                  type="button"
                  onClick={() => setIsPanelModalOpen(false)}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 px-5 py-3 border-b border-slate-100 sm:grid-cols-2">
              <input
                type="text"
                value={panelSearch}
                onChange={(e) => setPanelSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Search panel or teacher"
              />
              <select
                value={panelDepartmentFilter}
                onChange={(e) => setPanelDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="all">All Departments</option>
                {panelDepartments.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>

            <div className="max-h-[26rem] overflow-y-auto divide-y divide-slate-100">
              {filteredPanels.length === 0 ? (
                <p className="px-5 py-8 text-sm text-center text-slate-500">No panels found</p>
              ) : (
                filteredPanels.map((panel) => (
                  <div key={panel._id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{panel.panelName || "Panel"}</p>
                      <p className="text-xs text-slate-500">
                        {(panel.teachers || []).length} teachers
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openPanelFeedbackModal(panel)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Send Feedback
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isStudentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsStudentModalOpen(false)}
        >
          <div
            className="w-full max-w-3xl bg-white border rounded-lg shadow-xl border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">Select Student</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openAllStudentsFeedbackModal}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-md hover:bg-emerald-700"
                >
                  Send to All Students
                </button>
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 px-5 py-3 border-b border-slate-100 sm:grid-cols-2">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Search student, email or project"
              />
              <select
                value={studentDepartmentFilter}
                onChange={(e) => setStudentDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="all">All Departments</option>
                {studentDepartments.map((department) => (
                  <option key={department} value={department}>{department}</option>
                ))}
              </select>
            </div>

            <div className="max-h-[26rem] overflow-y-auto divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <p className="px-5 py-8 text-sm text-center text-slate-500">No students found</p>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student._id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{student.name || "Student"}</p>
                      <p className="text-xs text-slate-500">
                        {student.projectTitle || "No project found"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openStudentFeedbackModal(student)}
                      disabled={!student.projectId}
                      className={`px-3 py-1.5 text-xs font-medium text-white rounded-md ${
                        student.projectId
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-slate-300 cursor-not-allowed"
                      }`}
                    >
                      Send Feedback
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isFeedbackModalOpen && feedbackTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={closeFeedbackModal}
        >
          <div
            className="w-full max-w-lg bg-white border rounded-lg shadow-xl border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                {feedbackTarget.kind === "panel"
                  ? "Feedback to Panel Teachers"
                  : feedbackTarget.kind === "all-panels"
                    ? "Feedback to All Panels"
                    : feedbackTarget.kind === "all-students"
                      ? "Feedback to All Students"
                      : "Feedback to Student"}
              </h3>
              <button
                type="button"
                onClick={closeFeedbackModal}
                className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Close
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div>
                <p className="text-xs tracking-wide uppercase text-slate-500">Target</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{feedbackTarget.name}</p>
                {feedbackTarget.projectTitle ? (
                  <p className="mt-1 text-xs text-slate-500">Project: {feedbackTarget.projectTitle}</p>
                ) : null}
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium tracking-wide uppercase text-slate-500">
                  Type
                </label>
                <select
                  value={feedbackForm.type}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  <option value="general">General</option>
                  <option value="positive">Positive</option>
                  <option value="negative">Negative</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium tracking-wide uppercase text-slate-500">
                  Title
                </label>
                <input
                  type="text"
                  value={feedbackForm.title}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border rounded-md border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Enter feedback title"
                />
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium tracking-wide uppercase text-slate-500">
                  Description
                </label>
                <textarea
                  value={feedbackForm.description}
                  onChange={(e) => setFeedbackForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border rounded-md resize-none border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Enter feedback description"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeFeedbackModal}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendFeedback}
                  disabled={isSubmittingFeedback}
                  className={`px-3 py-1.5 text-sm font-medium text-white rounded-md ${
                    isSubmittingFeedback
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isSubmittingFeedback ? "Sending..." : "Send Feedback"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
