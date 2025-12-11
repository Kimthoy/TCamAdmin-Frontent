// src/api/jobs.js
import api from "./index";

/* =========================================================
   JOBS API (Admin)
   ========================================================= */

// GET /admin/jobs
export const fetchJobs = (params = {}) => {
  return api.get("/admin/jobs", { params });
};

// GET /admin/jobs/:id
export const getJob = (id) => {
  return api.get(`/admin/jobs/${id}`);
};

// POST /admin/jobs
export const createJob = (formData) => {
  return api.post("/admin/jobs", formData);
};

// PUT /admin/jobs/:id  (via POST + _method=PUT)
export const updateJob = (id, formData) => {
  if (formData instanceof FormData) {
    // Laravel requires _method=PUT when using FormData
    const fd = new FormData();
    for (const [key, value] of formData.entries()) {
      fd.append(key, value);
    }
    fd.append("_method", "PUT");
    return api.post(`/admin/jobs/${id}`, fd);
  }
  // Fallback for JSON (if no files)
  return api.put(`/admin/jobs/${id}`, formData);
};

// DELETE /admin/jobs/:id  (soft delete)
export const deleteJob = (id) => {
  return api.delete(`/admin/jobs/${id}`);
};

// POST /admin/jobs/:id/restore
export const restoreJob = (id) => {
  return api.post(`/admin/jobs/${id}/restore`);
};

// DELETE /admin/jobs/:id/force  (permanent delete)
export const forceDeleteJob = (id) => {
  return api.delete(`/admin/jobs/${id}/force`);
};
