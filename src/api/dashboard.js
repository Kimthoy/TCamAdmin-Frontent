// src/api/dashboard.js
import api from "./index";

export const getDashboardStats = () => api.get("/admin/dashboard/stats");
export const getActivity = () => api.get("/admin/dashboard/activity");
export const getRecentMessages = () => api.get("/admin/messages?limit=10");
