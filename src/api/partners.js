// src/api/partners.js
import api from "./index";

export const fetchPartners = (params = {}) =>
  api.get("/admin/partners", { params });

export const createPartner = (formData) =>
  api.post("/admin/partners", formData);

export const updatePartner = (id, formData) => {
  const fd = new FormData();
  for (const [k, v] of formData.entries()) fd.append(k, v);
  fd.append("_method", "PUT");
  return api.post(`/admin/partners/${id}`, fd);
};

export const deletePartner = (id) => api.delete(`/admin/partners/${id}`);
