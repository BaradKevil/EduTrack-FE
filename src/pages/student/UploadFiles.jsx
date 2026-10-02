import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, uploadFiles } from "../../store/slices/studentSlice";
import { downloadFile } from "../../store/slices/studentSlice";
import { toast } from "react-toastify";
import {
  Archive,
  CloudUpload,
  Download,
  File,
  FileCode2,
  FileText,
  FilePlus,
} from "lucide-react";

const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project, files } = useSelector((state) => state.student);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const weekRef = useRef(null);
  const reportRef = useRef(null);
  const presRef = useRef(null);
  const codeRef = useRef(null);
  const isCompletedProject = String(project?.status || "").toLowerCase() === "completed";

  const normalizeFileNameKey = (name = "") => {
    const normalized = String(name).trim().toLowerCase();
    const lastDotIndex = normalized.lastIndexOf(".");
    const withoutExtension =
      lastDotIndex > 0 ? normalized.slice(0, lastDotIndex) : normalized;
    return withoutExtension.replace(/\s+/g, " ");
  };

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  const handleFilePick = (e) => {
    const list = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file to upload.");
      return;
    }

    if (isCompletedProject) {
      toast.error("Project is completed. Uploads are locked.");
      return;
    }

    if (!project?._id) {
      toast.error("No project found. Submit a proposal first.");
      return; 
    }

    const existingNames = new Set(
      (files || [])
        .map((f) => normalizeFileNameKey(f?.originalName))
        .filter(Boolean)
    );

    const pendingNameKeys = selectedFiles.map((f) => normalizeFileNameKey(f?.name));
    const duplicateInsideSelection = [];
    const seenPending = new Set();

    pendingNameKeys.forEach((key, idx) => {
      if (!key) return;
      if (seenPending.has(key)) {
        duplicateInsideSelection.push(selectedFiles[idx]?.name);
      } else {
        seenPending.add(key);
      }
    });

    if (duplicateInsideSelection.length > 0) {
      toast.error(
        `Already has same file name: ${[...new Set(duplicateInsideSelection)].join(", ")}. Change file name.`
      );
      setSelectedFiles([]);
      return;
    }

    const duplicateWithExisting = selectedFiles
      .filter((f) => existingNames.has(normalizeFileNameKey(f?.name)))
      .map((f) => f.name);

    if (duplicateWithExisting.length > 0) {
      toast.error(
        `Already has same file name: ${[...new Set(duplicateWithExisting)].join(", ")}. Change file name.`
      );
      setSelectedFiles([]);
      return;
    }

    try {
      await dispatch(uploadFiles({ projectId: project._id, files: selectedFiles })).unwrap();

      setSelectedFiles([]);
      dispatch(fetchProject());
    } catch {
      setSelectedFiles([]);
      // Upload errors are handled by slice toasts.
    }
  };

  const removeSelected = (name) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== name));
  };

  const getFileIcon = (fileName) => {
    const extension = (fileName || "").split(".").pop().toLowerCase();
    const color =
      extension === "pdf"
        ? "text-red-500"
        : ["doc", "docx"].includes(extension)
        ? "text-blue-500"
        : ["ppt", "pptx"].includes(extension)
        ? "text-orange-500"
        : "text-slate-500";
    return <File className={`w-8 h-8 ${color}`} />;
  };

  const handleDownloadFile = async (file) => {
    try {
      const payload = await dispatch(
        downloadFile({ projectId: project._id, fileId: file._id })
      ).unwrap();

      const blob = payload?.blob;
      if (!blob) return;

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.originalName || "downloaded-file");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // Download errors are handled by slice toasts.
    }
  };

  const handleDownloadAll = async () => {
    const uploaded = files || [];
    if (!project?._id || uploaded.length === 0) return;

    for (const file of uploaded) {
      await handleDownloadFile(file);
    }
  };

  const getExtension = (name) => {
    const ext = String(name || "").split(".").pop()?.toLowerCase();
    return ext || "";
  };

  const filteredFiles = (files || []).filter((file) => {
    if (typeFilter === "all") return true;
    const ext = getExtension(file.originalName);
    if (typeFilter === "doc") return ext === "doc" || ext === "docx";
    if (typeFilter === "ppt") return ext === "ppt" || ext === "pptx";
    if (typeFilter === "zip") return ext === "zip";
    if (typeFilter === "txt") return ext === "txt";
    if(typeFilter === "pdf") return ext === "pdf";
    return ext === typeFilter;
  });

    

  return (
    <>
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h1 className="card-title">Upload Project Files</h1>
            <p className="card-subtitle">
              Upload Your Project Weekly Report, Documents, Report and Code Files.
            </p>
          </div>

          {!project && (
            <div className="px-4 py-3 mb-4 text-sm font-medium text-yellow-800 rounded-lg bg-yellow-50">
              ⚠️ You need to submit a project proposal before uploading files.
            </div>
          )}

          {isCompletedProject && (
            <div className="px-4 py-3 mb-4 text-sm font-medium rounded-lg text-emerald-900 bg-emerald-100">
              Project is completed. Uploads and file modifications are now locked.
            </div>
          )}

          {/* Upload Section */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="p-6 text-center transition-colors border-2 border-dashed rounded-lg border-slate-300 hover:border-blue-400">
              <div className="mb-4">
                <CloudUpload className="w-12 h-12 mx-auto text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-800">
                Weekly Report
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Upload Your Project Weekly-Report (JPG, PDF, DOC)
              </p>
              <label className="cursor-pointer btn-outline">
                Choose File
                <input
                  type="file"
                  ref={weekRef}
                  className="hidden"
                  accept=".jpg,.pdf,.doc,.docx"
                  onChange={handleFilePick}
                  multiple
                  disabled={isCompletedProject}
                />
              </label>
            </div>

            <div className="p-6 text-center transition-colors border-2 border-dashed rounded-lg border-slate-300 hover:border-blue-400">
              <div className="mb-4">
                <FileText className="w-12 h-12 mx-auto text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-800">
                Report
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Upload Your Project Report (PDF, DOC)
              </p>
              <label className="cursor-pointer btn-outline">
                Choose File
                <input
                  type="file"
                  ref={reportRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFilePick}
                  multiple
                  disabled={isCompletedProject}
                />
              </label>
            </div>

            <div className="p-6 text-center transition-colors border-2 border-dashed rounded-lg border-slate-300 hover:border-blue-400">
              <div className="mb-4">
                <Archive className="w-12 h-12 mx-auto text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-800">
                Presentation
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Upload Your Presentation (PPT, PPTX, PDF)
              </p>
              <label className="cursor-pointer btn-outline">
                Choose File
                <input
                  type="file"
                  ref={presRef}
                  className="hidden"
                  accept=".pdf,.ppt,.pptx"
                  onChange={handleFilePick}
                  multiple
                  disabled={isCompletedProject}
                />
              </label>
            </div>

            <div className="p-6 text-center transition-colors border-2 border-dashed rounded-lg border-slate-300 hover:border-blue-400">
              <div className="mb-4">
                <FileCode2 className="w-12 h-12 mx-auto text-slate-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-slate-800">
                Code Files
              </h3>
              <p className="mb-4 text-sm text-slate-600">
                Upload Your Source Code File (ZIP, RAR, TAR, GZ)
              </p>
              <label className="cursor-pointer btn-outline">
                Choose File
                <input
                  type="file"
                  ref={codeRef}
                  className="hidden"
                  accept=".zip,.rar,.tar,.gz"
                  onChange={handleFilePick}
                  multiple
                  disabled={isCompletedProject}
                />
              </label>
            </div>
          </div>
          
        </div>

        {/* SELECTED FILES PREVIEW */}
            {selectedFiles.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h2>Ready To Upload</h2>
                </div>
                <div className="space-y-3">
                  {selectedFiles.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-50"
                    >
                      <div className="flex items-center space-x-4">
                        {getFileIcon(file.name)}
                        <div>
                          <p className="font-medium text-slate-800">{file.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <span>{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="ml-auto btn-danger btn-small"
                        onClick={() => removeSelected(file.name)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
            
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleUpload}
                    disabled={!project?._id || selectedFiles.length === 0 || isCompletedProject}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Selected Files
                  </button>
                </div>
              </div>
            )}


        {/* UPLOADED FILES LIST */}
        <div className="card">
          <div className="flex flex-col gap-3 card-header md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="card-title">Uploaded Files</h2>
              <p className="card-subtitle">Manage Your Uploaded Project Files</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-white border rounded-lg border-slate-200"
              >
                <option value="all">All Types</option>
                <option value="pdf">.pdf</option>
                <option value="txt">.txt</option>
                <option value="doc">.doc/.docx</option>
                <option value="ppt">.ppt/.pptx</option>
                <option value="zip">.zip</option>
              </select>

              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={(files || []).length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-3.5 h-3.5" />
                Download All
              </button>
            </div>
          </div>

          {(files || []).length === 0 ? (
            <div className="py-4 text-center">
              <FilePlus className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">No Files Uploaded Yet</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-slate-500">No files found for selected type.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFiles.map((file) => (
                <div
                  key={file._id || file.fileUrl}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-50"
                >
                  <div className="flex items-center space-x-4">
                    {getFileIcon(file.originalName || "")}
                    <div>
                      <p className="font-medium text-slate-800">
                        {file.originalName}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        <span>{file.fileType || "file"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn-outline btn-small" onClick = {() => handleDownloadFile(file)}>Download</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadFiles;