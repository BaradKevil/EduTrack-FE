import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle2, Loader, PhoneCall, XCircle } from "lucide-react";
import {
  fetchStudentVideoConferenceOverview,
  respondToVideoConferenceInvite,
} from "../../store/slices/studentSlice";

const formatExactDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const StudentVideoConference = () => {
  const dispatch = useDispatch();
  const { videoConferenceSessions = [], pendingVideoConferenceCount = 0 } = useSelector((state) => state.student);
  const [loadingSessionId, setLoadingSessionId] = useState(null);

  useEffect(() => {
    dispatch(fetchStudentVideoConferenceOverview());

    const intervalId = setInterval(() => {
      dispatch(fetchStudentVideoConferenceOverview());
    }, 8000);

    const refreshOnFocus = () => {
      dispatch(fetchStudentVideoConferenceOverview());
    };

    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", refreshOnFocus);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [dispatch]);

  const pendingSessions = useMemo(
    () => videoConferenceSessions.filter((session) => session.inviteStatus === "pending"),
    [videoConferenceSessions]
  );

  const previousSessions = useMemo(
    () => videoConferenceSessions.filter((session) => session.inviteStatus !== "pending"),
    [videoConferenceSessions]
  );

  const handleRespond = async (sessionId, action) => {
    setLoadingSessionId(sessionId);
    const result = await dispatch(respondToVideoConferenceInvite({ sessionId, action }));
    const meetingUrl = result.payload?.meetingUrl;
    if (action === "accept" && meetingUrl) {
      window.open(meetingUrl, "_blank", "noopener,noreferrer");
    }
    await dispatch(fetchStudentVideoConferenceOverview());
    setLoadingSessionId(null);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h1 className="flex items-center gap-2 card-title">
            <PhoneCall className="w-5 h-5 text-blue-600" />
            Video Conference
          </h1>
          <p className="card-subtitle">
            Accept or reject incoming teacher conference requests and review your full call history with exact date and time.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-xl border-slate-200">
            <p className="text-sm text-slate-500">Pending Requests</p>
            <p className="mt-1 text-3xl font-semibold text-rose-600">{pendingVideoConferenceCount}</p>
          </div>
          <div className="p-4 border rounded-xl border-slate-200">
            <p className="text-sm text-slate-500">Accepted Calls</p>
            <p className="mt-1 text-3xl font-semibold text-emerald-600">
              {videoConferenceSessions.filter((session) => session.inviteStatus === "accepted").length}
            </p>
          </div>
          <div className="p-4 border rounded-xl border-slate-200">
            <p className="text-sm text-slate-500">Rejected Calls</p>
            <p className="mt-1 text-3xl font-semibold text-slate-700">
              {videoConferenceSessions.filter((session) => session.inviteStatus === "rejected").length}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Incoming Requests</h2>
          <p className="card-subtitle">Teacher requests stay here until you accept or reject them.</p>
        </div>

        <div className="space-y-4">
          {pendingSessions.map((session) => (
            <div key={session._id} className="p-4 border rounded-xl border-rose-200 bg-rose-50/40">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{session.title}</p>
                  <p className="text-sm text-slate-600">Teacher: {session.teacher?.name || "-"}</p>
                  <p className="text-sm text-slate-600">Project: {session.project?.title || "-"}</p>
                  <p className="text-sm text-slate-600">Started: {formatExactDateTime(session.startedAt)}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleRespond(session._id, "accept")}
                    disabled={loadingSessionId === session._id}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingSessionId === session._id ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Accept
                  </button>
                  <button
                    onClick={() => handleRespond(session._id, "reject")}
                    disabled={loadingSessionId === session._id}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-rose-600 hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}

          {pendingSessions.length === 0 && (
            <div className="py-8 text-center text-slate-500">No pending video conference requests right now.</div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Previous Video Conferences</h2>
          <p className="card-subtitle">All previous conference details are listed here with exact time and date.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Teacher Name</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Call Type</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Started At</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Responded At</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {previousSessions.map((session) => (
                <tr key={session._id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm text-slate-700">{session.teacher?.name || "-"}</td>
                  <td className="px-4 py-4 text-sm capitalize text-slate-700">{session.callType}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{formatExactDateTime(session.startedAt)}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{formatExactDateTime(session.respondedAt)}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-semibold capitalize rounded-full ${
                        session.inviteStatus === "rejected"
                          ? "bg-rose-100 text-rose-700"
                          : session.inviteStatus === "accepted"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {session.inviteStatus}
                    </span>
                  </td>
                </tr>
              ))}

              {previousSessions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No previous video conference activity yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentVideoConference;
