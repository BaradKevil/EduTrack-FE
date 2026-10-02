import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudentPanel,
  fetchPanelFeedbacks,
  sendStudentNotificationToAdmins,
  sendStudentNotificationToPanel,
} from "../../store/slices/panelSlice";
import { X } from "lucide-react";

const initialMessageForm = {
  message: "",
  priority: "medium",
};

const Card = ({ title, subtitle, children }) => (
  <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
    <div className="px-6 py-4 border-b border-gray-100">
      <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const Muted = ({ children }) => (
  <p className="py-4 text-sm text-center text-gray-400">{children}</p>
);

const StudentPanelPage = () => {
  const dispatch = useDispatch();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationTarget, setNotificationTarget] = useState("admin");
  const [notificationForm, setNotificationForm] = useState(initialMessageForm);
  const [isSending, setIsSending] = useState(false);

  const { studentPanel, isLoading: panelLoading } = useSelector(
    (state) => state.panel
  );

  useEffect(() => {
    dispatch(fetchStudentPanel());
  }, [dispatch]);

  useEffect(() => {
    if (studentPanel?._id) {
      dispatch(fetchPanelFeedbacks(studentPanel._id));
    }
  }, [dispatch, studentPanel]);

  const isLoading = panelLoading;

  const openNotificationModal = (target) => {
    setNotificationTarget(target);
    setNotificationForm(initialMessageForm);
    setIsNotificationModalOpen(true);
  };

  const closeNotificationModal = () => {
    setIsNotificationModalOpen(false);
    setNotificationForm(initialMessageForm);
    setIsSending(false);
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const action =
        notificationTarget === "admin"
          ? sendStudentNotificationToAdmins(notificationForm)
          : sendStudentNotificationToPanel(notificationForm);

      await dispatch(action).unwrap();
      closeNotificationModal();
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading && !studentPanel) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-4 border-blue-200 rounded-full border-t-blue-500 animate-spin" />
          <p className="text-sm">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <Card title="Current Panel">
          {!studentPanel ? (
            <Muted>No panel assigned yet.</Muted>
          ) : (
            <div className="space-y-4">
              {/* Panel name + department row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-0.5">
                    Panel Name
                  </p>
                  <p className="text-base font-semibold text-gray-800">
                    {studentPanel.panelName}
                  </p>
                </div>
                {studentPanel.department && (
                  <span className="px-3 py-1 text-xs font-medium text-blue-600 rounded-full bg-blue-50">
                    {studentPanel.department}
                  </span>
                )}
              </div>

              <div className="border-t border-gray-100" />

              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-3">
                  Panel Members
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {studentPanel.teachers?.map((teacher, idx) => (
                    <div
                      key={teacher._id}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50"
                    >
                      {/* Numbered avatar */}
                      <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-blue-600 rounded-full shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">
                          {teacher.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{teacher.email}</p>
                        {teacher.expertise && (
                          <p className="text-xs text-indigo-400 mt-0.5 truncate">
                            {Array.isArray(teacher.expertise)
                              ? teacher.expertise.join(", ")
                              : teacher.expertise}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card
          title="Send Notification"
          subtitle="Communicate directly with Admin or your assigned panel teachers"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => openNotificationModal("admin")}
              className="px-4 py-3 text-sm font-semibold text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Send Notification To Admin
            </button>

            <button
              type="button"
              onClick={() => openNotificationModal("panel")}
              disabled={!studentPanel?._id}
              className="px-4 py-3 text-sm font-semibold text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send Notification To Panel
            </button>
          </div>

          {!studentPanel?._id && (
            <p className="mt-3 text-xs text-amber-600">
              You need an assigned panel before sending notifications to panel teachers.
            </p>
          )}
        </Card>
      </div>

      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl p-6 bg-white shadow-xl rounded-xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {notificationTarget === "admin"
                    ? "Send Notification To Admin"
                    : "Send Notification To Panel"}
                </h3>
                <p className="text-sm text-slate-500">
                  {notificationTarget === "admin"
                    ? "Your message will be sent to all admins."
                    : `Your message will be sent to teachers in ${studentPanel?.panelName || "your panel"}.`}
                </p>
              </div>

              <button
                type="button"
                onClick={closeNotificationModal}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close notification modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
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
                  onClick={closeNotificationModal}
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
    </>
  );
};

export default StudentPanelPage;