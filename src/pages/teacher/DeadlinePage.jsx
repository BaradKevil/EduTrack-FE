import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { getAssignedStudents } from "../../store/slices/teacherSlice";
import { createDeadline, createDeadlineForAll } from "../../store/slices/deadlineSlice";

const ModalShell = ({ children, onClose }) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex min-h-screen w-screen items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-screen p-6 mx-4 overflow-y-auto bg-white rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

const DeadlinePage = () => {
  const dispatch = useDispatch();
  const { assignedStudents = [] } = useSelector((state) => state.teacher);

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalMode, setModalMode] = useState("single");
  const [formData, setFormData] = useState({
    deadlineDate: "",
    description: "",
  });

  useEffect(() => {
    dispatch(getAssignedStudents());
  }, [dispatch]);

  const assignedProjects = useMemo(() => {
    return (assignedStudents || [])
      .filter((student) => student?.project?._id)
      .filter((student) => {
        const status = String(student.project?.status || "").toLowerCase();
        return status === "approved" || status === "completed";
      })
      .map((student) => ({
        _id: student.project._id,
        title: student.project.title || "-",
        studentName: student.name || "-",
        studentEmail: student.email || "-",
        status: String(student.project?.status || "unknown").toLowerCase(),
        deadline: student.project?.deadline
          ? new Date(student.project.deadline).toISOString().slice(0, 10)
          : "-",
        setDeadlineAt: student.project?.deadlineSetAt
          ? new Date(student.project.deadlineSetAt).toLocaleString()
          : "-",
        description: student.project?.description || "",
        raw: student,
      }));
  }, [assignedStudents]);

  const filteredProjects = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return assignedProjects.filter(
      (row) =>
        (row.title || "").toLowerCase().includes(needle) ||
        (row.studentName || "").toLowerCase().includes(needle)
    );
  }, [assignedProjects, searchTerm]);

  const approvedProjects = useMemo(
    () => assignedProjects.filter((project) => project.status === "approved"),
    [assignedProjects]
  );

  const closeModal = () => {
    setShowModal(false);
    setFormData({ deadlineDate: "", description: "" });
    setSelectedProject(null);
    setModalMode("single");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.deadlineDate) return;

    try {
      if (modalMode === "all") {
        await dispatch(
          createDeadlineForAll({
            dueDate: formData.deadlineDate,
            description: formData.description,
          })
        ).unwrap();
      } else if (selectedProject) {
        const deadlineData = {
          name: selectedProject.studentName,
          dueDate: formData.deadlineDate,
          description: formData.description,
          project: selectedProject._id,
        };

        await dispatch(
          createDeadline({ id: selectedProject._id, data: deadlineData })
        ).unwrap();
      }

      await dispatch(getAssignedStudents()).unwrap();
    } finally {
      closeModal();
    }
  };

  const openSetDeadlineModal = (row) => {
    setModalMode("single");
    setSelectedProject(row);
    setFormData({
      deadlineDate: row.deadline !== "-" ? row.deadline : "",
      description: "",
    });
    setShowModal(true);
  };

  const openSetDeadlineForAllModal = () => {
    setModalMode("all");
    setSelectedProject(null);
    setFormData({
      deadlineDate: "",
      description: "",
    });
    setShowModal(true);
  };

  const statusBadge = (status) => {
    if (status === "completed") {
      return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
    }
    if (status === "approved") {
      return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
    }
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  };

  const statusLabel = (status) => {
    if (status === "completed") return "Completed";
    if (status === "approved") return "Approved";
    return "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col items-start justify-between card-header md:flex-row md:items-center">
          <div>
            <h1 className="card-title">Project Deadlines</h1>
            <p className="card-subtitle">Set and update deadlines for approved projects only</p>
          </div>
          <button
            type="button"
            onClick={openSetDeadlineForAllModal}
            disabled={approvedProjects.length === 0}
            className="px-4 py-2 mt-3 text-sm font-semibold text-white transition rounded-md md:mt-0 bg-emerald-600 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Set Deadline For All
          </button>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-4 flex-cols md:flex-row">
          <div className="flex-1">
            <label className="block mb-2 text-sm font-medium rounded-md text-slate-700 ">
              Search Students or Projects
              <input
                type="text"
                placeholder="Search by projects or students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full transition-all duration-200 border rounded-lg input-field border-slate-300 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Projects Deadlines</h2>
        </div>
        <div className="overflow-y-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Student</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Project Title</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Status</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Deadline</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Set Deadline At</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Set Deadline</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-slate-200">
              {filteredProjects.map((row) => (
                <tr key={row._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{row.studentName}</div>
                      <div className="text-sm text-slate-500">{row.studentEmail}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4">{row.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(row.status)}`}>
                      {statusLabel(row.status)}
                    </span>
                  </td>

                  <td className="px-6 py-4">{row.deadline}</td>
                  <td className="px-6 py-4">{row.setDeadlineAt}</td>
                  <td className="px-6 py-4">
                    {row.status === "completed" ? (
                      <button
                        type="button"
                        disabled
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-slate-200 text-slate-600 cursor-not-allowed"
                      >
                        Project Completed
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openSetDeadlineModal(row)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        {row.deadline === "-" ? "Set Deadline" : "Update Deadline"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="py-8 text-center text-slate-500">No approved/completed project found matching your criteria.</div>
        )}
      </div>

      {showModal && (
        <ModalShell onClose={closeModal}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-slate-900">
                {modalMode === "all"
                  ? "Set Deadline For All Assigned Students"
                  : selectedProject?.deadline === "-"
                    ? "Set Deadline"
                    : "Update Deadline"}
              </h3>
              <button className="text-slate-400 hover:text-slate-600" onClick={closeModal}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Deadline</label>
                <input
                  type="date"
                  className="w-full input-field"
                  value={formData.deadlineDate}
                  onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Description (optional)</label>
                <textarea
                  className="w-full input-field"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add optional deadline note"
                />
              </div>

              {modalMode === "all" ? null : selectedProject ? (
                <div className="p-4 mt-4 border rounded-lg border-slate-200 bg-slate-50">
                  <div className="mb-2">
                    <div className="text-sm font-semibold text-slate-900">Project Details</div>
                    <div className="text-sm truncate text-slate-700" title={selectedProject.description || ""}>
                      {(selectedProject.description || "").length > 160
                        ? `${selectedProject.description.slice(0, 160)}...`
                        : selectedProject.description || "No description provided."}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <div className="text-xs text-slate-500">Status</div>
                      <div className="text-sm font-medium text-slate-800">{statusLabel(selectedProject.status)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500">Set Deadline At</div>
                      <div className="text-sm font-medium text-slate-800">{selectedProject.setDeadlineAt || "-"}</div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="text-xs text-slate-500">Student</div>
                      <div className="text-sm font-medium text-slate-800">
                        {selectedProject.studentName || "-"} ({selectedProject.studentEmail || "-"})
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex justify-end pt-4 space-x-3">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  className={modalMode === "all" ? "px-4 py-2 font-medium text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-700" : "btn-primary"}
                >
                  {modalMode === "all" ? "Save For All" : "Save Deadline"}
                </button>
              </div>
            </form>
        </ModalShell>
      )}
    </div>
  );
};

export default DeadlinePage;
