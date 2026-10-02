import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTeachers,
  fetchPanels,
  fetchAllTeachersCount,
  createPanel,
  deletePanelAction,
} from "../../store/slices/panelSlice";
import { getAllUsers, getAllProjects, getAllPanels, getDashboardStats } from "../../store/slices/adminSlice";
import { Loader, Trash2, Users, BookOpen, GraduationCap, Clock } from "lucide-react";

const panelOptions = [
  "Panel-1",
  "Panel-2",
  "Panel-3", 
  "Panel-4",
  "Panel-5",
  "Panel-6",
  "panel-7",
  "panel-8",
  "panel-9",
];

const departmentOptions = [
  "Computer",
  // "IT",
  // "Mechanical",
  // "Civil",
  // "Electrical",
  // "Electronics",
  // "Chemical",
  // "Production",
];

const AssignPanel = () => {
  const dispatch = useDispatch();
  const { teachers, totalTeachers, panels, isLoading, isCreating } = useSelector(
    (state) => state.panel
  );

  const [selectedTeachers, setSelectedTeachers] = useState(["", "", ""]);
  const [panelNo, setPanelNo] = useState("");
  const [department, setDepartment] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [panelToDelete, setPanelToDelete] = useState(null);       // ← Added this

  useEffect(() => {
    dispatch(fetchTeachers());
    dispatch(fetchPanels());
    dispatch(fetchAllTeachersCount());     
  }, [dispatch]);

  const handleTeacherChange = (index, value) => {
    const updated = [...selectedTeachers];
    updated[index] = value;
    setSelectedTeachers(updated);
  };

  const handleDepartmentChange = (value) => {
    setDepartment(value);
    setSelectedTeachers(["", "", ""]);
  };

  const getAvailableTeachers = (currentIndex) => {
    const otherSelected = selectedTeachers.filter(
      (_, i) => i !== currentIndex && _ !== ""
    );
    return teachers.filter(
      (t) =>
        !otherSelected.includes(t._id) &&
        (!department || (t.department || "") === department)
    );
  };

  const getAvailablePanels = () => {
    const createdPanelNames = panels.map((p) => p.panelName);
    return panelOptions.filter((p) => !createdPanelNames.includes(p));
  };

  const handleCreatePanel = () => {
    const filledTeachers = selectedTeachers.filter((t) => t !== "");
    if (filledTeachers.length !== 3) {
      return;
    }
    if (!department) {
      return;
    }
    if (!panelNo) {
      return;
    }

    dispatch(
      createPanel({
        panelName: panelNo,
        teachers: filledTeachers,
        department,
      })
    );

    setSelectedTeachers(["", "", ""]);
    setPanelNo("");
    setDepartment("");
  };

  const handleReset = () => {
    setSelectedTeachers(["", "", ""]);
    setPanelNo("");
    setDepartment("");
  };

  // Opens modal instead of window.confirm
  const openDeleteModal = (id) => {
    setPanelToDelete(id);
    setShowDeleteModal(true);
  };

  // Actually deletes after confirmation
  const confirmDelete = () => {
    if (panelToDelete) {
      dispatch(deletePanelAction(panelToDelete)).then(() => {
        dispatch(fetchPanels());
        dispatch(fetchTeachers());
        dispatch(getAllUsers());
        dispatch(getAllProjects());
        dispatch(getAllPanels());
        dispatch(getDashboardStats());
      });
    }
    setShowDeleteModal(false);
    setPanelToDelete(null);
  };

  const totalPanels = panels.length;
  const totalTeachersInPanels = new Set(
    panels.flatMap((p) => p.teachers?.map((t) => t._id) || [])
  ).size;

  return (
    <>
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
              Create Panel & Assign Supervisor
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create a new panel with 3 supervisors
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
            {/* Create Panel Form */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg lg:col-span-2">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Create Panel
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Department...</option>
                    {departmentOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {[0, 1, 2].map((index) => (
                  <div key={index}>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Teacher {index + 1}
                    </label>
                    <select
                      value={selectedTeachers[index]}
                      onChange={(e) =>
                        handleTeacherChange(index, e.target.value)
                      }
                      disabled={!department}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{department ? "Select Teacher..." : "Select Department First"}</option>
                      {getAvailableTeachers(index).map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} — {t.department || "No Dept"}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Panel Number */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Panel Number
                  </label>
                  <select
                    value={panelNo}
                    onChange={(e) => setPanelNo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Panel...</option>
                    {getAvailablePanels().map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCreatePanel}
                    disabled={isCreating}
                    className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center">
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      "Create Panel"
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-red-500 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Panel Overview
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Total Panels",
                    value: totalPanels,
                    // icon: <BookOpen className="w-5 h-5 text-blue-500" />,
                  },
                  {
                    label: "Total Teachers", 
                    value: totalTeachers,
                    // icon: <Users className="w-5 h-5 text-green-500" />,
                  },
                  {
                    label: "Available Teachers",
                    value: teachers.length,
                    // icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
                  },
                  {
                    label: "Assigned Teachers",
                    value: totalTeachersInPanels,
                    // icon: <GraduationCap className="w-5 h-5 text-purple-500" />,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panels Table */}
          <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Created Panels
              </h3>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : panels.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                No panels created yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                        #
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                        Panel
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                        Department
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                        Teacher 1
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                        Teacher 2
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                        Teacher 3
                      </th>
                      <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {panels.map((panel, idx) => (
                      <tr key={panel._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-medium text-blue-600 rounded bg-blue-50">
                            {panel.panelName}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {panel.department || "N/A"}
                        </td>
                        {[0, 1, 2].map((i) => (
                          <td key={i} className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-8 h-8 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                                {panel.teachers[i]?.name?.[0] || "?"}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {panel.teachers[i]?.name || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {panel.teachers[i]?.email || ""}
                                </p>
                              </div>
                            </div>
                          </td>
                        ))}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => openDeleteModal(panel._id)}
                            className="p-2 text-red-500 transition-colors rounded-lg hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div> 
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-white rounded-lg">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              Confirm Deletion
            </h2>
            <p className="mb-6 text-sm text-gray-600">
              Are you sure you want to delete this panel?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPanelToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-white transition-colors bg-red-600 border border-red-700 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssignPanel;