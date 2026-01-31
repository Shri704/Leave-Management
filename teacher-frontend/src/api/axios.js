import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Request interceptor - Add token to headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("No token found in localStorage for request:", config.url);
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
      localStorage.removeItem("name");
      
      // Only redirect if we're not already on the home/login/signup page
      if (window.location.pathname !== "/" && window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
