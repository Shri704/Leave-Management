import axios from "axios";

// Ensure base URL is the API root (e.g. https://xxx.onrender.com/api), not a full path like .../api/auth/login
// Otherwise requests become .../api/auth/login + /auth/login → 404
const rawUrl = import.meta.env.VITE_API_URL || "";
const baseURL = rawUrl.replace(/\/auth\/login\/?$/, "") || rawUrl;

const instance = axios.create({
  baseURL
});

// Request interceptor - Add token to headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired - clear storage and redirect to home
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      
      // Only redirect if we're not already on the home/login page
      if (window.location.pathname !== "/" && window.location.pathname !== "/login") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
