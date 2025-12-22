import api from "./index";

/**
 * Fetch all widgets
 */
export const fetchWidgets = (params = {}) => {
  return api.get("/admin/widgets", { params });
};

/**
 * Get a single widget by ID
 */
export const getWidgetById = (id) => {
  return api.get(`/admin/widgets/${id}`);
};

/**
 * Create a new widget
 * @param {Object|FormData} formData
 */
export const createWidget = (formData) => {
  return api.post("/admin/widgets", formData);
};

/**
 * Update a widget
 * Supports FormData (with _method = PUT) or plain object
 */
export const updateWidget = (id, formData) => {
  if (formData instanceof FormData) {
    const fd = new FormData();
    for (const [key, value] of formData.entries()) {
      fd.append(key, value);
    }
    fd.append("_method", "PUT");
    return api.post(`/admin/widgets/${id}`, fd);
  }
  return api.put(`/admin/widgets/${id}`, formData);
};

/**
 * Delete a widget
 */
export const deleteWidget = (id) => {
  return api.delete(`/admin/widgets/${id}`);
};
