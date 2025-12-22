import api from "./index";

/**
 * Fetch all jobs with optional query params (pagination, filters, etc.)
 */
export const fetchJobs = (params = {}) => {
  return api.get("/admin/jobs", { params });
};

/**
 * Get a single job by ID
 */
export const getJobById = (id) => {
  return api.get(`/admin/jobs/${id}`);
};

/**
 * Create a new job
 * @param {Object|FormData} formData
 */
export const createJob = (formData) => {
  return api.post("/admin/jobs", formData);
};

/**
 * Update a job
 * Supports FormData (with _method = PUT) or plain object
 */
export const updateJob = (id, formData) => {
  if (formData instanceof FormData) {
    const fd = new FormData();
    for (const [key, value] of formData.entries()) {
      fd.append(key, value);
    }
    fd.append("_method", "PUT");
    return api.post(`/admin/jobs/${id}`, fd);
  }
  return api.put(`/admin/jobs/${id}`, formData);
};

/**
 * Delete a job (soft delete)
 */
export const deleteJob = (id) => {
  return api.delete(`/admin/jobs/${id}`);
};

/**
 * Restore a soft-deleted job
 */
export const restoreJob = (id) => {
  return api.post(`/admin/jobs/${id}/restore`);
};

/**
 * Permanently delete a job (force delete)
 */
export const forceDeleteJob = (id) => {
  return api.delete(`/admin/jobs/${id}/force`);
};
