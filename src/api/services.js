// src/api/services.js
import api from "./index";

/* ============================
   SERVICE CATEGORIES
=============================== */
export const fetchServiceCategories = (params = {}) => {
  return api.get("/admin/service-categories", { params });
};

export const createServiceCategory = (data) => {
  return api.post("/admin/service-categories", data);
};

export const updateServiceCategory = (id, data) => {
  data.append("_method", "PUT");
  return api.post(`/admin/service-categories/${id}`, data);
};

export const deleteServiceCategory = (id) => {
  return api.delete(`/admin/service-categories/${id}`);
};

/* ============================
          SERVICES
=============================== */

export const fetchServices = (params = {}) => {
  return api.get("/admin/services", { params });
};

export const getService = (id) => {
  return api.get(`/admin/services/${id}`);
};

export const createService = (formData) => {
  return api.post("/admin/services", formData);
};

export const updateService = (id, formData) => {
  const fd = new FormData();
  for (const [k, v] of formData.entries()) fd.append(k, v);
  fd.append("_method", "PUT");
  return api.post(`/admin/services/${id}`, fd);
};

export const deleteService = (id) => {
  return api.delete(`/admin/services/${id}`);
};

export const restoreService = (id) => {
  return api.post(`/admin/services/${id}/restore`);
};

export const forceDeleteService = (id) => {
  return api.delete(`/admin/services/${id}/force`);
};
