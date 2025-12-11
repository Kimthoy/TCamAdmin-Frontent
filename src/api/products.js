// src/api/products.js
import api from "./index";

/* =========================================================
   CATEGORIES API
   ========================================================= */

// GET /admin/categories
export const fetchCategories = (params = {}) => {
  return api.get("/admin/categories", { params });
};

// POST /admin/categories
export const createCategory = (data) => {
  // data = FormData or JSON object
  return api.post("/admin/categories", data);
};

// POST /admin/categories/:id  (Laravel requires FormData + _method)
export const updateCategory = (id, data) => {
  if (data instanceof FormData) {
    data.append("_method", "PUT");
    return api.post(`/admin/categories/${id}`, data);
  }

  // If JSON is provided instead of FormData
  return api.put(`/admin/categories/${id}`, data);
};

export const deleteCategory = (id) => {
  return api.delete(`/admin/categories/${id}`);
};

/* =========================================================
   PRODUCTS API
   ========================================================= */

export const fetchProducts = (params = {}) => {
  return api.get("/admin/products", { params });
};

export const getProduct = (id) => {
  return api.get(`/admin/products/${id}`);
};

// POST /admin/products
export const createProduct = (formData) => {
  return api.post("/admin/products", formData);
};

// POST /admin/products/:id (FormData MUST include _method=PUT)
export const updateProduct = (id, formData) => {
  const data = new FormData();
  for (const [key, value] of formData.entries()) {
    data.append(key, value);
  }
  data.append("_method", "PUT");

  return api.post(`/admin/products/${id}`, data);
};

// Delete (soft delete)
export const deleteProduct = (id) => {
  return api.delete(`/admin/products/${id}`);
};

// Restore soft-deleted product
export const restoreProduct = (id) => {
  return api.post(`/admin/products/${id}/restore`);
};

// Permanent delete
export const forceDeleteProduct = (id) => {
  return api.delete(`/admin/products/${id}/force`);
};

// Optional publish toggle
export const toggleProductPublish = (id) => {
  return api.patch(`/admin/products/${id}/toggle-publish`);
};
