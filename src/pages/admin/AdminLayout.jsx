import { Navigate, Outlet, NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { useState } from "react";
import { User, LayoutDashboard, UserStar,CirclePlus, ShieldCheck, FolderOpenDot, FolderClock, Power, ArrowBigLeft, ArrowBigRight  } from "lucide-react";

const AdminLayout = () => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="mb-2 text-4xl animate-spin">⟳</div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!authUser || authUser.role !== "Admin") {
    return <Navigate to="/" replace />;
  }

  const openLogoutModal = () => setShowLogout(true);

  const confirmLogout = () => {
    setShowLogout(false);
    dispatch(logout());
  };

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: <LayoutDashboard /> },
    { label: "Students", path: "/admin/students", icon: <User /> },
    { label: "Teachers", path: "/admin/teachers", icon: <UserStar /> },
    { label: "Create Panel", path: "/admin/assign", icon: <CirclePlus /> },
    { label: "Assign Students", path: "/admin/assign-students", icon: <ShieldCheck /> },
    { label: "Projects", path: "/admin/projects", icon: <FolderOpenDot /> },
    { label: "Deadlines", path: "/admin/deadlines", icon: <FolderClock /> },
  ];

  return (
    <>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
        >
          {/* Toggle Row */}
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

          {/* Admin Info */}
          {sidebarOpen && (
            <div className="p-3 m-4 border border-blue-100 rounded-lg bg-blue-50">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-white bg-blue-600 rounded-full">
                  {authUser?.name ? authUser.name[0].toUpperCase() : "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {authUser?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {authUser?.email || "-"}
                  </p>
                  <p className="text-xs font-medium text-blue-700">Admin</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                // exact match only for Dashboard so /admin/students doesn't also highlight Dashboard
                end={item.path === "/admin"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
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
              <span className="text-lg"><Power /></span>
              {sidebarOpen && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Confirm Logout
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              Are you sure you want to logout?
            </p>
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

export default AdminLayout;
