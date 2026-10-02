/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTeacherDashboardStats,
  getTeacherNotificationRecipients,
  sendTeacherNotificationToAdmins,
  sendTeacherNotificationToAllAssignedStudents,
  sendTeacherNotificationToStudent,
} from "../../store/slices/teacherSlice";
import { CheckCircle, Clock, Loader, MoveDiagonal, Send, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const initialNotificationForm = {
  message: "",
  priority: "medium",
};

const TeacherDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboardStats, loading, notificationRecipients } = useSelector((state) => state.teacher);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [notificationForm, setNotificationForm] = useState(initialNotificationForm);

  useEffect(() => {
    dispatch(getTeacherDashboardStats());
    dispatch(getTeacherNotificationRecipients());
  }, [dispatch]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(getTeacherDashboardStats());
      dispatch(getTeacherNotificationRecipients());
    }, 3000);

    const refreshOnFocus = () => {
      dispatch(getTeacherDashboardStats());
      dispatch(getTeacherNotificationRecipients());
    };

    document.addEventListener("visibilitychange", refreshOnFocus);
    window.addEventListener("focus", refreshOnFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshOnFocus);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [dispatch]);

  const statsCards = [
    {
      title: "Assigned Students",
      value: dashboardStats?.assignedStudentsCount || 0,
      loading,
      Icon: Users,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: dashboardStats?.totalPendingRequests || 0,
      loading,
      Icon: Clock,
      bg: "bg-yellow-100",
      color: "text-yellow-600",
    },
    {
      title: "Completed Projects",
      value: dashboardStats?.completedProjects || 0,
      loading,
      Icon: CheckCircle,
      bg: "bg-green-100",
      color: "text-green-600",
    },
  ];

  const latestNotifications = (dashboardStats?.recentNotifications || []).slice(0, 5);
  const recipients = useMemo(() => notificationRecipients || [], [notificationRecipients]);

  const getNotificationCardClass = (priority) => {
    const p = String(priority || "").toLowerCase();
    if (p === "high") return "bg-rose-50 border border-rose-300";
    if (p === "medium") return "bg-amber-50 border border-amber-300";
    if (p === "low") return "bg-emerald-50 border border-emerald-300";
    return "bg-slate-50 border border-slate-200";
  };

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

  const resetNotificationForm = () => {
    setNotificationForm(initialNotificationForm);
    setIsSending(false);
  };

  const closeAdminModal = () => {
    setIsAdminModalOpen(false);
    resetNotificationForm();
  };

  const closeStudentModal = () => {
    setIsStudentModalOpen(false);
    resetNotificationForm();
  };

  const openAdminModal = () => {
    resetNotificationForm();
    setIsAdminModalOpen(true);
  };

  const openStudentModal = () => {
    resetNotificationForm();
    setIsStudentModalOpen(true);
    dispatch(getTeacherNotificationRecipients());
  };

  const sendToAdmins = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await dispatch(sendTeacherNotificationToAdmins(notificationForm)).unwrap();
      closeAdminModal();
    } finally {
      setIsSending(false);
    }
  };

  const sendToSingleStudent = async (studentId) => {
    setIsSending(true);
    try {
      await dispatch(
        sendTeacherNotificationToStudent({
          studentId,
          payload: notificationForm,
        })
      ).unwrap();
      closeStudentModal();
    } finally {
      setIsSending(false);
    }
  };

  const sendToAllAssignedStudents = async () => {
    setIsSending(true);
    try {
      await dispatch(sendTeacherNotificationToAllAssignedStudents(notificationForm)).unwrap();
      closeStudentModal();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="p-6 text-white rounded-lg bg-gradient-to-r from-green-500 to-green-600">
          <h1 className="mb-2 text-2xl font-bold">Teacher Dashboard</h1>
          <p className="text-green-100">Manage your students and provide guidance to their projects.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statsCards.map(({ title, value, loading: cardLoading, Icon, bg, color }, index) => (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`p-3 ${bg} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">{title}</p>
                  <p className="text-sm font-medium text-slate-800">{cardLoading ? "..." : value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="card-title">Send Notification</h2>
                <p className="card-subtitle">
                  Send messages to all admins or to assigned students with custom priority.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={openAdminModal}
              className="px-4 py-3 text-sm font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Send Notification To Admin
            </button>
            <button
              type="button"
              onClick={openStudentModal}
              disabled={!recipients.length}
              className="px-4 py-3 text-sm font-semibold text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send Notification To Assigned Students
            </button>
          </div>

          {!recipients.length && (
            <p className="mt-3 text-xs text-amber-600">No assigned students available for notifications.</p>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="card-title">Recent Activity</h2>
                <p className="card-subtitle">Latest 5 notifications and updates</p>
              </div>
              <button className="btn-outline btn-small" onClick={() => navigate("/teacher/notifications")}>
                View All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <Loader size={32} className="animate-spin" />
            ) : latestNotifications.length > 0 ? (
              latestNotifications.map((notification) => (
                <div
                  key={notification._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedNotification(notification)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedNotification(notification);
                    }
                  }}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors hover:opacity-90 ${getNotificationCardClass(notification.priority)}`}
                >
                  <div className="p-2 bg-white rounded-lg to-slate-600">
                    <MoveDiagonal className="w-5 h-5" />
                  </div>

                  <div className="flex-1 ml-3">
                    <p className="text-sm text-slate-800">{notification.message}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      <span className="capitalize">
                        | {String(notification.priority || "medium").toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 text-center text-slate-500">No recent activity.</div>
            )}
          </div>
        </div>
      </div>

      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 bg-white shadow-xl rounded-xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Send Notification To Admin</h3>
                <p className="text-sm text-slate-500">Your message will be sent to all admins at once.</p>
              </div>
              <button
                type="button"
                onClick={closeAdminModal}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close notification modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={sendToAdmins} className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Message</label>
                <textarea
                  required
                  rows={5}
                  maxLength={1000}
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-lg resize-none border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your message"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Priority</label>
                <select
                  value={notificationForm.priority}
                  onChange={(e) =>
                    setNotificationForm((prev) => ({ ...prev, priority: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAdminModal}
                  className="px-4 py-2 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSending ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl p-6 bg-white shadow-xl rounded-xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Send Notification To Assigned Students
                </h3>
                <p className="text-sm text-slate-500">
                  Select an individual student or send one general message to all assigned students.
                </p>
              </div>
              <button
                type="button"
                onClick={closeStudentModal}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close notification modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Message</label>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm((prev) => ({ ...prev, message: e.target.value }))
                  }
                  className="w-full px-3 py-2 border rounded-lg resize-none border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write your message"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-slate-700">Priority</label>
                  <select
                    value={notificationForm.priority}
                    onChange={(e) =>
                      setNotificationForm((prev) => ({ ...prev, priority: e.target.value }))
                    }
                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={!notificationForm.message.trim() || isSending || !recipients.length}
                    onClick={sendToAllAssignedStudents}
                    className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 font-semibold text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isSending ? "Sending..." : "Send To All Assigned Students"}
                  </button>
                </div>
              </div>

              <div className="border rounded-lg border-slate-200">
                <div className="px-4 py-3 border-b bg-slate-50 border-slate-200">
                  <p className="text-sm font-medium text-slate-700">Assigned Students List</p>
                </div>
                <div className="overflow-y-auto divide-y max-h-64 divide-slate-100">
                  {recipients.length === 0 ? (
                    <p className="px-4 py-6 text-sm text-center text-slate-500">
                      No assigned students found.
                    </p>
                  ) : (
                    recipients.map((student) => (
                      <div key={student._id} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                          <p className="text-xs truncate text-slate-500">{student.email}</p>
                        </div>
                        <button
                          type="button"
                          disabled={!notificationForm.message.trim() || isSending}
                          onClick={() => sendToSingleStudent(student._id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isSending ? "Sending..." : "Send"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeStudentModal}
                  className="px-4 py-2 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-xs tracking-wide uppercase text-slate-500">Date & Time</p>
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
    </>
  );
};

export default TeacherDashboard;
