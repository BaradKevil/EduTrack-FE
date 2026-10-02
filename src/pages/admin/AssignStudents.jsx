/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPanels } from "../../store/slices/panelSlice";
import {
    fetchStudentsForPanel,
    assignStudentsToPanel,
    fetchPanelStudents,
    removeStudentFromPanel,
} from "../../store/slices/assignStudentSlice";
import {
    Loader,
    Users,
    GraduationCap,
    ChevronDown,
    Trash2,
    UserPlus,
    BookOpen,
    Search,
    X,
} from "lucide-react";
import { getAllUsers, getAllProjects, getAllPanels } from "../../store/slices/adminSlice";

const AssignStudents = () => {
    const dispatch = useDispatch();
    const { panels } = useSelector((state) => state.panel);
    const {
    unassignedStudents,
    panelStudents,
    isLoading,
    isAssigning,
    } = useSelector((state) => state.assignStudent);

    const [selectedPanel, setSelectedPanel] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToRemove, setStudentToRemove] = useState(null);

    useEffect(() => {
    dispatch(fetchPanels());
    dispatch(fetchStudentsForPanel()); 
        }, [dispatch]);

    useEffect(() => {
    if (selectedPanel) {
        dispatch(fetchPanelStudents(selectedPanel));
        setSelectedStudents([]);
    }
    }, [selectedPanel, dispatch]);

    const currentPanelStudents = panelStudents[selectedPanel] || [];
    const slotsLeft = 15 - currentPanelStudents.length;
    const selectedPanelObj = panels.find((p) => p._id === selectedPanel);
    const selectedPanelDepartment = selectedPanelObj?.department || "";

    const filteredStudents = unassignedStudents.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesDepartment = !selectedPanelDepartment || (s.department || "") === selectedPanelDepartment;
    return (
        matchesDepartment && (
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.project?.title?.toLowerCase().includes(q)
        )
    );
    });

    const toggleStudent = (id) => {
    setSelectedStudents((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    };

    const handleAssign = () => {
    if (!selectedPanel || selectedStudents.length === 0) return;
    if (selectedStudents.length > slotsLeft) return;
    dispatch(
        assignStudentsToPanel({ panelId: selectedPanel, studentIds: selectedStudents })
    ).then(() => {
        setSelectedStudents([]);
        dispatch(fetchStudentsForPanel());
        dispatch(fetchPanelStudents(selectedPanel));
        dispatch(fetchPanels());
        dispatch(getAllUsers());
        dispatch(getAllProjects());
        dispatch(getAllPanels());
    });
    };

    const openRemoveModal = (student) => {
    setStudentToRemove(student);
    setShowDeleteModal(true);
    };

    const confirmRemove = () => {
    if (studentToRemove) {
        dispatch(
        removeStudentFromPanel({ panelId: selectedPanel, studentId: studentToRemove._id })
        ).then(() => {
        dispatch(fetchStudentsForPanel());
        dispatch(fetchPanelStudents(selectedPanel));
        dispatch(fetchPanels());
        dispatch(getAllUsers());
        dispatch(getAllProjects());
        dispatch(getAllPanels());
        });
    }
    setShowDeleteModal(false);
    setStudentToRemove(null);
    };

    return (
    <>
        <div className="min-h-screen p-6 bg-gray-50">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
            <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">
                Assign Students to Panel
            </h1>
            <p className="mt-1 text-sm text-gray-500">
                Assign up to 15 students per panel for project evaluation
            </p>
            </div>

          {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
            {[
                {
                label: "Total Panels",
                value: panels.length,
                icon: <BookOpen className="w-5 h-5 text-blue-500" />,
                bg: "bg-blue-50",
                },
                {
                label: "Unassigned Students",
                value: unassignedStudents.length,
                icon: <Users className="w-5 h-5 text-orange-500" />,
                bg: "bg-orange-50",
                },
                {
                label: "Slots Available",
                value: selectedPanel ? slotsLeft : "—",
                icon: <GraduationCap className="w-5 h-5 text-green-500" />,
                bg: "bg-green-50",
                },
            ].map((stat, i) => (
                <div
                key={i}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg"
                >
                <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                </div>
                </div>
            ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Select Panel + Assign */}
            <div className="space-y-5 lg:col-span-1">
              {/* Panel Selector */}
                <div className="p-5 bg-white border border-gray-200 rounded-lg">
                <h3 className="mb-3 text-base font-medium text-gray-900">
                    Select Panel
                </h3>
                <div className="relative">
                    <select
                    value={selectedPanel}
                    onChange={(e) => setSelectedPanel(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                    <option value="">Choose a panel...</option>
                    {panels.map((p) => (
                        <option key={p._id} value={p._id}>
                        {p.panelName} {p.department ? `(${p.department})` : ""}
                        </option>
                    ))}
                    </select>
                    <ChevronDown className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" />
                </div>

                {selectedPanelObj && (
                    <div className="p-3 mt-3 rounded-lg bg-blue-50">
                    <p className="mb-1 text-xs font-medium text-blue-700 uppercase">
                        Department: {selectedPanelObj.department || "N/A"}
                    </p>
                    <p className="mb-1 text-xs font-medium text-blue-700 uppercase">
                        Panel Supervisors
                    </p>
                    {selectedPanelObj.teachers?.map((t) => (
                        <div key={t._id} className="flex items-center gap-2 mt-1">
                        <div className="flex items-center justify-center w-6 h-6 text-xs font-medium text-blue-600 bg-blue-200 rounded-full">
                            {t.name?.[0]}
                        </div>
                        <span className="text-sm text-blue-800">{t.name}</span>
                        </div>
                    ))}
                    </div>
                )}
                </div>

              {/* Assign Button & Selected Count */}
                {selectedPanel && (
                <div className="p-5 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium text-gray-900">
                        Selection
                    </h3>
                    {selectedStudents.length > 0 && (
                        <button
                        onClick={() => setSelectedStudents([])}
                        className="text-xs text-gray-400 hover:text-gray-600"
                        >
                        Clear all
                        </button>
                    )}
                    </div>

                    <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Selected</span>
                        <span className="font-medium text-gray-900">
                        {selectedStudents.length}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Already in panel</span>
                        <span className="font-medium text-gray-900">
                        {currentPanelStudents.length}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Slots remaining</span>
                        <span
                        className={`font-medium ${
                            slotsLeft <= 3 ? "text-orange-500" : "text-green-600"
                        }`}
                        >
                        {slotsLeft} / 15
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 mt-1 bg-gray-200 rounded-full">
                        <div
                        className="h-2 transition-all bg-blue-500 rounded-full"
                        style={{
                          width: `${(currentPanelStudents.length / 15) * 100}%`,
                        }}
                        />
                    </div>
                    </div>

                    {selectedStudents.length > slotsLeft && (
                    <p className="mb-3 text-xs text-red-500">
                        Too many selected. Only {slotsLeft} slot(s) available.
                    </p>
                    )}

                    <button
                    onClick={handleAssign}
                    disabled={
                        isAssigning ||
                        selectedStudents.length === 0 ||
                        selectedStudents.length > slotsLeft
                    }
                    className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {isAssigning ? (
                        <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Assigning...
                        </>
                    ) : (
                        <>
                        <UserPlus className="w-4 h-4" />
                        Assign {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ""} to Panel
                        </>
                    )}
                    </button>
                </div>
                )}
            </div>

            {/* Right: Students */}
            <div className="space-y-5 lg:col-span-2">
              {/* Unassigned Students */}
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-base font-medium text-gray-900">
                    Unassigned Students
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                    {filteredStudents.length}
                    </span>
                </div>

                {/* Search */}
                <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                    <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by student name or project title..."
                        className="w-full py-2 pr-4 text-sm border border-gray-300 rounded-lg pl-9 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {searchQuery && (
                        <button
                        onClick={() => setSearchQuery("")}
                        className="absolute -translate-y-1/2 right-3 top-1/2"
                        >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                        </button>
                    )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                    <Loader className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="py-10 text-center text-gray-500">
                    No unassigned students found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                            Select
                            </th>
                            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                            Student
                            </th>
                            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                            Project Title
                            </th>
                            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                            Status
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredStudents.map((student) => {
                            const isSelected = selectedStudents.includes(student._id);
                            const isDisabled =
                            !isSelected &&
                            selectedStudents.length >= slotsLeft &&
                            selectedPanel;
                            return (
                            <tr
                                key={student._id}
                                onClick={() =>
                                !isDisabled && selectedPanel && toggleStudent(student._id)
                                }
                                className={`transition-colors ${
                                selectedPanel
                                    ? isDisabled
                                    ? "opacity-40 cursor-not-allowed"
                                    : "cursor-pointer hover:bg-gray-50"
                                    : "cursor-default"
                                } ${isSelected ? "bg-blue-50" : ""}`}
                            >
                                <td className="px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={!!isDisabled || !selectedPanel}
                                    onChange={() => {}}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                </td>
                                <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-medium text-blue-600 bg-blue-100 rounded-full">
                                    {student.name?.[0] || "?"}
                                    </div>
                                    <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {student.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {student.email}
                                    </p>
                                    </div>
                                </div>
                                </td>
                                <td className="px-4 py-3">
                                <p className="text-sm text-gray-700">
                                    {student.project?.title || (
                                    <span className="italic text-gray-400">No project</span>
                                    )}
                                </p>
                                </td>
                                <td className="px-4 py-3">
                                {student.project?.status === "approved" ? (
                                    <span className="px-2 py-1 text-xs font-medium text-green-700 rounded bg-green-50">
                                    Approved
                                    </span>
                                ) : student.project?.status === "pending" ? (
                                    <span className="px-2 py-1 text-xs font-medium text-yellow-700 rounded bg-yellow-50">
                                    Pending
                                    </span>
                                ) : student.project?.status === "rejected" ? (
                                    <span className="px-2 py-1 text-xs font-medium text-red-700 rounded bg-red-50">
                                    Rejected
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded">
                                    No Project
                                    </span>
                                )}
                                </td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    </div>
                )}
                </div>

              {/* Students Already in Selected Panel */}
                {selectedPanel && (
                <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-base font-medium text-gray-900">
                        Students in{" "}
                        <span className="text-blue-600">
                        {selectedPanelObj?.panelName}
                        </span>
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
                        {currentPanelStudents.length} / 15
                    </span>
                    </div>

                    {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                    </div>
                    ) : currentPanelStudents.length === 0 ? (
                    <div className="py-8 text-sm text-center text-gray-400">
                        No students assigned to this panel yet
                    </div>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                                #
                            </th>
                            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                                Student
                            </th>
                            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                                Project Title
                            </th>
                            <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">
                                Action
                            </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentPanelStudents.map((student, idx) => (
                            <tr key={student._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-500">
                                {idx + 1}
                                </td>
                                <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-sm font-medium text-green-600 bg-green-100 rounded-full">
                                    {student.name?.[0] || "?"}
                                    </div>
                                    <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {student.name}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {student.email}
                                    </p>
                                    </div>
                                </div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                {student.project?.title || (
                                    <span className="italic text-gray-400">No project</span>
                                )}
                                </td>
                                <td className="px-4 py-3">
                                <button
                                    onClick={() => openRemoveModal(student)}
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
                )}
            </div>
            </div>
        </div>
        </div>

      {/* Remove Confirmation Modal */}
        {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm p-6 bg-white rounded-lg">
            <h2 className="mb-2 text-lg font-medium text-gray-900">
                Remove Student
            </h2>
            <p className="mb-6 text-sm text-gray-600">
                Are you sure you want to remove{" "}
                <span className="font-medium text-gray-900">
                {studentToRemove?.name}
                </span>{" "}
                from this panel?
            </p>
            <div className="flex justify-end gap-3">
                <button
                onClick={() => {
                    setShowDeleteModal(false);
                    setStudentToRemove(null);
                }}
                className="px-4 py-2 text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                Cancel
                </button>
                <button
                onClick={confirmRemove}
                className="px-4 py-2 text-white transition-colors bg-red-600 border border-red-700 rounded-lg hover:bg-red-700"
                >
                Remove
                </button>
            </div>
            </div>
        </div>
        )}
    </>
    );
};

export default AssignStudents;
