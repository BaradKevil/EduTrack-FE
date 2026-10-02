import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../store/slices/studentSlice";
import { Link } from "react-router-dom";
import { MessageCircle, Bell, FolderOpen, Users, Clock, Star } from "lucide-react";

const StudentDashboard = () => {

  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { dashboardStats } = useSelector((state) => state.student);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    dispatch(fetchDashboardStats());

    const intervalId = setInterval(() => {
      dispatch(fetchDashboardStats());
    }, 8000);

    const handleFocus = () => {
      dispatch(fetchDashboardStats());
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [dispatch]);

  const project = dashboardStats?.projects || dashboardStats?.project || {};
  const panelName =
    project?.panel?.panelName ||
    project?.panel?.name ||
    dashboardStats?.panelName ||
    "Not Assigned";
  const topNotifications = dashboardStats?.topNotifications || [];
  const feedbackRaw = dashboardStats?.feedbackList || dashboardStats?.feedbackNotifications || [];
  const feedbackList = [...feedbackRaw].slice(0, 3);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

  const getNotificationCardClasses = (notification) => {
    const type = String(notification?.type || "").toLowerCase();
    const priority = String(notification?.priority || "").toLowerCase();

    if (type === "approval") {
      return "bg-green-50 border-green-200 hover:bg-green-100";
    }

    if (type === "rejection") {
      return "bg-red-50 border-red-200 hover:bg-red-100";
    }

    if (type === "feedback") {
      if (priority === "high") return "bg-rose-50 border-rose-200 hover:bg-rose-100";
      if (priority === "low") return "bg-emerald-50 border-emerald-200 hover:bg-emerald-100";
      return "bg-cyan-50 border-cyan-200 hover:bg-cyan-100";
    }

    if (type === "meeting") {
      return "bg-violet-50 border-violet-200 hover:bg-violet-100";
    }

    if (type === "communication") {
      return "bg-emerald-50 border-emerald-200 hover:bg-emerald-100";
    }

    if (type === "upload") {
      return "bg-cyan-50 border-cyan-200 hover:bg-cyan-100";
    }

    if (type === "deadline") {
      return "bg-amber-50 border-amber-200 hover:bg-amber-100";
    }

    if (priority === "high") {
      return "bg-rose-50 border-rose-200 hover:bg-rose-100";
    }

    if (priority === "medium") {
      return "bg-amber-50 border-amber-200 hover:bg-amber-100";
    }

    if (priority === "low") {
      return "bg-emerald-50 border-emerald-200 hover:bg-emerald-100";
    }

    return "bg-slate-50 border-slate-100 hover:bg-slate-100";
  };

  return (
    <div className="space-y-6 px-0.5 md:px-1">

      {/* Welcome Banner */}
      <div className="p-6 text-white shadow-md rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
        <h1 className="mb-1 text-2xl font-bold">
          Welcome back, {authUser?.name || "Student"}
        </h1>
        <p className="text-sm text-blue-100">
          Here's your project overview and recent updates.
        </p>
      </div>

      {/* Quick Stats — 4 cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="flex items-center gap-4 p-4 card">
          <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
            <FolderOpen className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Project Title</p>
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">
              {project?.title || "No Project"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 card">
          <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
            <Users className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Panel</p>
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">
              {panelName || "Not Assigned"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 card">
          <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg">
            <Clock className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500"> Deadline</p>
            <p className="text-sm font-semibold text-slate-800">
              {formatDate(project?.deadline)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 card">
          <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
            <Star className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Recent Feedback</p>
            <p className="text-sm font-semibold text-slate-800">
              {feedbackList?.length ? formatDate(feedbackList[0]?.createdAt) : "No feedback yet"}
            </p>
          </div>
        </div>

      </div>

      {/* Project Overview + Latest Feedback — side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Project Overview */}
        <div className="card">
          <div className="mb-4 card-header">
            <h2 className="card-title">Project Overview</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Title</p>
              <p className="text-sm font-semibold text-slate-800">{project?.title || "No Project"}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Description</p>
              <p className="text-sm text-slate-700">{project?.description || "No description available"}</p>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-xs font-medium text-slate-500">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                project?.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : project?.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : project?.status === "rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {project?.status || "Unknown"}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">Submission Deadline</p>
              <p className="text-sm font-semibold text-slate-800">{formatDate(project?.deadline)}</p>
            </div>
          </div>
        </div>

        {/* Latest Feedback */}
        <div className="card">
          <div className="flex items-center justify-between mb-4 card-header">
            <h2 className="card-title">Latest Feedback</h2>
            <Link
              to="/student/feedback"
              className="px-3 py-1 text-xs font-semibold text-white transition-colors bg-blue-500 rounded-full hover:bg-blue-600">
              View All
            </Link>
          </div>

          {feedbackList && feedbackList.length > 0 ? (
            <div className="space-y-3">
              {feedbackList.map((feedback, index) => (
                <div key={index} className="p-3 transition-shadow border rounded-lg border-slate-100 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="flex-shrink-0 w-4 h-4 text-blue-500" />
                      <p className="text-sm font-medium text-slate-800">{feedback?.title || "Panel Feedback"}</p>
                    </div>
                    <p className="flex-shrink-0 text-xs text-slate-400">{formatDate(feedback?.createdAt)}</p>
                  </div>
                  <p className="pl-6 text-sm leading-relaxed text-slate-600">
                    {feedback?.message || "No message available."}
                  </p>
                  <p className="pl-6 mt-2 text-xs text-slate-400">
                    - {feedback?.senderLabel || (feedback?.senderRole === "admin" ? `Admin (${feedback?.senderName || "Unknown"})` : `Panel (${feedback?.senderName || "Unknown"})`)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="text-sm text-slate-400">No Feedback Available Yet</p>
            </div>
          )}
        </div>

      </div>

      {/* Recent Notifications — full row */}
      <div className="grid grid-cols-1 gap-6">

        {/* Recent Notifications */}
        <div className="w-full card">
          <div className="mb-4 card-header">
            <h2 className="card-title">Recent Notifications</h2>
          </div>

          {topNotifications && topNotifications.length > 0 ? (
            <div className="space-y-3">
              {topNotifications.map((notification, index) => (
                <div
                  key={index}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedNotification(notification)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedNotification(notification);
                    }
                  }}
                  className={`p-3 transition-colors border rounded-lg cursor-pointer ${getNotificationCardClasses(notification)}`}
                >
                  <p className="text-sm font-medium text-slate-800">{notification.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDate(notification.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Bell className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="text-sm text-slate-400">No Recent Notifications</p>
            </div>
          )}
        </div>

      </div>

      {selectedNotification &&
        createPortal(
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, width: "100vw", height: "100vh" }}
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
        </div>,
        document.body
      )}

    </div>
  );
};

export default StudentDashboard;
