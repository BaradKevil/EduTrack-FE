import { useState, useMemo, useEffect } from "react";
import {useDispatch, useSelector} from "react-redux";
import AddStudent from "../../components/modal/AddStudent"; 
import {getAllUsers, getAllProjects, getAllPanels, updateStudent,deleteStudent} from "../../store/slices/adminSlice";
import {CheckCircle, Plus, TriangleAlert, Users} from "lucide-react"
import {toggleStudentModal} from "../../store/slices/popupSlice"; 

const ManageStudents = () => {
  const {users, projects, panels} = useSelector((state) => state.admin);
  const {isCreateStudentModalOpen} = useSelector(state => state.popup);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    oldPassword: "",
    newPassword: "",
  });

  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllProjects());
    dispatch(getAllPanels());
  }, [dispatch]);

  const students = useMemo(() => {
    const studentUsers = (users || []).filter((user) => user.role?.toLowerCase() === "student");
    const panelNameById = new Map((panels || []).map((panel) => [String(panel._id), panel.panelName]));

    return studentUsers.map(student => {
      const studentProject = (projects || []).find((proj) => {
        const projectStudentId = typeof proj.student === "string" ? proj.student : proj.student?._id;
        return String(projectStudentId || "") === String(student._id || "");
      });

      const userPanelId =
        typeof student.panel === "string" ? student.panel : student.panel?._id;

      const panelName =
        panelNameById.get(String(userPanelId || "")) ||
        (typeof student.panel === "object" ? student.panel?.panelName : null) ||
        studentProject?.panel?.panelName ||
        null;

      return {
        ...student,
        projectTitle: studentProject?.title || null,
        panelName,
        projectStatus: studentProject?.status || null,
      };
    });
  }, [users, projects, panels]);

  const departments = useMemo(() => {
    const set = new Set((students || []).map((s) => s.department).filter(Boolean)); 
    return Array.from(set);
  }, [students]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.email || "").toLowerCase().includes(searchTerm.toLowerCase()); 
    const matchesFilter =
      filterDepartment === "All" || student.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
    setFormData({
      name: "", 
      email: "",
      department: "",
      oldPassword: "",
      newPassword: "",
    });
  };
            
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingStudent) {
      const resultAction = await dispatch(updateStudent({ id: editingStudent._id, data: formData }));
      if (updateStudent.fulfilled.match(resultAction)) {
        handleCloseModal();
      }
      return;
    }
    handleCloseModal(); 
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      department: student.department,
      oldPassword: "",
      newPassword: "",
    });
    setShowModal(true); 
  }

  const handleDelete = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  }

  const confirmDelete = () => {
    if (studentToDelete) {
      dispatch(deleteStudent(studentToDelete._id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    }
  }; 

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  }; 

  return (
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="px-6 py-8 mx-auto max-w-7xl lg:px-8">
          <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col items-start justify-between md:flex-row md:items-center"> 
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Manage Students</h1> 
                <p className="mt-1 text-sm text-slate-600">Add, edit, and manage student accounts</p> 
              </div>
              <button 
                className="flex items-center px-4 py-2 mt-4 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 md:mt-0" 
                onClick={() => dispatch(toggleStudentModal())}
              >
                <Plus className="w-5 h-5 mr-2"/> 
                <span>Add New Student</span> 
              </button>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" /> 
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Students</p> 
                    <p className="text-2xl font-semibold text-slate-900">{students.length}</p> 
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-purple-600" /> 
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Completed Projects</p> 
                    <p className="text-2xl font-semibold text-slate-900">
                      {students.filter((student) => student.projectStatus === "completed").length}
                    </p> 
                  </div>
                </div>
              </div> 

              <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <TriangleAlert className="w-6 h-6 text-yellow-600" /> 
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Unassigned</p> 
                      <p className="text-2xl font-semibold text-slate-900">
                      {students.filter(student => !student.panelName).length}
                      </p> 
                    </div>
                  </div>
              </div>
            </div>

            {/* FILTERS */} 
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-slate-700"> 
                  Search Students
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>

              <div className="w-full md:w-64"> 
                <label className="block mb-2 text-sm font-medium text-slate-700">Filter Status</label> 
                <select 
                  className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={filterDepartment} 
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="All">All Departments</option>
                  {
                    departments.map((dept) => (
                      <option value={dept} key={dept}>{dept}</option>
                    ))
                  }
                </select>
              </div>
            </div>

            {/* STUDENTS TABLE */}
            <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Students List</h2> 
              </div>
              <div className="overflow-x-auto">

                  {
                    filteredStudents && filteredStudents.length > 0 ? (
                      <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">Student Info</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">Department & Year</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">Panel</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">Project Title</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">Project Status</th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600">Actions</th> 
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                          No students found
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => {
                        return(

                          // Student Row
                          <tr key={student._id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-slate-900">{student.name}</div>
                                <div className="text-sm text-slate-500">{student.email}</div>
                                {
                                  student.studentId && (
                                    <div className="text-xs text-slate-400"> 
                                      ID: {student.studentId}
                                    </div>
                                  )
                                }
                              </div>
                            </td>


                              {/* Department & Year */}
                            <td className="px-6 py-4 whitespace-nowrap"> 
                              <div className="text-sm text-slate-900"> 
                                {student.department || "-"} 
                              </div> 
                              <div className="text-sm text-slate-500">  
                                {student.createdAt ? new Date(student.createdAt).getFullYear() : "-"} 
                              </div> 
                            </td>


                                {/* Panel */}
                            <td className="px-6 py-4 whitespace-nowrap"> 
                              {
                                student.panelName ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Assigned
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Not Assigned
                                  </span>
                                )
                              }
                            </td> 

                              {/* Project Title */}
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-900">
                                {student.projectTitle || "-"} 
                              </div>
                            </td>

                              {/* Project Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {student.projectStatus ? (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                    student.projectStatus === "approved"
                                      ? "bg-green-100 text-green-800"
                                      : student.projectStatus === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : student.projectStatus === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : student.projectStatus === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {student.projectStatus}
                                </span>
                              ) : (
                                <span className="text-sm text-slate-500">-</span>
                              )}
                            </td>

                              {/* Edit and Delete Actions */}
                            <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                              <div className="flex space-x-3">
                                <button 
                                  onClick={() => handleEdit(student)} 
                                  className="text-blue-600 transition hover:text-blue-900"
                                >
                                  Edit 
                                </button> 
                                <button 
                                  onClick={() => handleDelete(student)} 
                                  className="text-red-600 transition hover:text-red-900"
                                >
                                  Delete
                                </button> 
                              </div>
                            </td>

                          </tr>
                        )
                      })
                    )}
                  </tbody> 
                </table>
                    ) : 
                    
                      (filteredStudents.length === 0 && (
                        <div className="py-8 text-center text-slate-500"> 
                          No student found matching your criteria
                        </div> 
                      ))
                    
                  }


                
              </div>

              </div>
            </div>

            {/* Edit Student Modal */}

            {showModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900">
                    {editingStudent ? "Edit Student" : "Add New Student"}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                        required
                        className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700">Department</label>

                    <select className="w-full py-1 border-b input-field border-slate-600 focus:outline-none"
                    required value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})}> 
                      <option value="Computer">Computer </option>
                      {/* <option value="IT">IT</option>
                      <option value="Mechanical">Mechanical </option>
                      <option value="Civil">Civil </option>
                      <option value="Electrical">Electrical </option>
                      <option value="Electronics">Electronics </option>
                      <option value="Chemical">Chemical </option>
                      <option value="Production">Production </option> */}
                      
                    </select>

                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700">Old Password</label>
                      <input
                        type="password"
                        value={formData.oldPassword}
                        onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                        placeholder="Enter old password to change"
                        className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-slate-700">New Password</label>
                      <input
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 transition border rounded-lg border-slate-300 hover:bg-slate-50 text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        {editingStudent ? "Update" : "Create"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              
            )}

        </div>
      </div> 

      {/* Add Student Modal */}
      {isCreateStudentModalOpen && <AddStudent />}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Confirm Delete</h3>
            <p className="mb-6 text-slate-600">Are you sure you want to delete <span className="font-medium">{studentToDelete?.name}</span>?</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={cancelDelete} 
                className="px-4 py-2 transition border rounded-lg border-slate-300 hover:bg-slate-50 text-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 text-white transition bg-red-600 rounded-lg hover:bg-red-700"
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

export default ManageStudents; 
