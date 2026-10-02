/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";
import { Building } from "lucide-react";

export const getTeacherDashboardStats = createAsyncThunk(
  "teacher/getDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/fetch-dashboard-stats");
      return res.data.data?.dashboardStats || res.data.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch dashboard stats";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const getTeacherRequests = createAsyncThunk(
  "teacher/getRequests",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/requests");
      return res.data?.data || {};
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch project requests";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const acceptProjectRequest = createAsyncThunk(
  "teacher/acceptProjectRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/teacher/requests/${requestId}/accept`);
      toast.success(res.data?.message || "Project request accepted");
      thunkAPI.dispatch(getTeacherRequests());
      thunkAPI.dispatch(getTeacherDashboardStats());
      thunkAPI.dispatch(getAssignedStudents());
      return res.data?.data?.request || { _id: requestId, status: "approved" };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to accept request";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const rejectProjectRequest = createAsyncThunk(
  "teacher/rejectProjectRequest",
  async (requestId, thunkAPI) => {
    try {
      const res = await axiosInstance.put(`/teacher/requests/${requestId}/reject`);
      toast.success(res.data?.message || "Project request rejected");
      thunkAPI.dispatch(getTeacherRequests());
      thunkAPI.dispatch(getTeacherDashboardStats());
      thunkAPI.dispatch(getAssignedStudents());
      return res.data?.data?.request || { _id: requestId, status: "rejected" };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to reject request";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const markComplete = createAsyncThunk(
  "markComplete",
  async (projectId, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/teacher/mark-complete/${projectId}`);
      toast.success(res.data.message || "Project marked as complete");
      thunkAPI.dispatch(getTeacherRequests());
      thunkAPI.dispatch(getTeacherDashboardStats());
      thunkAPI.dispatch(getAssignedStudents());
      return {
        projectId,
        project: res.data?.data?.project || null,
      };
    } catch (error) {
      toast.error(error.response.data.message || "Failed to mark project as complete");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);


export const addFeedback = createAsyncThunk(
  "addFeedback",
  async ({projectId, payload}, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/teacher/feedback/${projectId}`, payload);
      toast.success(res.data.message || "Feedback added successfully");
      return {
        projectId,
        feedback: res.data.data?.feedback || res.data.data || res.data
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to add feedback";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const getAssignedStudents = createAsyncThunk(
  "getAssignedStudents",
  async (_, thunkAPI) => { 
    try {
      const res = await axiosInstance.get(`/teacher/assigned-students`);
      return res.data.data?.students || res.data.data || res.data;
    } catch (error) {
      const message = error.response.data.message || "Failed to fetch assigned students";
      toast.error(message);
      return thunkAPI.rejectWithValue(message); 
    }
  }
);

export const getTeacherNotificationRecipients = createAsyncThunk(
  "teacher/getNotificationRecipients",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/notification-recipients");
      return res.data?.data?.students || [];
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch notification recipients";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const sendTeacherNotificationToAdmins = createAsyncThunk(
  "teacher/sendNotificationToAdmins",
  async (payload, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/teacher/notify/admin", payload);
      toast.success(res.data?.message || "Notification sent to admins");
      return res.data?.data || {};
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send notification to admins";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const sendTeacherNotificationToStudent = createAsyncThunk(
  "teacher/sendNotificationToStudent",
  async ({ studentId, payload }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/teacher/notify/student/${studentId}`, payload);
      toast.success(res.data?.message || "Notification sent to student");
      return res.data?.data || {};
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send notification to student";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const sendTeacherNotificationToAllAssignedStudents = createAsyncThunk(
  "teacher/sendNotificationToAllAssignedStudents",
  async (payload, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/teacher/notify/students/all", payload);
      toast.success(res.data?.message || "Notification sent to all assigned students");
      return res.data?.data || {};
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send notification to assigned students";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


export const downloadPanelFile = createAsyncThunk(
  "downloadPanelFile",
  async ({projectId, fileId}, thunkAPI) => {
    try{
      const res = await axiosInstance.get(
        `/teacher/download/${projectId}/${fileId}`,
        {
          responseType: "blob",
        }
      );
      return { blob: res.data, projectId, fileId };
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to download file");
      return thunkAPI.rejectWithValue(error.response?.data?.message); 
    }
  }
);


export const getFiles = createAsyncThunk(
  "getPanelFiles",
  async (_, thunkAPI) => {
    try{
      const res = await axiosInstance.get(`/teacher/files`,);
      return res.data?.data?.files || res.data.data || res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch files");
      return thunkAPI.rejectWithValue(error.response?.data?.message); 
    }
  }
);

export const getVideoConferenceOverview = createAsyncThunk(
  "teacher/getVideoConferenceOverview",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/teacher/video-conference");
      return res.data?.data || {};
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch video conference overview";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const startVideoConferenceWithStudent = createAsyncThunk(
  "teacher/startVideoConferenceWithStudent",
  async (studentId, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/teacher/video-conference/student/${studentId}`);
      toast.success(res.data?.message || "Video call invitation sent");
      thunkAPI.dispatch(getVideoConferenceOverview());
      return res.data?.data?.session || null;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to start individual video call";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const startVideoConferenceForAllStudents = createAsyncThunk(
  "teacher/startVideoConferenceForAllStudents",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/teacher/video-conference/students/all");
      toast.success(res.data?.message || "Conference call invitation sent");
      thunkAPI.dispatch(getVideoConferenceOverview());
      return res.data?.data?.session || null;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to start conference call";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const teacherSlice = createSlice({
  name: "teacher",
  initialState: {
    assignedStudents: [],
    notificationRecipients: [],
    files: [],
    pendingRequests: [],
    optimisticRequests: {},
    totalRequests: 0,
    videoConferenceStudents: [],
    videoConferenceSessions: [],
    latestVideoConferenceSession: null,
    dashboardStats: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {

      //Assigned Students
      builder.addCase(getAssignedStudents.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      });

      builder.addCase(getAssignedStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedStudents = action.payload?.students|| action.payload || null;
      });

      builder.addCase(getAssignedStudents.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch assigned students";
        state.loading = false;
      })

      .addCase(getTeacherNotificationRecipients.fulfilled, (state, action) => {
        state.notificationRecipients = action.payload || [];
      })
      .addCase(getVideoConferenceOverview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVideoConferenceOverview.fulfilled, (state, action) => {
        state.loading = false;
        state.videoConferenceStudents = action.payload?.students || [];
        state.videoConferenceSessions = action.payload?.sessions || [];
      })
      .addCase(getVideoConferenceOverview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch video conference overview";
      })
      .addCase(startVideoConferenceWithStudent.fulfilled, (state, action) => {
        state.latestVideoConferenceSession = action.payload || null;
        if (action.payload) {
          state.videoConferenceSessions = [action.payload, ...(state.videoConferenceSessions || [])];
        }
      })
      .addCase(startVideoConferenceForAllStudents.fulfilled, (state, action) => {
        state.latestVideoConferenceSession = action.payload || null;
        if (action.payload) {
          state.videoConferenceSessions = [action.payload, ...(state.videoConferenceSessions || [])];
        }
      })


      //Feedback
      builder.addCase(addFeedback.fulfilled, (state, action) => {
        const { projectId, feedback } = action.payload || {};
        state.assignedStudents = state.assignedStudents.map((s) => 
        s.project?._id === projectId ? { ...s, feedback } : s
      );
      });

      // Mark complete
      builder.addCase(markComplete.fulfilled, (state, action) => {
        const projectId = action.payload?.projectId || action.meta.arg;
        state.assignedStudents = (state.assignedStudents || []).map((s) => {
          if (s.project?._id === projectId) {
            return {
              ...s,
              project: {
                ...s.project,
                ...(action.payload?.project || {}),
                status: "completed",
              },
            };
          }
          return s;
        }
        );

        state.pendingRequests = (state.pendingRequests || []).map((req) => {
          const isSameProject = req?._id === projectId || req?.latestProject?._id === projectId;
          if (!isSameProject) return req;

          return {
            ...req,
            status: "completed",
            latestProject: {
              ...(req?.latestProject || {}),
              ...(action.payload?.project || {}),
              status: "completed",
            },
          };
        });

      });

      //Files
      builder.addCase(getFiles.fulfilled, (state, action) => {
        state.files = action.payload?.files || action.payload || [];
      });


      // Teacher dashboard
    builder
      .addCase(getTeacherDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeacherDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload || null;
      })
      .addCase(getTeacherDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch dashboard stats";
      })

      // Teacher Requests
      .addCase(getTeacherRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTeacherRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload?.requests || [];
        state.totalRequests = action.payload?.total || 0;
      })
      .addCase(getTeacherRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch project requests";
      })

      //Project  accept request
      .addCase(acceptProjectRequest.pending, (state, action) => {
        const requestId = action.meta.arg;
        const idx = state.pendingRequests.findIndex((req) => req._id === requestId);
        if (idx === -1) return;

        const current = state.pendingRequests[idx];
        const wasPending = String(current?.status || "").toLowerCase() === "pending";
        state.optimisticRequests[requestId] = { previousRequest: current, wasPending };
        state.pendingRequests[idx] = { ...current, status: "approved" };

        if (wasPending && state.dashboardStats?.totalPendingRequests > 0) {
          state.dashboardStats.totalPendingRequests -= 1;
        }
      })
      .addCase(acceptProjectRequest.fulfilled, (state, action) => {
        const acceptedId = action.payload?._id || action.meta.arg;
        const idx = state.pendingRequests.findIndex((req) => req._id === acceptedId);
        if (idx !== -1) {
          state.pendingRequests[idx] = {
            ...state.pendingRequests[idx],
            ...action.payload,
            status: action.payload?.status || "approved",
          };
        }
        if (acceptedId && state.optimisticRequests[acceptedId]) {
          delete state.optimisticRequests[acceptedId];
        }
      })
      .addCase(acceptProjectRequest.rejected, (state, action) => {
        const requestId = action.meta.arg;
        const rollback = state.optimisticRequests[requestId];
        if (!rollback) return;

        const idx = state.pendingRequests.findIndex((req) => req._id === requestId);
        if (idx !== -1) {
          state.pendingRequests[idx] = rollback.previousRequest;
        } else {
          state.pendingRequests.unshift(rollback.previousRequest);
        }

        if (rollback.wasPending && typeof state.dashboardStats?.totalPendingRequests === "number") {
          state.dashboardStats.totalPendingRequests += 1;
        }
        delete state.optimisticRequests[requestId];
      })

      //Project reject request
      .addCase(rejectProjectRequest.pending, (state, action) => {
        const requestId = action.meta.arg;
        const idx = state.pendingRequests.findIndex((req) => req._id === requestId);
        if (idx === -1) return;

        const current = state.pendingRequests[idx];
        const wasPending = String(current?.status || "").toLowerCase() === "pending";
        state.optimisticRequests[requestId] = { previousRequest: current, wasPending };
        state.pendingRequests[idx] = { ...current, status: "rejected" };

        if (wasPending && state.dashboardStats?.totalPendingRequests > 0) {
          state.dashboardStats.totalPendingRequests -= 1;
        }
      })
      .addCase(rejectProjectRequest.fulfilled, (state, action) => {
        const rejectedId = action.payload?._id || action.meta.arg;
        state.pendingRequests = (state.pendingRequests || []).filter((req) => req._id !== rejectedId);
        if (typeof state.totalRequests === "number" && state.totalRequests > 0) {
          state.totalRequests -= 1;
        }
        if (rejectedId && state.optimisticRequests[rejectedId]) {
          delete state.optimisticRequests[rejectedId];
        }
      })
      .addCase(rejectProjectRequest.rejected, (state, action) => {
        const requestId = action.meta.arg;
        const rollback = state.optimisticRequests[requestId];
        if (!rollback) return;

        const idx = state.pendingRequests.findIndex((req) => req._id === requestId);
        if (idx !== -1) {
          state.pendingRequests[idx] = rollback.previousRequest;
        } else {
          state.pendingRequests.unshift(rollback.previousRequest);
        }

        if (rollback.wasPending && typeof state.dashboardStats?.totalPendingRequests === "number") {
          state.dashboardStats.totalPendingRequests += 1;
        }
        delete state.optimisticRequests[requestId];
      })
      
  },
});

export default teacherSlice.reducer;
