// src/api/banner.js
import api from "./index";

export const fetchBanners = (params = {}) =>
  api.get("/admin/banners", { params });
export const getBanner = (id) => api.get(`/admin/banners/${id}`);
export const createBanner = (formData) => api.post("/admin/banners", formData);

export const updateBanner = (id, formData) => {
  // assume formData is an instance of FormData
  if (!(formData instanceof FormData)) {
    throw new Error("updateBanner expects FormData");
  }
  formData.append("_method", "PUT");
  return api.post(`/admin/banners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteBanner = (id) => api.delete(`/admin/banners/${id}`);

export const toggleBannerStatus = (id) => {
  return api.patch(`/admin/banners/${id}/toggle-status`);
};
