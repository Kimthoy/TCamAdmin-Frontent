import api from "./index";

// Fetch all sub-products
export const fetchSubProducts = (params = {}) =>
  api.get("/admin/sub-products", { params });

// Get single sub-product
export const getSubProduct = (id) => api.get(`/admin/sub-products/${id}`);

// Create sub-product
export const createSubProduct = (data) =>
  api.post(`/admin/sub-products`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Update sub-product
export const updateSubProduct = (id, data) => {
  data.append("_method", "PUT"); // 🔑 Laravel expects this with FormData
  return api.post(`/admin/sub-products/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Delete sub-product
export const deleteSubProduct = (id) => api.delete(`/admin/sub-products/${id}`);

export default {
  fetchSubProducts,
  getSubProduct,
  createSubProduct,
  updateSubProduct,
  deleteSubProduct,
};
