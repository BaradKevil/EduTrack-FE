/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const createStudent = createAsyncThunk(
  "createStudent",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-student", data);
      toast.success(res.data.message || "Student created successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const bulkCreateStudents = createAsyncThunk(
  "bulkCreateStudents",
  async (file, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post("/admin/bulk-create-students", formData);

      const result = res.data?.data || {};
      toast.success(res.data?.message || "Bulk student upload completed");
      if ((result.failedCount || 0) > 0) {
        toast.warn(`${result.failedCount} student row(s) failed validation`);
      }

      return result;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload students file");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateStudent = createAsyncThunk(
  "updateStudent",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/update-student/${id}`, data);
      toast.success(res.data.message || "Student updated successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "deleteStudent",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-student/${id}`);
      toast.success(res.data.message || "Student deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete student");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createTeacher = createAsyncThunk(
  "createTeacher",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-teacher", data);
      toast.success(res.data.message || "Teacher created successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const bulkCreateTeachers = createAsyncThunk(
  "bulkCreateTeachers",
  async (file, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axiosInstance.post("/admin/bulk-create-teachers", formData);

      const result = res.data?.data || {};
      toast.success(res.data?.message || "Bulk teacher upload completed");
      if ((result.failedCount || 0) > 0) {
        toast.warn(`${result.failedCount} teacher row(s) failed validation`);
      }

      return result;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload teachers file");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateTeacher = createAsyncThunk(
  "updateTeacher",
  async ({ id, data }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/admin/update-teacher/${id}`, data);
      toast.success(res.data.message || "Teacher updated successfully");
      return res.data.data.user;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteTeacher = createAsyncThunk(
  "deleteTeacher",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-teacher/${id}`);
      toast.success(res.data.message || "Teacher deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete teacher");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "getAllUsers",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/users");
      // backend returns { success, data: { users: [...] } }
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllProjects = createAsyncThunk(
  "getAllProjects",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/projects");
      // backend returns { success, data: { projects: [...] } }
      return res.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch projects");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getDashboardStats = createAsyncThunk(
  "getDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/dashboard-stats");
      return res.data.data; 
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch dashboard stats");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllPanels = createAsyncThunk(
  "getAllPanels",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/panels");
      return res.data.data.panels;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch panels");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deletePanel = createAsyncThunk(
  "deletePanel",
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/admin/delete-panel/${id}`);
      toast.success("Panel deleted successfully");
      return id;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete panel");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createPanel = createAsyncThunk(
  "createPanel",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-panel", data);
      toast.success(res.data.message || "Panel created successfully");
      return res.data.data.panel;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create panel");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const sendFeedbackToPanel = createAsyncThunk(
  "admin/sendFeedbackToPanel",
  async ({ panelId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/admin/feedback/panel/${panelId}`, payload);
      toast.success(res.data?.message || "Feedback sent to panel teachers");
      return res.data?.data || {};
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send feedback to panel";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const sendFeedbackToStudent = createAsyncThunk(
  "admin/sendFeedbackToStudent",
  async ({ studentId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/admin/feedback/student/${studentId}`, payload);
      toast.success(res.data?.message || "Feedback sent to student");
      return res.data?.data || {};
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send feedback to student";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    stats: {
      totalStudents: 0,
      totalTeachers: 0,
      totalPanels: 0,
      totalProjects: 0,
      completedProjects: 0,
      approvedProjects: 0,
      pendingProjects: 0,
    },
    users: [],
    projects: [],
    panels: [],
    isLoading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(getDashboardStats.pending, (state) => { state.isLoading = true; })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload; // now correctly { totalStudents, totalTeachers, ... }
      })
      .addCase(getDashboardStats.rejected, (state) => { state.isLoading = false; })

      // Users
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload.users;
      })

      // Projects
      .addCase(getAllProjects.fulfilled, (state, action) => {
        state.projects = action.payload.projects || [];
      })

      // Panels
      .addCase(getAllPanels.fulfilled, (state, action) => {
        state.panels = action.payload || [];
      })
      .addCase(deletePanel.fulfilled, (state, action) => {
        state.panels = state.panels.filter((p) => p._id !== action.payload);
      })
      .addCase(createPanel.fulfilled, (state, action) => {
        state.panels.unshift(action.payload);
      })

      // Students
      .addCase(createStudent.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(bulkCreateStudents.fulfilled, (state, action) => {
        const insertedUsers = action.payload?.insertedUsers || [];
        if (insertedUsers.length) {
          state.users = [...insertedUsers, ...state.users];
        }
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? { ...u, ...action.payload } : u
        );
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })

      // Teachers
      .addCase(createTeacher.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(bulkCreateTeachers.fulfilled, (state, action) => {
        const insertedUsers = action.payload?.insertedUsers || [];
        if (insertedUsers.length) {
          state.users = [...insertedUsers, ...state.users];
        }
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? { ...u, ...action.payload } : u
        );
      })
      .addCase(deleteTeacher.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      });
  },
});

export default adminSlice.reducer;
