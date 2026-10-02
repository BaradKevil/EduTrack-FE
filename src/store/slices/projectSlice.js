import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";


export const downloadProjectFile = createAsyncThunk(
  "downloadProjectFile",
  async ({ projectId, fileId }, thunkAPI) => {
    try {
      const res = await axiosInstance.get(`/project/${projectId}/files/${fileId}/download`,
        { responseType: "blob" }
      );
      return { blob: res.data, projectId, fileId };
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || "Failed to download file";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  });


export const getStudentProject = createAsyncThunk(
  "project/getStudentProject",
  async (_, thunkAPI) => {
    try {
      // Backend currently defines POST /student/project
      const res = await axiosInstance.post("/student/project");
      return res.data.data?.project || null;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch project";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const projectSlice = createSlice({
  name: "project",
  initialState: {
    project: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getStudentProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStudentProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.project = action.payload;
      })
      .addCase(getStudentProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch project";
      });
  },
});

export default projectSlice.reducer;
