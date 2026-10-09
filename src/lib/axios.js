import axios from "axios";

const defaultBackend =
  import.meta.env.MODE === "development"
    ? "http://localhost:4000/api/v1"
    : "https://edutrack-be-t3tr.onrender.com/api/v1";

const rawBaseURL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_SERVER_URL ||
  defaultBackend;

const baseURL = rawBaseURL.endsWith("/api/v1")
  ? rawBaseURL
  : `${rawBaseURL.replace(/\/+$/, "")}/api/v1`;

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
