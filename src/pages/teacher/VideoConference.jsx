import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader, MonitorUp, Phone, Users, Video } from "lucide-react";
import {
  getVideoConferenceOverview,
  startVideoConferenceForAllStudents,
  startVideoConferenceWithStudent,
} from "../../store/slices/teacherSlice";

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const getSessionResponseStatus = (session) => {
  const statuses = (session?.participants || []).map((participant) => String(participant?.inviteStatus || "pending").toLowerCase());

  if (!statuses.length) return "pending";
  if (statuses.every((status) => status === "accepted")) return "accepted";
  if (statuses.every((status) => status === "rejected")) return "rejected";
  if (statuses.some((status) => status === "accepted")) return "accepted";
  if (statuses.some((status) => status === "rejected")) return "rejected";
  return "pending";
};

const getProjectStatusClasses = (status) => {
  const normalizedStatus = String(status || "pending").toLowerCase();

  if (normalizedStatus === "completed") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (normalizedStatus === "approved") {
    return "bg-blue-50 text-blue-700";
  }

  if (normalizedStatus === "rejected") {
    return "bg-rose-100 text-rose-700";
  }

  return "bg-amber-100 text-amber-700";
};

const VideoConference = () => {
  const dispatch = useDispatch();
  const { videoConferenceStudents = [], videoConferenceSessions = [], loading } = useSelector((state) => state.teacher);
  const [startingStudentId, setStartingStudentId] = useState(null);
  const [startingAll, setStartingAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(getVideoConferenceOverview());
  }, [dispatch]);

  const stats = useMemo(
    () => [
      {
        label: "Ready Projects",
        value: videoConferenceStudents.filter((student) => student?.project?._id).length,
        icon: MonitorUp,
        accent: "bg-emerald-100 text-emerald-700",
      },
      {
        label: "Conference Calls",
        value: videoConferenceSessions.filter((session) => session.callType === "conference").length,
        icon: Users,
        accent: "bg-blue-100 text-blue-700",
      },
      {
        label: "Individual Calls",
        value: videoConferenceSessions.filter((session) => session.callType === "individual").length,
        icon: Video,
        accent: "bg-amber-100 text-amber-700",
      },
    ],
    [videoConferenceSessions, videoConferenceStudents]
  );

  const filteredSessions = useMemo(() => {
    if (statusFilter === "all") return videoConferenceSessions;
    return videoConferenceSessions.filter((session) => getSessionResponseStatus(session) === statusFilter);
  }, [statusFilter, videoConferenceSessions]);

  const handleStudentCall = async (studentId) => {
    setStartingStudentId(studentId);
    const result = await dispatch(startVideoConferenceWithStudent(studentId));
    const session = result.payload;
    if (session?.meetingUrl) {
      window.open(session.meetingUrl, "_blank", "noopener,noreferrer");
    }
    setStartingStudentId(null);
  };

  const handleConferenceCall = async () => {
    setStartingAll(true);
    const result = await dispatch(startVideoConferenceForAllStudents());
    const session = result.payload;
    if (session?.meetingUrl) {
      window.open(session.meetingUrl, "_blank", "noopener,noreferrer");
    }
    setStartingAll(false);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="flex items-center gap-2 card-title">
                <Video className="w-5 h-5 text-blue-600" />
                Video Conference
              </h1>
              <p className="card-subtitle">
                Invite individual students or your full assigned panel into a live project discussion.
              </p>
            </div>

            <button
              onClick={handleConferenceCall}
              disabled={startingAll || !videoConferenceStudents.length}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {startingAll ? <Loader className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              Call All Students
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <div key={item.label} className="p-4 border rounded-xl border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.accent}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Assigned Students</h2>
          <p className="card-subtitle">Each call invitation creates a room link and sends a student notification instantly.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Student</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Project Title</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Status</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-slate-500">Last Update</th>
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-right uppercase text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {videoConferenceStudents.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{student.name}</p>
                      <p className="text-sm text-slate-500">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">{student?.project?.title || "-"}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold capitalize rounded-full ${getProjectStatusClasses(student?.project?.status)}`}>
                      {student?.project?.status || "pending"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">{formatDateTime(student?.project?.updatedAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleStudentCall(student._id)}
                        disabled={startingStudentId === student._id}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {startingStudentId === student._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Phone className="w-4 h-4" />
                        )}
                        Video Call
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && videoConferenceStudents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    No assigned students with active projects are available for video conference yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="card-title">Recent Call Sessions</h2>
              <p className="card-subtitle">Recent conference activity started from your dashboard.</p>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg border-slate-300 bg-white text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All Status</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          {filteredSessions.map((session) => {
            const responseStatus = getSessionResponseStatus(session);

            return (
            <div
              key={session._id}
              className="flex flex-col gap-4 p-4 border rounded-xl border-slate-200 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-medium text-slate-900">{session.title}</p>
                <p className="text-sm capitalize text-slate-500">{session.callType} call</p>
                <p className="text-xs text-slate-400">Started {formatDateTime(session.startedAt)}</p>
              </div>

              <div className="flex items-center justify-start md:justify-end">
                <span
                  className={`inline-flex px-2.5 py-1 text-xs font-semibold capitalize rounded-full ${
                    responseStatus === "accepted"
                      ? "bg-emerald-100 text-emerald-700"
                      : responseStatus === "rejected"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {responseStatus}
                </span>
              </div>
            </div>
            );
          })}

          {!filteredSessions.length && (
            <div className="py-8 text-center text-slate-500">No video conference sessions created yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoConference;
