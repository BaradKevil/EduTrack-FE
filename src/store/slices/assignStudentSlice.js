/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

// Fetch students who are NOT yet assigned to any panel
export const fetchStudentsForPanel = createAsyncThunk(
    "assignStudent/fetchStudentsForPanel",
    async (_, thunkAPI) => {
    try {
        const res = await axiosInstance.get("/admin/students/unassigned");
        const studentsFromUnassignedApi = res.data.data?.students || [];
        if (studentsFromUnassignedApi.length > 0) {
          return studentsFromUnassignedApi;
        }

        // Fallback: derive unassigned students from backend users/projects/panels data.
        const [usersRes, projectsRes, panelsRes] = await Promise.all([
          axiosInstance.get("/admin/users"),
          axiosInstance.get("/admin/projects"),
          axiosInstance.get("/admin/panels"),
        ]);

        const users = usersRes.data?.data?.users || [];
        const projects = projectsRes.data?.data?.projects || [];
        const panels = panelsRes.data?.data?.panels || [];
        const validPanelIds = new Set(panels.map((p) => String(p._id)));

        const latestProjectByStudent = new Map();
        projects.forEach((project) => {
          const studentId = String(
            typeof project.student === "string" ? project.student : project.student?._id || ""
          );
          if (!studentId) return;

          const prev = latestProjectByStudent.get(studentId);
          const prevDate = prev?.createdAt ? new Date(prev.createdAt).getTime() : 0;
          const currDate = project?.createdAt ? new Date(project.createdAt).getTime() : 0;
          if (!prev || currDate >= prevDate) {
            latestProjectByStudent.set(studentId, project);
          }
        });

        return users
          .filter((u) => String(u?.role || "").toLowerCase() === "student")
          .filter((u) => {
            const panelId = u?.panel ? String(u.panel) : null;
            return !panelId || !validPanelIds.has(panelId);
          })
          .map((u) => {
            const project = latestProjectByStudent.get(String(u._id));
            return {
              ...u,
              project: project
                ? { title: project.title || null, status: project.status || null }
                : null,
            };
          });
    } catch (error) {
        return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch students"
        );
    }
    }
);

// Fetch students already assigned to a specific panel
export const fetchPanelStudents = createAsyncThunk(
    "assignStudent/fetchPanelStudents",
    async (panelId, thunkAPI) => {
    try {
        const res = await axiosInstance.get(`/admin/panels/${panelId}/students`);
        return { panelId, students: res.data.data?.students || [] };
    } catch (error) {
        return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch panel students"
        );
    }
    }
);

// Assign multiple students to a panel
export const assignStudentsToPanel = createAsyncThunk(
    "assignStudent/assignStudentsToPanel",
    async ({ panelId, studentIds }, thunkAPI) => {
    try {
        const res = await axiosInstance.post("/admin/assign-students", {
        panelId,
        studentIds,
        });
        toast.success(res.data.message || "Students assigned successfully");
        return { panelId, studentIds };
    } catch (error) {
        const message =
        error.response?.data?.message || "Failed to assign students";
        toast.error(message);
        return thunkAPI.rejectWithValue(message);
    }
    }
);

// Remove a student from a panel
export const removeStudentFromPanel = createAsyncThunk(
    "assignStudent/removeStudentFromPanel",
    async ({ panelId, studentId }, thunkAPI) => {
    try {
        const res = await axiosInstance.delete(
        `/admin/panels/${panelId}/students/${studentId}`
        );
        toast.success(res.data.message || "Student removed from panel");
        return { panelId, studentId };
    } catch (error) {
        const message =
        error.response?.data?.message || "Failed to remove student";
        toast.error(message);
        return thunkAPI.rejectWithValue(message);
    }
    }
);

const assignStudentSlice = createSlice({
    name: "assignStudent",
    initialState: {
    unassignedStudents: [],   // students with no panel yet
    panelStudents: {},        // { [panelId]: [students] }
    isLoading: false,
    isAssigning: false,
    error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
    builder
      // Unassigned students
        .addCase(fetchStudentsForPanel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        })
        .addCase(fetchStudentsForPanel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unassignedStudents = action.payload;
        })
        .addCase(fetchStudentsForPanel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        })

      // Panel students
        .addCase(fetchPanelStudents.pending, (state) => {
        state.isLoading = true;
        })
        .addCase(fetchPanelStudents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.panelStudents[action.payload.panelId] = action.payload.students;
        })
        .addCase(fetchPanelStudents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        })

      // Assign
        .addCase(assignStudentsToPanel.pending, (state) => {
        state.isAssigning = true;
        })
        .addCase(assignStudentsToPanel.fulfilled, (state, action) => {
        state.isAssigning = false;
        // Remove assigned students from unassigned list
        const { studentIds } = action.payload;
        state.unassignedStudents = state.unassignedStudents.filter(
            (s) => !studentIds.includes(s._id)
        );
        })
        .addCase(assignStudentsToPanel.rejected, (state, action) => {
        state.isAssigning = false;
        state.error = action.payload;
        })

      // Remove
        .addCase(removeStudentFromPanel.fulfilled, (state, action) => {
        const { panelId, studentId } = action.payload;
        if (state.panelStudents[panelId]) {
            state.panelStudents[panelId] = state.panelStudents[panelId].filter(
            (s) => s._id !== studentId
            );
        }
        });
    },
});

export default assignStudentSlice.reducer;
