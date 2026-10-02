const PanelDetailModal = ({ panel, onClose }) => {
  if (!panel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg p-6 bg-white shadow-xl rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{panel.panelName}</h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        {panel.department && (
          <p className="mb-4 text-sm text-gray-500">
            🏛️ Department: <span className="font-medium">{panel.department}</span>
          </p>
        )}

        <p className="mb-1 text-sm text-gray-500">
          Created by:{" "}
          <span className="font-medium text-gray-700">
            {panel.createdBy?.name || "N/A"}
          </span>
        </p>
        <p className="mb-5 text-xs text-gray-400">
          {new Date(panel.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          Panel Members
        </h3>
        <div className="space-y-3">
          {panel.teachers?.map((teacher, idx) => (
            <div
              key={teacher._id}
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-blue-600 rounded-full shrink-0">
                {idx + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {teacher.name}
                </p>
                <p className="text-xs text-gray-500">{teacher.email}</p>
                {teacher.expertise && (
                  <p className="text-xs text-blue-500 mt-0.5">
                    🎓 {teacher.expertise}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 mt-5 text-sm text-gray-600 transition border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PanelDetailModal;