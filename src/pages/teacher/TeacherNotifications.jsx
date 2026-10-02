import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteNotification, getNotifications, markAllAsRead, markAsRead } from "../../store/slices/notificationSlice";
import {AlertCircle,BadgeCheck,BellOff,Calendar,CheckCircle2,ChevronDown,Clock,Clock5,MessageCircle,Settings,User,} from "lucide-react";

const TeacherNotifications = () => {
    const dispatch = useDispatch();
    const notifications = useSelector((state) => state.notification.list);
    const unreadCount = useSelector((state) => state.notification.unreadCount);

    useEffect(() => {
    dispatch(getNotifications());
    }, [dispatch]);

    useEffect(() => {
    const intervalId = setInterval(() => {
        dispatch(getNotifications());
    }, 3000);

    const refreshOnFocus = () => {
        dispatch(getNotifications());
    };

    document.addEventListener("visibilitychange", refreshOnFocus);
    window.addEventListener("focus", refreshOnFocus);

    return () => {
        clearInterval(intervalId);
        document.removeEventListener("visibilitychange", refreshOnFocus);
        window.removeEventListener("focus", refreshOnFocus);
    };
    }, [dispatch]);

    const markAsReadHandler = (id) => dispatch(markAsRead(id));
    const markAllAsReadHandler = () => dispatch(markAllAsRead());
    const deleteNotificationHandler = (id) => dispatch(deleteNotification(id));

    const getNotificationIcon = (type) => {
    switch (type) {
        case "feedback":
        return <MessageCircle className="w-6 h-6 text-blue-500" />;
        case "deadline":
        return <Clock5 className="w-6 h-6 text-red-500" />;
        case "approval":
        return <BadgeCheck className="w-6 h-6 text-green-500" />;
        case "meeting":
        return <Calendar className="w-6 h-6 text-purple-500" />;
        case "system":
        return <Settings className="w-6 h-6 text-gray-500" />;
        case "request":
        return <BadgeCheck className="w-6 h-6 text-indigo-500" />;
        case "rejection":
        return <AlertCircle className="w-6 h-6 text-rose-500" />;
        case "upload":
        return <Clock5 className="w-6 h-6 text-cyan-500" />;
        case "communication":
        return <MessageCircle className="w-6 h-6 text-emerald-500" />;
        default:
        return (
            <div className="relative flex items-center justify-center w-6 h-6 rounded-full text-slate-500">
            <User className="absolute w-5 h-5" />
            <ChevronDown className="absolute w-4 h-4 top-4" />
            </div>
        );
    }
    };

    const getPriorityColor = (priority) => {
    switch (priority) {
        case "high":
        return "border-rose-700 bg-rose-100";

        case "medium":
        return "border-amber-200 bg-amber-70";

        case "low":
        return "border-emerald-300 bg-emerald-50";

        default:
        return "border-slate-300 bg-white";
    }
    };

    const formatDate = (dateStr) => {
    if (!dateStr) return "-";

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "-";

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((todayStart - dateStart) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const stats = [
    {
      title: "Total",
      value: notifications.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
      valueColor: "text-blue-900",
      Icon: User,
    },
    {
      title: "Unread",
      value: unreadCount,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-800",
      valueColor: "text-red-900",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: notifications.filter((n) => n.priority === "high").length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: notifications.filter((n) => {
        const createdAt = n?.createdAt;
        if (!createdAt) return false;

        const notifDate = new Date(createdAt);
        if (Number.isNaN(notifDate.getTime())) return false;

        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return notifDate >= startOfWeek && notifDate <= endOfWeek;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-800",
      valueColor: "text-green-900",
      Icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="card-title">Notifications</h1>
              <p className="card-subtitle">Stay updated with the latest progress and deadlines</p>
            </div>

            {unreadCount > 0 && (
              <button className="btn-outline btn-small" onClick={markAllAsReadHandler}>
                Mark All as Read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
          {stats.map((item, index) => (
            <div key={index} className={`${item.bg} rounded-lg p-4`}>
              <div className="flex items-center">
                <div className={`p-2 ${item.iconBg} rounded-lg`}>
                  <item.Icon className={`w-5 h-5 ${item.textColor}`} />
                </div>

                <div className="ml-3">
                  <p className={`text-sm font-medium ${item.titleColor}`}>{item.title}</p>
                  <p className={`text-sm font-medium ${item.valueColor}`}>{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`border rounded-xl p-4 transition-all duration-200 ${getPriorityColor(notification.priority)} ${
                notification.isRead ? "opacity-85" : "hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold capitalize ${!notification.isRead ? "text-slate-900" : "text-slate-700"}`}>
                        {notification.type || "notification"}
                      </h3>
                      {!notification.isRead && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full" />}
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">{formatDate(notification.createdAt)}</span>
                      <span className="text-slate-400">{formatDateTime(notification.createdAt)}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold capitalize ${
                          String(notification.priority || "").toLowerCase() === "high"
                            ? "bg-rose-100 text-rose-700"
                            : String(notification.priority || "").toLowerCase() === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {notification.priority}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed break-words text-slate-700">{notification.message}</p>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                        notification.type === "feedback"
                          ? "bg-blue-100 text-blue-800"
                          : notification.type === "deadline"
                          ? "bg-red-100 text-red-800"
                          : notification.type === "approval"
                          ? "bg-green-100 text-green-800"
                          : notification.type === "rejection"
                          ? "bg-rose-100 text-rose-800"
                          : notification.type === "communication"
                          ? "bg-emerald-100 text-emerald-800"
                          : notification.type === "upload"
                          ? "bg-cyan-100 text-cyan-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {notification.type}
                    </span>

                    <div className="flex items-center gap-4">
                      {!notification.isRead && (
                        <button
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                          onClick={() => markAsReadHandler(notification._id)}
                        >
                          Mark As Read
                        </button>
                      )}
                      <button
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                        onClick={() => deleteNotificationHandler(notification._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="py-8 text-center">
            <div className="flex items-center justify-center mb-3 text-slate-600">
              <BellOff className="w-12 h-12" />
            </div>
            <p className="text-slate-500">No Notifications Yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherNotifications;
