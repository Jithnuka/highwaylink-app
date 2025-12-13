import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Interceptor to add token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // make sure you save token on login
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default api;
