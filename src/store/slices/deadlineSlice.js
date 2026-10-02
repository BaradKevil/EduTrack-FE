/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify";


export const createDeadline = createAsyncThunk(
  "createDeadline",
  async ({ id, data }, thunkAPI) => {
    try{
      const res = await axiosInstance.post(
        `/deadline/create-deadline/${id}`,
        data
      );
      toast.success(res.data.message || "Deadline updated");
      return res.data.data?.deadline || res.data.data || res.data;
    } catch (error) {
      toast.error(error.response.data.message || "Failed to update or create deadline");
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const createDeadlineForAll = createAsyncThunk(
  "createDeadlineForAll",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/deadline/create-deadline-for-all", data);
      toast.success(res.data.message || "Deadline updated for all assigned students");
      return res.data.data || {};
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update deadlines for all assigned students";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const deadlineSlice = createSlice({
  name: "deadline",
  initialState: {
    deadlines: [],
    nearby: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createDeadline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeadline.fulfilled, (state, action) => {
        state.loading = false;
        const item = action.payload;
        if (item) {
          const idx = state.deadlines.findIndex((d) => d._id === item._id);
          if (idx >= 0) state.deadlines[idx] = item;
          else state.deadlines.unshift(item);
        }
      })
      .addCase(createDeadline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to save deadline";
      })
      .addCase(createDeadlineForAll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDeadlineForAll.fulfilled, (state, action) => {
        state.loading = false;
        const items = action.payload?.deadlines || [];
        items.forEach((item) => {
          const idx = state.deadlines.findIndex((d) => d._id === item._id);
          if (idx >= 0) state.deadlines[idx] = item;
          else state.deadlines.unshift(item);
        });
      })
      .addCase(createDeadlineForAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to save deadlines";
      });
  },
});

export default deadlineSlice.reducer;
