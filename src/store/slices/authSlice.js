/* eslint-disable no-self-assign */
/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";  
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-toastify"; 

export const login = createAsyncThunk("login", async (data, thunkAPI) => {
  try{
    const res = await axiosInstance.post("/auth/login", data); 
    toast.success(res.data.message || "Login successful"); 
    if (res.data?.token) {
      localStorage.setItem("authToken", res.data.token);
    }
    return {
      user: res.data.user,
      token: res.data.token,
    };
  } 
  catch (error) {
    const message = error.response?.data?.error || "Login failed";
    toast.error(message);
    return thunkAPI.rejectWithValue(message); 
  }
}); 

export const signup = createAsyncThunk("signup", async (data, thunkAPI) => {
  try {
    const res = await axiosInstance.post("/auth/signup", data);
    toast.success(res.data.message || "Student registered successfully");
    return null;
  } catch (error) {
    const message = error.response?.data?.error || "Signup failed";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);
  }
});


export const forgotPassword = createAsyncThunk("forgotPassword", async (email, thunkAPI) => {
  try{
    const res = await axiosInstance.post("/auth/forgot-password", email); 
    toast.success(res.data.message || "Password reset email sent successfully"); 
    return null; 
  } 
  catch (error) {
    const message = error.response?.data?.error || "Password reset request failed";
    toast.error(message); 
    return thunkAPI.rejectWithValue(message);  
  }
});  


export const resetPassword = createAsyncThunk("resetPassword", async ({token, password, confirmPassword}, thunkAPI) => {
  try{
    const res = await axiosInstance.put(`/auth/password/reset/${token}`, { password, confirmPassword }); 
    toast.success(res.data.message || "Password reset successfully"); 
    localStorage.removeItem("authToken");
    return null;
  } 
  catch (error) {
    const message = error.response?.data?.error || "Failed to reset password";
    toast.error(message); 
    return thunkAPI.rejectWithValue(message);  
  }
}); 


export const getUser = createAsyncThunk("me", async (_, thunkAPI) => {
  try{
    const res = await axiosInstance.get(`/auth/me`); 
    return res.data.user;  
  } 
  catch (error) {
    const message = error.response?.data?.error || "Failed to fetch user";
    if (message === "Please login to access") {
      localStorage.removeItem("authToken");
    }
    return thunkAPI.rejectWithValue(message);   
  }
}); 


export const logout = createAsyncThunk("logout", async (_, thunkAPI) => {
  try{
    await axiosInstance.get(`/auth/logout`); 
    localStorage.removeItem("authToken");
    return null;  
  } 
  catch (error) {
    localStorage.removeItem("authToken");
    const message = error.response?.data?.error || "Failed to logout";
    toast.error(message);
    return thunkAPI.rejectWithValue(message);   
  }
}); 


const authSlice = createSlice({ 
  name: "auth",
  initialState: {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isUpdatingPassword: false,
    isRequestingForToken: false,
    isCheckingAuth: !!localStorage.getItem("authToken"),
  },
  extraReducers: (builder) => {
    builder
    .addCase(signup.pending, (state) => {
      state.isSigningUp = true;
    })
    .addCase(signup.fulfilled, (state) => {
      state.isSigningUp = false;
    })
    .addCase(signup.rejected, (state) => {
      state.isSigningUp = false;
    })

    .addCase(login.pending, (state) => {
      state.isLoggingIn = true;
    })
    .addCase(login.fulfilled, (state, action) => {
      state.isLoggingIn = false;
      state.authUser = action.payload?.user || null;
    })
    .addCase(login.rejected, (state) => {
      state.isLoggingIn = false;
    })


    .addCase(getUser.pending, (state) => {
      state.isCheckingAuth = true;
      state.authUser = null;
    })
    .addCase(getUser.fulfilled, (state, action) => {
      state.isCheckingAuth = false;
      state.authUser = action.payload;
    })
    .addCase(getUser.rejected, (state, action) => {
      state.isCheckingAuth = false;
      state.authUser = null;
    })


    .addCase(logout.fulfilled, (state, action) => { 
      state.authUser = null;
    })
    .addCase(logout.rejected, (state) => {
      state.authUser = state.authUser;  
    }) 


    .addCase(forgotPassword.pending, (state) => {
      state.isRequestingForToken = true;
    })
    .addCase(forgotPassword.fulfilled, (state, action) => { 
      state.isRequestingForToken = false;
    })
    .addCase(forgotPassword.rejected, (state) => {
      state.isRequestingForToken = false;   
    }) 


    .addCase(resetPassword.pending, (state) => {
      state.isUpdatingPassword = true;
    })
    .addCase(resetPassword.fulfilled, (state, action) => { 
      state.isUpdatingPassword = false;
      state.authUser = null;
    })
    .addCase(resetPassword.rejected, (state) => {
      state.isUpdatingPassword = false;   
    }) 
  }, 
});

export default authSlice.reducer;
