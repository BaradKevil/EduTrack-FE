import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useEffect, useState } from "react";
import { ArrowBigLeft, ArrowBigRight, CirclePower, LogOut, Power, LayoutDashboard,File ,SendHorizontal,UserRound, MessageCircle, Bell, ClipboardClock, User, CalendarDays, Video  } from "lucide-react";
import { fetchStudentVideoConferenceOverview } from "../../store/slices/studentSlice";

const DashboardLayout = () => {
    const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
    const { pendingVideoConferenceCount } = useSelector((state) => state.student);
    const dispatch = useDispatch();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [showLogout, setShowLogout] = useState(false);

    useEffect(() => {
    if (authUser?.role !== "Student") return;

    dispatch(fetchStudentVideoConferenceOverview());

    const intervalId = setInterval(() => {
        dispatch(fetchStudentVideoConferenceOverview());
    }, 8000);

    return () => clearInterval(intervalId);
    }, [authUser?.role, dispatch]);

    if (isCheckingAuth) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
            <div className="mb-2 text-4xl animate-spin">⟳</div>
            <p className="text-gray-600">Loading...</p>
        </div>
        </div>
    );
    }

    if (!authUser) {
    return <Navigate to="/" replace />;
    }

    const openLogoutModal = () => {
    setShowLogout(true);
    };

    const confirmLogout = () => {
    setShowLogout(false);
    dispatch(logout());
    };

    const navItems = {
    Student: [
        { label: "Dashboard", path: "/student", icon: <LayoutDashboard /> },
        { label: "Submit Proposal", path: "/student/proposal", icon: <SendHorizontal /> },
        { label: "Upload Files", path: "/student/upload", icon: <File /> },
        { label: "Panel", path: "/student/panel", icon:  <UserRound />},
        { label: "Video Conference", path: "/student/video-conference", icon: <Video />, badge: pendingVideoConferenceCount },
        { label: "Feedback", path: "/student/feedback", icon: <MessageCircle />  },
        { label: "Notifications", path: "/student/notifications", icon: <Bell /> },
    ],
    Teacher: [
        { label: "Dashboard", path: "/teacher", icon: <LayoutDashboard /> },
        { label: "Pending", path: "/teacher/pending", icon: <ClipboardClock /> },
        { label: "My Students", path: "/teacher/students", icon:<User /> },
        { label: "Video Conference", path: "/teacher/video-conference", icon: <Video /> },
        { label: "Files", path: "/teacher/files", icon: <File /> },
        { label: "Deadlines", path: "/teacher/deadlines", icon: <CalendarDays /> },
        { label: "Notifications", path: "/teacher/notifications", icon: <Bell /> },
    ],
    };

    const links = navItems[authUser.role] || [];

    return (
    <>
        <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside
            className={`${
            sidebarOpen ? "w-64" : "w-20"
            } h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
        >
          {/* Centered full-row toggle */}
            <div className="border-b border-gray-200">
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center justify-center w-full py-3 transition-colors hover:bg-gray-100"
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
                {sidebarOpen ? (
                <ArrowBigLeft className="w-6 h-6 text-gray-600" />
                ) : (
                <ArrowBigRight className="w-6 h-6 text-gray-600" />
                )}
            </button>
            </div>

          {/* User Info moved above brand */}
            {sidebarOpen && (
            <div className="p-3 m-4 border border-blue-100 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-blue-600 rounded-full">
                    {authUser.name?.[0] || "U"}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                    {authUser.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{authUser.email}</p>
                </div>
                </div>
            </div>
            )}

          {/* Navigation */}
            <nav className="flex-1 px-4 py-3 space-y-1">
            {links.map((item) => (
                <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/student" || item.path === "/teacher"}
                className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }`
                }
                >
                <span className="relative text-lg">
                    {item.icon}
                    {Number(item.badge) > 0 && !sidebarOpen && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-5 text-white">
                        {item.badge}
                    </span>
                    )}
                </span>
                {sidebarOpen && (
                    <span className="flex items-center justify-between flex-1 gap-3 text-sm font-medium">
                    <span>{item.label}</span>
                    {Number(item.badge) > 0 && (
                        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-5 text-white">
                        {item.badge}
                        </span>
                    )}
                    </span>
                )}
                </NavLink>
            ))}
            </nav>

          {/* Logout Button */}
            <div className="p-4 border-t border-gray-200">
            <button
                onClick={openLogoutModal}
                className="flex items-center w-full gap-3 px-3 py-2 text-red-600 transition-colors rounded-lg hover:bg-red-50"
            >
                <Power className="w-5 h-5" />
                {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 py-3 overflow-auto">
            <div className="min-h-full">
            <Outlet />
            </div>
        </main>
        </div>

      {/* Logout Confirmation Modal */}
        {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Confirm Logout</h2>
            <p className="mb-6 text-sm text-gray-600">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-3">
                <button
                onClick={() => setShowLogout(false)}
                className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                Cancel
                </button>
                <button
                onClick={confirmLogout}
                className="px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                >
                Logout
                </button>
            </div>
            </div>
        </div>
        )}
    </>
    );
};

export default DashboardLayout;
