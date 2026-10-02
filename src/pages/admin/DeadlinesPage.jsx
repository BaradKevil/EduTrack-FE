import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProjects } from "../../store/slices/adminSlice";

const DeadlinesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  const projectRows = useMemo(() => {
    return (projects || []).map((p) => ({
      _id: p._id,
      title: p.title || p.projectTitle || "-",
      studentName: p.student?.name || "-",
      studentEmail: p.student?.email || "-",
      panel: p.panel?.panelName || p.panel?.name || "-",
      deadline: p.deadline ? new Date(p.deadline).toISOString().slice(0, 10) : "-",
      updatedAt: p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-",
    }));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const needle = searchTerm.toLowerCase();
    return projectRows.filter(
      (row) =>
        (row.title || "").toLowerCase().includes(needle) ||
        (row.studentName || "").toLowerCase().includes(needle)
    );
  }, [projectRows, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Project Deadlines</h1>
          <p className="card-subtitle">View project deadlines set by teachers</p>
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
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Panel</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Deadline</th>
                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">Updated</th>
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    {row.panel !== "-" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200">
                        {row.panel}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-200">
                        Not Assigned
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">{row.deadline}</td>
                  <td className="px-6 py-4">{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProjects.length === 0 && (
          <div className="py-8 text-center text-slate-500">No project found matching your criteria.</div>
        )}
      </div>
    </div>
  );
};

export default DeadlinesPage;
