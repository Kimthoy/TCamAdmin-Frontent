import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ================================
// REQUEST → Attach JWT Token
// ================================
api.interceptors.request.use((config) => {
  // You can use ONE token or separate (admin/user)
  const token =
    localStorage.getItem("adminToken") || localStorage.getItem("userToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Auto-handle FormData (for file uploads)
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// ================================
// RESPONSE → Auto-Logout on 401
// ================================
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error.response?.status;

    // Token invalid or expired
    if (status === 401) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("userToken");
      localStorage.removeItem("adminAuthenticated");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("userData");

      // Redirect depending on user type
      if (window.location.pathname.startsWith("/admin")) {
        window.location.href = "/admin/login";
      } else {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
