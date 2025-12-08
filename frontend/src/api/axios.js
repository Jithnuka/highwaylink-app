import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const publicEndpoints = ['/rides', '/rides/search', '/rides/public'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => error.config?.url?.includes(endpoint));
      
      // Don't redirect if it's a public endpoint or user lookup
      if (!isPublicEndpoint && !error.config?.url?.includes("/users/")) {
        console.error("Authentication failed. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes("/login") && !window.location.pathname === "/") {
          window.location.href = "/login";
        }
      }
    }
    
    if (error.response?.status === 404 && error.config?.url?.includes("/users/")) {
      // Return a rejected promise without logging
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default api;
