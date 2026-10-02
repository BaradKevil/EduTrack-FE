import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const submitProjectProposal = createAsyncThunk(
  "student/submitProjectProposal",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/project-proposal", data);
      toast.success("Project proposal submitted successfully");
      return res.data.data?.project || res.data.data || res.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "You can submit a new proposal only when assigned to a panel and when previous proposal is rejected or completed."
      );
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchProject = createAsyncThunk(
  "student/fetchproject",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/project");

      const project = res.data?.data?.project ?? null;
      return project; 
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      toast.error(error.response?.data?.message || "Failed to fetch project");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const uploadFiles = createAsyncThunk(
  "student/uploadFiles",
  async ({ projectId, files }, thunkAPI) => {
    try {
      if (!projectId) {
        const msg = "No project found. Please submit a project proposal first.";
        toast.error(msg);
        return thunkAPI.rejectWithValue(msg);
      }

      const form = new FormData();
      for (const file of files) form.append("files", file);

      const res = await axiosInstance.post(
        `/student/upload/${projectId}`,
        form
      );

      toast.success(res.data.message || "Files uploaded successfully");
      return res.data.data?.project || res.data;
    } catch (error) {
      const backendMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to upload files";
      toast.error(backendMessage);
      return thunkAPI.rejectWithValue(backendMessage);
    }
  }

);

export const fetchDashboardStats = createAsyncThunk(
  "fetchDashboardStats",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/fetch-dashboard-stats");
      return res.data.data || res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch student dashboard stats");
      return thunkAPI.rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getFeedback = createAsyncThunk(
  "getFeedback", 
  async (projectId, thunkAPI) => {
    try {
      const id = projectId?._id || projectId;
      const res = await axiosInstance.get(`/student/feedback/${id}`);
      return res.data?.data?.feedback || [];
    } catch (error) {
      console.error("Feedback error:", error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch feedback");
    }
  }
);

export const downloadFile = createAsyncThunk(
  "downloadFile",
  async ({projectId, fileId}, thunkAPI) => {
    try{
      const res = await axiosInstance.get(
        `/student/download/${projectId}/${fileId}`,
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

export const fetchStudentVideoConferenceOverview = createAsyncThunk(
  "student/fetchVideoConferenceOverview",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/video-conference");
      return res.data?.data || {};
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch video conference details";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const respondToVideoConferenceInvite = createAsyncThunk(
  "student/respondToVideoConferenceInvite",
  async ({ sessionId, action }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(`/student/video-conference/${sessionId}/respond`, { action });
      toast.success(
        res.data?.message ||
          (action === "accept" ? "Video conference request accepted" : "Video conference request rejected")
      );
      return res.data?.data?.session || null;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to respond to video conference request";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const joinVideoConference = createAsyncThunk(
  "student/joinVideoConference",
  async (sessionId, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/student/video-conference/${sessionId}/join`);
      return {
        sessionId,
        meetingUrl: res.data?.data?.meetingUrl || null,
      };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to join video conference";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const studentSlice = createSlice({
  name: "student",
  initialState: {
    project: null,
    files: [],
    supervisors: [],
    dashboardStats: [],
    supervisor: null,
    deadlines: [],
    feedback: [],
    status: null,
    videoConferenceSessions: [],
    pendingVideoConferenceCount: 0,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(submitProjectProposal.fulfilled, (state, action) => {
      state.project = action.payload || null;
      state.files = action.payload?.files || [];
    });

    builder.addCase(fetchProject.fulfilled, (state, action) => {
      state.project = action.payload || null;
      state.files = action.payload?.files || [];
    });

    builder.addCase(uploadFiles.fulfilled, (state, action) => {
      const updatedProject = action.payload;
      state.project = updatedProject || state.project;
      state.files = updatedProject?.files || state.files;
    });

    builder.addCase(getFeedback.fulfilled, (state, action) => {
      state.feedback = action.payload || [];
    });

    builder.addCase(fetchDashboardStats.fulfilled, (state, action) => { 
      state.dashboardStats = action.payload || [];
    });

    builder.addCase(fetchStudentVideoConferenceOverview.fulfilled, (state, action) => {
      state.videoConferenceSessions = action.payload?.sessions || [];
      state.pendingVideoConferenceCount = action.payload?.pendingRequestsCount || 0;
    });

    builder.addCase(respondToVideoConferenceInvite.fulfilled, (state, action) => {
      const updatedSession = action.payload;
      if (!updatedSession?._id) return;

      state.videoConferenceSessions = (state.videoConferenceSessions || []).map((session) =>
        session._id === updatedSession._id ? updatedSession : session
      );
      state.pendingVideoConferenceCount = (state.videoConferenceSessions || []).filter((session) =>
        session._id === updatedSession._id ? updatedSession.inviteStatus === "pending" : session.inviteStatus === "pending"
      ).length;
    });

    builder.addCase(joinVideoConference.fulfilled, (state, action) => {
      const { sessionId } = action.payload || {};
      if (!sessionId) return;

      state.videoConferenceSessions = (state.videoConferenceSessions || []).map((session) =>
        session._id === sessionId
          ? {
              ...session,
              inviteStatus: "accepted",
              joinedAt: new Date().toISOString(),
            }
          : session
      );
      state.pendingVideoConferenceCount = (state.videoConferenceSessions || []).filter((session) =>
        session._id === sessionId ? false : session.inviteStatus === "pending"
      ).length;
    });
  },
});

export default studentSlice.reducer;
