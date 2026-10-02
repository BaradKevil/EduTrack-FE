/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";

const CreatePanelModal = ({ onClose, onSubmit, loading, allTeachers }) => {
  const [panelName, setPanelName] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  const toggleTeacher = (id) => {
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTeachers.length !== 3) {
      alert("Please select exactly 3 teachers.");
      return;
    }
    onSubmit({ panelName, department, teachers: selectedTeachers });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg p-6 bg-white shadow-xl rounded-2xl">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Create New Panel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Panel Name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Panel Name
            </label>
            <input
              type="text"
              required
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Panel Alpha"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Department <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Computer Science"
            />
          </div>

          {/* Teacher Selection */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Select Teachers{" "}
              <span className="font-semibold text-blue-600">
                ({selectedTeachers.length}/3)
              </span>
            </label>
            <div className="overflow-y-auto border border-gray-200 divide-y rounded-lg max-h-48">
              {allTeachers.length === 0 ? (
                <p className="p-3 text-sm text-gray-400">No teachers available</p>
              ) : (
                allTeachers.map((teacher) => (
                  <label
                    key={teacher._id}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-blue-50 transition ${
                      selectedTeachers.includes(teacher._id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher._id)}
                      onChange={() => toggleTeacher(teacher._id)}
                      className="accent-blue-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {teacher.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {teacher.email} · {teacher.department || "N/A"}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
            {selectedTeachers.length > 3 && (
              <p className="mt-1 text-xs text-red-500">
                You can select at most 3 teachers.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 transition border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Panel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePanelModal;