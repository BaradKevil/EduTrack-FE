/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";

export const fetchTeachers = createAsyncThunk(
  "panel/fetchTeachers",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/teachers");
      return res.data.data?.teachers || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch teachers"
      );
    }
  }
);

export const fetchAllTeachersCount = createAsyncThunk(
  "panel/fetchAllTeachersCount",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/teachers/all");
      return res.data.data?.count || 0;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch teachers count"
      );
    }
  }
);

export const fetchPanels = createAsyncThunk(
  "panel/fetchPanels",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/panels");
      return res.data.data?.panels || [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch panels"
      );
    }
  }
);

export const createPanel = createAsyncThunk(
  "panel/createPanel",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/admin/create-panel", data);
      toast.success(res.data.message || "Panel created successfully");

      // Keep teacher dropdown fresh (assigned ones disappear)
      thunkAPI.dispatch(fetchTeachers());

      return res.data.data?.panel || res.data.data || res.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create panel";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deletePanelAction = createAsyncThunk(
  "panel/deletePanel",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(`/admin/delete-panel/${id}`);
      toast.success(res.data.message || "Panel deleted successfully");

      // Keep teacher dropdown fresh (deleted panel's teachers reappear)
      thunkAPI.dispatch(fetchTeachers());

      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete panel";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Backend does not currently expose GET /admin/panels/:id in this repo.
// To keep UI working, we fetch all panels and select the one we need.
export const fetchPanelById = createAsyncThunk(
  "panel/fetchPanelById",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/admin/panels");
      const panels = res.data.data?.panels || [];
      const panel = panels.find((p) => p._id === id) || null;
      if (!panel) return thunkAPI.rejectWithValue("Panel not found");
      return panel;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch panel"
      );
    }
  }
);

export const fetchStudentPanel = createAsyncThunk(
  "panel/fetchStudentPanel",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get("/student/panel");
      return res.data.data?.panel || null;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch student panel"
      );
    }
  }
);

// Backend endpoints for panel feedback are not implemented in this repo yet.
// Keep UI stable by returning an empty array.
export const fetchPanelFeedbacks = createAsyncThunk(
  "panel/fetchPanelFeedbacks",
  async (_panelId, _thunkAPI) => {
    return [];
  }
);

export const sendStudentNotificationToAdmins = createAsyncThunk(
  "panel/sendStudentNotificationToAdmins",
  async (payload, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/notify/admin", payload);
      toast.success(res.data?.message || "Notification sent to admins");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send notification to admins";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const sendStudentNotificationToPanel = createAsyncThunk(
  "panel/sendStudentNotificationToPanel",
  async (payload, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/student/notify/panel", payload);
      toast.success(res.data?.message || "Notification sent to panel teachers");
      return true;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send notification to panel teachers";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Compatibility exports (older/newer pages use different names)
export const fetchAllPanels = fetchPanels;
export const deletePanel = deletePanelAction;

const panelSlice = createSlice({
  name: "panel",
  initialState: {
    teachers: [],
    totalTeachers: 0,
    panels: [],
    selectedPanel: null,
    studentPanel: null,
    feedbacks: [],
    isLoading: false,
    isCreating: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearPanelMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    clearSelectedPanel(state) {
      state.selectedPanel = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Teachers
      .addCase(fetchTeachers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch teachers";
      })
      .addCase(fetchAllTeachersCount.fulfilled, (state, action) => {
        state.totalTeachers = action.payload;
      })

      // Panels list
      .addCase(fetchPanels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPanels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.panels = action.payload;
      })
      .addCase(fetchPanels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch panels";
      })

      // Create
      .addCase(createPanel.pending, (state) => {
        state.isCreating = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createPanel.fulfilled, (state, action) => {
        state.isCreating = false;
        state.panels.unshift(action.payload);
        state.successMessage = "Panel created successfully";
      })
      .addCase(createPanel.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create panel";
      })

      // Delete
      .addCase(deletePanelAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deletePanelAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.panels = state.panels.filter((p) => p._id !== action.payload);
        state.successMessage = "Panel deleted successfully";
      })
      .addCase(deletePanelAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete panel";
      })

      // Selected panel
      .addCase(fetchPanelById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPanelById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedPanel = action.payload;
      })
      .addCase(fetchPanelById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch panel";
      })

      // Student panel
      .addCase(fetchStudentPanel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentPanel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studentPanel = action.payload;
      })
      .addCase(fetchStudentPanel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch student panel";
      })

      // Panel feedbacks (currently stubbed)
      .addCase(fetchPanelFeedbacks.fulfilled, (state, action) => {
        state.feedbacks = action.payload || [];
      });
  },
});

export const { clearPanelMessages, clearSelectedPanel } = panelSlice.actions;
export default panelSlice.reducer;
