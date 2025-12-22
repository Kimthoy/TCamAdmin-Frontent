
import api from "./index";

/**
 * Fetch all "Why Join Us" sections with optional query params
 */
export const fetchWhyJoinUsSections = (params = {}) => {
  return api.get("/admin/whyjoinus", { params });
};

/**
 * Get a single "Why Join Us" section by ID
 */
export const getWhyJoinUsById = (id) => {
  return api.get(`/admin/whyjoinus/${id}`);
};

/**
 * Create a new "Why Join Us" section
 * @param {Object|FormData} formData
 */
export const createWhyJoinUs = (formData) => {
  return api.post("/admin/whyjoinus", formData);
};

/**
 * Update a "Why Join Us" section
 * Supports FormData (with _method = PUT) or plain object
 */
export const updateWhyJoinUs = (id, formData) => {
  if (formData instanceof FormData) {
    const fd = new FormData();
    for (const [key, value] of formData.entries()) {
      fd.append(key, value);
    }
    fd.append("_method", "PUT");
    return api.post(`/admin/whyjoinus/${id}`, fd);
  }
  return api.put(`/admin/whyjoinus/${id}`, formData);
};

/**
 * Delete a "Why Join Us" section
 */
export const deleteWhyJoinUs = (id) => {
  return api.delete(`/admin/whyjoinus/${id}`);
};
