import axios from "axios";

// API base must be the root (e.g. https://xxx.onrender.com/api). Do NOT include /auth/login or paths.
const rawUrl = (import.meta.env.VITE_API_URL || "").trim();
const normalized = rawUrl.replace(/\/auth\/login\/?$/, "");
// If no env set (e.g. production build without VITE_API_URL), use same origin + /api
const baseURL =
  normalized || (typeof window !== "undefined" ? `${window.location.origin}/api` : "");

if (import.meta.env.DEV && !rawUrl) {
  console.warn("VITE_API_URL not set – using same origin. For production, set VITE_API_URL to your backend (e.g. https://your-backend.onrender.com/api)");
}

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
