/* eslint-disable no-unused-vars */
import { useState, useMemo, useEffect } from "react";
import { toast } from "react-toastify";
import AddTeacher from "../../components/modal/AddTeacher";
import { useDispatch, useSelector } from "react-redux";
import { deleteTeacher, getAllUsers, getAllPanels, updateTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModal } from "../../store/slices/popupSlice";
import { Plus, Users, CheckCircle, TriangleAlert, BadgeCheck } from "lucide-react";


const ManageTeachers = () => {

  const {users, panels} = useSelector((state) => state.admin);
  const {isCreateTeacherModalOpen} = useSelector(state => state.popup);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "", 
    email: "",
    department: "",
    expertise: "",
    oldPassword: "",
    newPassword: "",
  });

  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllPanels());
  }, [dispatch]);

  const teachers = useMemo(() => {
    const teacherUsers = (users || []).filter((user) => user.role?.toLowerCase() === "teacher");

    const panelNameByTeacherId = new Map();
    (panels || []).forEach((panel) => {
      (panel?.teachers || []).forEach((teacher) => {
        const teacherId = typeof teacher === "string" ? teacher : teacher?._id;
        if (teacherId) {
          panelNameByTeacherId.set(String(teacherId), panel.panelName || "-");
        }
      });
    });

    const normalizePanelSort = (panelName) => {
      if (!panelName) return { assigned: 0, number: -1, name: "" };
      const match = String(panelName).match(/(\d+)/);
      return {
        assigned: 1,
        number: match ? Number(match[1]) : Number.MAX_SAFE_INTEGER - 1,
        name: String(panelName).toLowerCase(),
      };
    };

    return teacherUsers
      .map((teacher) => {
        const panelName = panelNameByTeacherId.get(String(teacher._id)) || null;
        return { ...teacher, panelName };
      })
      .sort((a, b) => {
        const aSort = normalizePanelSort(a.panelName);
        const bSort = normalizePanelSort(b.panelName);
        if (aSort.assigned !== bSort.assigned) return aSort.assigned - bSort.assigned;
        if (aSort.number !== bSort.number) return aSort.number - bSort.number;
        if (aSort.name !== bSort.name) return aSort.name.localeCompare(bSort.name);
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [users, panels]);

  const departments = useMemo(() => { 
    const set = new Set((teachers || []).map((t) => t.department).filter(Boolean)); 
    return Array.from(set);
  }, [teachers]);

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = 
      (teacher.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.email || "").toLowerCase().includes(searchTerm.toLowerCase()); 
    const matchesFilter =
      filterDepartment === "All" || teacher.department === filterDepartment;
    return matchesSearch && matchesFilter;
  });

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({
      name: "",  
      email: "",
      department: "",
      expertise: "",
      oldPassword: "",
      newPassword: "",
    });
  };


  const handleSubmit = async (e) => {   
      e.preventDefault();
  
      if (editingTeacher) { 
        const resultAction = await dispatch(updateTeacher({ id: editingTeacher._id, data: formData }));
        if (updateTeacher.fulfilled.match(resultAction)) {
          handleCloseModal();
        }
        return;
      } 
      handleCloseModal(); 
    };
  

    const handleEdit = (teacher) => { 
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.name,
        email: teacher.email,
        department: teacher.department,
        expertise: Array.isArray(teacher.expertise) ? teacher.expertise[0] : teacher.expertise, 
        oldPassword: "",
        newPassword: "",
      });
      setShowModal(true); 
    }
  
    const handleDelete = (teacher) => {
      setTeacherToDelete(teacher);
      setShowDeleteModal(true);
    }
  
    const confirmDelete = () => {
      if (teacherToDelete) {
        dispatch(deleteTeacher(teacherToDelete._id));
        setShowDeleteModal(false);
        setTeacherToDelete(null);
      }
    }; 
  
    const cancelDelete = () => {
      setShowDeleteModal(false);
      setTeacherToDelete(null); 
    }; 
  
  
  return <>

      <div className="min-h-screen bg-slate-50">
        <div className="px-6 py-8 mx-auto max-w-7xl lg:px-8">
          <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col items-start justify-between md:flex-row md:items-center"> 
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Manage Teachers</h1> 
                <p className="mt-1 text-sm text-slate-600">Add, edit, and manage teacher accounts</p> 
              </div>
              <button 
                className="flex items-center px-4 py-2 mt-4 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700 md:mt-0" 
                onClick={() => dispatch(toggleTeacherModal())}
              >
                <Plus className="w-5 h-5 mr-2"/> 
                <span>Add New Teacher</span> 
              </button>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" /> 
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Teachers</p> 
                    <p className="text-2xl font-semibold text-slate-900">{teachers.length}</p> 
                  </div> 
                </div>
              </div>

              <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
                <div className="flex items-center">
                  <div className="p-3 bg-indigo-100 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Total Panels</p>
                    <p className="text-2xl font-semibold text-slate-900">{(panels || []).length}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border rounded-lg shadow-sm border-slate-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BadgeCheck className="w-6 h-6 text-purple-600" /> 
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600">Assigned Students</p> 
                    <p className="text-2xl font-semibold text-slate-900">
                      {teachers.reduce((sum, t) => sum + (t.assignedStudent?.length || t.assignedStudents?.length || 0), 0)}
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
                    <p className="text-sm font-medium text-slate-600">Departments</p>  
                    <p className="text-2xl font-semibold text-slate-900">
                      {departments.length} 
                    </p> 
                  </div>
                </div>
              </div>
            </div>

            {/* FILTERS */} 
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-slate-700"> 
                  Search Teachers 
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

            {/* TEACHERS TABLE */}
            <div className="overflow-hidden bg-white border rounded-lg shadow-sm border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Teachers List</h2> 
              </div>
              <div className="overflow-x-auto">

                  {
                    filteredTeachers && filteredTeachers.length > 0 ? (
                      <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600"> Teacher Info </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600"> Department </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600"> Expertise </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600"> Panel Name </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600"> Join Date </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-600"> Actions </th> 
                    </tr> 
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200"> 
                    {filteredTeachers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                          No teachers found
                        </td>
                      </tr>
                    ) : (
                      filteredTeachers.map((teacher, index) => {
                        const previousPanel = index > 0 ? (filteredTeachers[index - 1].panelName || "Not Assigned") : null;
                        const currentPanel = teacher.panelName || "Not Assigned";
                        const isNewPanelGroup = index === 0 || previousPanel !== currentPanel;

                        return [
                          ...(isNewPanelGroup
                            ? [
                                ...(index > 0
                                  ? [
                                      <tr key={`gap-${currentPanel}-${teacher._id}`} className="bg-white">
                                        <td colSpan="6" className="py-3"></td>
                                      </tr>,
                                    ]
                                  : []),
                                <tr key={`group-${currentPanel}-${teacher._id}`} className="bg-slate-100">
                                  <td colSpan="6" className="px-6 py-2 text-xs font-semibold tracking-wide uppercase text-slate-700">
                                    {currentPanel}
                                  </td>
                                </tr>,
                              ]
                            : []),
                          <tr key={teacher._id} className="hover:bg-slate-50">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-slate-900">{teacher.name}</div>
                                  <div className="text-sm text-slate-500">{teacher.email}</div>
                                </div>
                              </td>

                                {/* Department & Year */}
                              <td className="px-6 py-4 whitespace-nowrap"> 
                                <div className="text-sm text-slate-900"> 
                                  {teacher.department || "-"} 
                                </div> 
                              </td> 


                                  {/* Expertise */}
                              <td className="px-6 py-4 whitespace-nowrap"> 
                              {
                                Array.isArray(teacher.expertise) ? teacher.expertise.join(", ") : (teacher.expertise || "-") 
                              }
                              </td> 


                                {/* Panel Name */}
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    {teacher.panelName ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        {teacher.panelName}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                        Not Assigned
                                      </span>
                                    )}
                                  </td>

                                {/* Join Date */}
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-slate-900">
                                          {teacher.createdAt
                                            ? new Date(teacher.createdAt).toLocaleString("en-GB", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                second: "2-digit",
                                                hour12: false,
                                                    })
                                                  : "-"}
                                              </div>
                                            </td>

                              

                                {/* Edit and Delete Actions */}
                              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                                <div className="flex space-x-3">
                                  <button 
                                    onClick={() => handleEdit(teacher)} 
                                    className="text-blue-600 transition hover:text-blue-900"
                                  >
                                    Edit 
                                  </button> 
                                  <button 
                                    onClick={() => handleDelete(teacher)} 
                                    className="text-red-600 transition hover:text-red-900"
                                  >
                                    Delete
                                  </button> 
                                </div>
                              </td>

                            </tr>,
                        ];
                      })
                    )}
                  </tbody> 
                </table>
                    ) : 
                    
                      (filteredTeachers.length === 0 && (
                        <div className="py-8 text-center text-slate-500"> 
                          No teacher found matching your criteria
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
                    {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
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
                      <label className="block mb-1 text-sm font-medium text-slate-700"> Expertise </label>

                    <select className="w-full py-1 border-b input-field border-slate-600 focus:outline-none"
                    required value={formData.expertise} onChange={(e) => setFormData({...formData, expertise: e.target.value})}> 
                      
                      <option value="Artificial Intelligence"> Artificial Intelligence </option>
                      <option value="Machine Learning"> Machine Learning </option>
                      <option value="Cyber Security"> Cyber Security </option>
                      <option value="Web Development"> Web Development </option>
                      <option value="Database System"> Database System </option>
                      <option value="Computer Network"> Computer Network </option>
                      <option value="Operating Systems"> Operating Systems </option>
                      <option value="Data Science"> Data Science </option> 

                      
                    </select>
                    </div>

                    <div >
                      <label className="block mb-1 text-sm font-medium text-slate-700">Enter Old Password</label>
                      <input
                        type="password"
                        value={formData.oldPassword}
                        onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                        placeholder="Enter old password to change"
                        className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div >
                      <label className="block mb-1 text-sm font-medium text-slate-700">Enter New Password</label>
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
                        {editingTeacher ? "Update" : "Create"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              
            )}

        </div>
      </div> 

      {/* Add Teacher Modal */}
      {isCreateTeacherModalOpen && <AddTeacher />}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Confirm Delete</h3>
            <p className="mb-6 text-slate-600">Are you sure you want to delete <span className="font-medium">{teacherToDelete?.name}</span>?</p>
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

  </>;
  
};

export default ManageTeachers;
