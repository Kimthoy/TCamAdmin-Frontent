// src/api/support.js
import api from "./index";

// Fetch all support tickets
export const fetchSupport = async () => {
  const res = await api.get("/admin/support-system");
  return res.data;
};

// Create or update support system
export const createSupport = (formData) =>
  api.post("/admin/support-system", formData);

export const updateSupport = (id, formData) => {
  if (formData instanceof FormData) {
    const fd = new FormData();
    for (const [key, value] of formData.entries()) fd.append(key, value);
    fd.append("_method", "PUT");
    return api.post(`/admin/support-system/${id}`, fd);
  }
  return api.put(`/admin/support-system/${id}`, formData);
};

// Delete everything (original)
export const deleteSupport = (id) => api.delete(`/admin/support-system/${id}`);

// --------------------- New: individual deletes ---------------------
export const deleteSupportPlan = (id) =>
  api.delete(`/admin/support-plan/${id}`);
export const deleteSupportOption = (id) =>
  api.delete(`/admin/support-option/${id}`);
export const deleteSupportFeature = (id) =>
  api.delete(`/admin/support-feature/${id}`);
  