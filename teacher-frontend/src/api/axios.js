import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor – Add token to headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Do NOT warn for public auth routes
      if (
        !config.url.includes("/auth/login") &&
        !config.url.includes("/auth/signup")
      ) {
        console.warn(
          "No token found in localStorage for request:",
          config.url
        );
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor – Handle 401 errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");

      // Redirect only if not already on public pages
      if (
        window.location.pathname !== "/" &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/signup"
      ) {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
