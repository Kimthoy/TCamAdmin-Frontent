// src/api/banner.js
import api from "./index";

// Get all banners
export const fetchBanners = (params = {}) => {
  return api.get("/admin/banners", { params });
};

// Get single banner
export const getBanner = (id) => {
  return api.get(`/admin/banners/${id}`);
};

// Create banner (multipart)
export const createBanner = (formData) => {
  return api.post("/admin/banners", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Update banner (Laravel requires POST + _method=PUT)
export const updateBanner = (id, formData) => {
  formData.append("_method", "PUT");
  return api.post(`/admin/banners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Delete banner
export const deleteBanner = (id) => {
  return api.delete(`/admin/banners/${id}`);
};

// Toggle banner status (active/inactive)
export const toggleBannerStatus = (id) => {
  return api.post(`/admin/banners/${id}/toggle-status`);
};
