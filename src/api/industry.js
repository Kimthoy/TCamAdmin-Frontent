import api from "./index";

/**
 * Fetch all industries with optional query params (pagination, filters, etc.)
 */
export const fetchIndustries = (params = {}) => {
  return api.get("/admin/industries", { params });
};

/**
 * Get a single industry by ID
 */
export const getIndustryById = (id) => {
  return api.get(`/admin/industries/${id}`);
};

/**
 * Create a new industry
 * @param {Object|FormData} formData
 */
export const createIndustry = (formData) => {
  return api.post("/admin/industries", formData);
};

/**
 * Update an industry
 * Supports FormData (with _method = PUT) or plain object
 */
export const updateIndustry = (id, formData) => {
  if (formData instanceof FormData) {
    const fd = new FormData();
    for (const [key, value] of formData.entries()) {
      fd.append(key, value);
    }
    fd.append("_method", "PUT");
    return api.post(`/admin/industries/${id}`, fd);
  }
  return api.put(`/admin/industries/${id}`, formData);
};

/**
 * Delete an industry
 */
export const deleteIndustry = (id) => {
  return api.delete(`/admin/industries/${id}`);
};
