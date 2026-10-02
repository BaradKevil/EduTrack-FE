/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { bulkCreateTeachers, createTeacher } from "../../store/slices/adminSlice";
import { toggleTeacherModal } from "../../store/slices/popupSlice";
import { FileSpreadsheet, Upload, X } from "lucide-react";
import { toast } from "react-toastify";

const ALLOWED_FILE_EXTENSIONS = ["csv", "xls", "xlsx"];

const DEPARTMENT_EXPERTISE_MAP = {
  Computer: [
    "Artificial Intelligence",
    "Machine Learning",
    "Cyber Security",
    "Web Development",
    "Database System",
    "Computer Network",
    "Operating Systems",
    "Data Science",
  ],
  IT: [
    "Software Engineering",
    "Cloud Computing",
    "DevOps",
    "Information Security",
    "Web Development",
    "Data Analytics",
    "Computer Network",
  ],
  Mechanical: [
    "Thermodynamics",
    "Fluid Mechanics",
    "Heat Transfer",
    "Machine Design",
    "Manufacturing",
    "CAD/CAM",
    "Robotics",
  ],
  Civil: [
    "Structural Engineering",
    "Geotechnical Engineering",
    "Transportation Engineering",
    "Construction Management",
    "Surveying",
    "Environmental Engineering",
    "Hydraulics",
  ],
  Electrical: [
    "Power Systems",
    "Control Systems",
    "Electrical Machines",
    "Power Electronics",
    "High Voltage Engineering",
    "Smart Grid",
    "Renewable Energy",
  ],
  Electronics: [
    "Embedded Systems",
    "VLSI Design",
    "Digital Signal Processing",
    "Microprocessors",
    "Communication Systems",
    "IoT",
    "Instrumentation",
  ],
  Chemical: [
    "Process Engineering",
    "Reaction Engineering",
    "Mass Transfer",
    "Heat Transfer",
    "Process Control",
    "Petrochemical Engineering",
    "Biochemical Engineering",
  ],
  Production: [
    "Operations Management",
    "Quality Control",
    "Industrial Engineering",
    "Supply Chain Management",
    "Lean Manufacturing",
    "Automation",
    "Production Planning",
  ],
};

const AddTeacher = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    expertise: "",
    password: "", 
  });
  const [bulkFile, setBulkFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const isValidBulkFile = (file) => {
    if (!file?.name) return false;
    const extension = file.name.split(".").pop()?.toLowerCase();
    return ALLOWED_FILE_EXTENSIONS.includes(extension);
  };

  const handleBulkFileSelect = (file) => {
    if (!file) return;

    if (file.size === 0) {
      toast.error("Selected file is empty. Please upload a file with teacher rows.");
      return;
    }

    if (!isValidBulkFile(file)) {
      toast.error("Only .csv, .xls and .xlsx files are allowed");
      return;
    }

    setBulkFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    handleBulkFileSelect(droppedFile);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error("Please choose a file first");
      return;
    }

    setIsUploading(true);
    const resultAction = await dispatch(bulkCreateTeachers(bulkFile));
    setIsUploading(false);

    if (bulkCreateTeachers.fulfilled.match(resultAction)) {
      setUploadResult(resultAction.payload);
      setBulkFile(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === "department" ? { expertise: "" } : {}),
    });
  };

  const expertiseOptions = DEPARTMENT_EXPERTISE_MAP[formData.department] || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Dispatch the create teacher action
    dispatch(createTeacher(formData));
    
    // Reset form after submission
    setFormData({
      name: "",
      email: "",
      department: "",
      expertise: "",
      password: "",
    });
    
    // Close modal
    dispatch(toggleTeacherModal());
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: "",
      email: "",
      department: "",
      expertise: "",
      password: "",
    });
    
    // Close the modal
    dispatch(toggleTeacherModal());
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleCancel}
    >
      <div 
        className="w-full max-w-2xl p-6 mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Add New Teacher</h2>
          <button
            onClick={handleCancel}
            className="transition-colors text-slate-400 hover:text-slate-600"
            type="button"
          >
            <X />
          </button>
        </div>

        <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="text-sm font-semibold text-blue-900">Bulk Upload Teachers</h4>
          <p className="mt-1 text-xs text-blue-700">
            Drag and drop or select a .csv/.xls/.xlsx file. Required columns: name, email, password, department, expertise.
          </p>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`mt-3 rounded-lg border-2 border-dashed p-5 text-center transition ${
              isDragOver ? "border-blue-500 bg-blue-100" : "border-blue-300 bg-white"
            }`}
          >
            <FileSpreadsheet className="w-8 h-8 mx-auto text-blue-600" />
            <p className="mt-2 text-sm text-slate-700">Drop file here</p>
            <p className="text-xs text-slate-500">or</p>
            <label className="inline-flex items-center px-3 py-2 mt-2 text-sm text-white transition bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              Select File
              <input
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={(e) => handleBulkFileSelect(e.target.files?.[0])}
              />
            </label>

            {bulkFile && (
              <p className="mt-2 text-xs text-slate-600">
                Selected: <span className="font-medium">{bulkFile.name}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleBulkUpload}
            disabled={!bulkFile || isUploading}
            className="w-full px-4 py-2 mt-3 text-white transition bg-blue-600 rounded-lg disabled:opacity-60 hover:bg-blue-700"
          >
            {isUploading ? "Uploading..." : "Upload and Add Teachers"}
          </button>

          {uploadResult && (
            <div className="p-3 mt-3 bg-white border rounded-lg border-slate-200">
              <p className="text-sm font-medium text-slate-900">
                Processed: {uploadResult.totalRows || 0}, Added: {uploadResult.insertedCount || 0}, Failed: {uploadResult.failedCount || 0}
              </p>
              {(uploadResult.failedRows || []).length > 0 && (
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs border border-slate-200">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-2 py-1 text-left border border-slate-200">Row</th>
                        <th className="px-2 py-1 text-left border border-slate-200">Name</th>
                        <th className="px-2 py-1 text-left border border-slate-200">Email</th>
                        <th className="px-2 py-1 text-left border border-slate-200">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResult.failedRows.map((row) => (
                        <tr key={`${row.rowNumber}-${row.email || row.name || "unknown"}`}>
                          <td className="px-2 py-1 border border-slate-200">{row.rowNumber}</td>
                          <td className="px-2 py-1 border border-slate-200">{row.name || "-"}</td>
                          <td className="px-2 py-1 border border-slate-200">{row.email || "-"}</td>
                          <td className="px-2 py-1 border border-slate-200">{row.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h4 className="text-sm font-semibold text-slate-900">Add Single Teacher</h4>


          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter teacher name"
              required
            />
          </div>

    

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="teacher@example.com"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            > 
              <option value="">Select Department</option>
              <option value="Computer">Computer</option>
              {/* <option value="IT">IT</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Electrical">Electrical</option>
              <option value="Electronics">Electronics</option>
              <option value="Chemical">Chemical</option>
              <option value="Production">Production</option> */}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Expertise
            </label>
            <select
              name="expertise"
              value={formData.expertise}
              onChange={handleChange}
              disabled={!formData.department}
              className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{formData.department ? "Select Expertise" : "Select Department First"}</option>
              {expertiseOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-white border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a Password"
            />
          </div>

          <div className="flex justify-end pt-2 space-x-3">
            <button
              type="button"
              onClick={handleCancel} 
              className="px-4 py-2 transition border rounded-lg border-slate-300 hover:bg-slate-50 text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Teacher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeacher;
