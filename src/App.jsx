/* eslint-disable no-unused-vars */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// Dashboard Layouts
import DashboardLayout from "./components/layout/DashboardLayout";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import SubmitProposal from "./pages/student/SubmitProposal";
import UploadFiles from "./pages/student/UploadFiles";
import PanelPage from "./pages/student/panelPage";
import FeedbackPage from "./pages/student/FeedbackPage";
import NotificationsPage from "./pages/student/NotificationsPage";
import StudentVideoConference from "./pages/student/StudentVideoConference";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import PendingRequests from "./pages/teacher/PendingRequests";
import AssignedStudents from "./pages/teacher/AssignedStudents";
import TeacherFiles from "./pages/teacher/TeacherFiles";
import TeacherNotifications from "./pages/teacher/TeacherNotifications";
import DeadlinePage from "./pages/teacher/DeadlinePage";
import VideoConference from "./pages/teacher/VideoConference";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";
import AssignSupervisor from "./pages/admin/AssignSupervisor";
import DeadlinesPage from "./pages/admin/DeadlinesPage";
import ProjectsPage from "./pages/admin/ProjectsPage";

import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Loader } from "lucide-react";
import { getUser } from "./store/slices/authSlice";
import { getAllUsers } from "./store/slices/adminSlice";
import { getAllProjects } from "./store/slices/adminSlice";
import AssignStudents from "./pages/admin/AssignStudents";
import { fetchDashboardStats } from "./store/slices/studentSlice";

import NotFound from "./pages/NotFound";
const App = () => {

  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      dispatch(getUser());
    }
  }, [dispatch]);


  useEffect(() => {
    if(authUser?.role === "Admin") {
      dispatch(getAllUsers());
      dispatch(getAllProjects());
    }
    if(authUser?.role === "Student") {
      dispatch(fetchDashboardStats());
    }
  }, [authUser]); 
  

  const ProtectedRoute = ({children, allowedRoles}) => { 
    if (!authUser) {
      return <Navigate to="/login" replace />;
    }

    if(allowedRoles.length && authUser?.role && !allowedRoles.includes(authUser.role)) {
      const redirectPath = authUser.role === "Admin" ? "/admin" : authUser.role === "Teacher" ? "/teacher" : "/student";

      return <Navigate to={redirectPath} replace />; 
    }
    return children;
  };
  
  // Show spinner only while the initial auth check is still in flight
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>

        {/* ── "/" always redirects somewhere useful ── */}
        <Route
          path="/"
          element={
            authUser ? (
              <Navigate to={`/${String(authUser.role || "").toLowerCase()}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ── Auth Routes (only when NOT logged in) ── */}
        <Route
          path="/login"
          element={
            !authUser ? (
              <LoginPage />
            ) : (
              <Navigate to={`/${String(authUser.role || "").toLowerCase()}`} replace />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !authUser ? (
              <SignupPage />
            ) : (
              <Navigate to={`/${String(authUser.role || "").toLowerCase()}`} replace />
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            !authUser ? (
              <ForgotPasswordPage />
            ) : (
              <Navigate to={`/${String(authUser.role || "").toLowerCase()}`} replace />
            )
          }
        />
        <Route path="/reset-password"   element={<ResetPasswordPage />} />


        {/* ── Admin Routes (guarded by AdminLayout) ── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index            element={<AdminDashboard />}   />
          <Route path="students"  element={<ManageStudents />}   />
          <Route path="teachers"  element={<ManageTeachers />}   />
          <Route path="assign"    element={<AssignSupervisor />} />
          <Route path="assign-students" element={<AssignStudents />} />
          <Route path="projects"  element={<ProjectsPage />}     />
          <Route path="deadlines" element={<DeadlinesPage />}    />
        </Route>


        {/* ── Student Routes ── */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={["Student"]}>
          <DashboardLayout userRole={"Student"} />
          </ProtectedRoute>
          }>
          <Route index              element={<StudentDashboard />}    />
          <Route path="proposal"    element={<SubmitProposal />}      /> 
          <Route path="upload"      element={<UploadFiles />}         />
          <Route path="panel"  element={<PanelPage />}      />
          <Route path="video-conference" element={<StudentVideoConference />} />
          <Route path="feedback"    element={<FeedbackPage />}        />
          <Route path="notifications" element={<NotificationsPage />} />
        </Route>


        {/* ── Teacher Routes ── */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={["Teacher"]}>
          <DashboardLayout userRole={"Teacher"} />
          </ProtectedRoute>
          }>
          <Route index            element={<TeacherDashboard />}  />
          <Route path="pending"   element={<PendingRequests />}   />
          <Route path="students"  element={<AssignedStudents />}  />
          <Route path="video-conference" element={<VideoConference />} />
          <Route path="files"     element={<TeacherFiles />}      />
          <Route path="deadlines" element={<DeadlinePage />}      />
          <Route path="notifications" element={<TeacherNotifications />} />
        </Route>

        {/* DEFAULT REDIRECT */}
          <Route path="/" element={<Navigate to={"/login"} replace/>} />

          <Route path="/unauthorized" element={
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
              <div className="text-center">
                <h1 className="mb-4 text-2xl font-bold text-slate-800">
                  Unauthorized Access
                </h1>
                <p className="mb-4 text-slate-600">
                  You don't have permission to access this page.
                </p>

                <button className="btn-primary" onClick={() => window.history.back()}>
                  Go Back
                </button>

              </div>
            </div>
          }
          />
          <Route path="*" element={<NotFound />} />

        {/* ── Catch-all: anything else → back to "/" ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      <ToastContainer theme="dark" />
    </BrowserRouter>
  );
};

export default App;
