// src/api/customers.js
import api from "./index";

/* ============================
   CUSTOMER CATEGORIES
=============================== */
export const fetchCustomerCategories = (params = {}) => {
  return api.get("/admin/customer-categories", { params });
};

export const createCustomerCategory = (data) => {
  return api.post("/admin/customer-categories", data);
};

export const updateCustomerCategory = (id, data) => {
  data.append("_method", "PUT");
  return api.post(`/admin/customer-categories/${id}`, data);
};

export const deleteCustomerCategory = (id) => {
  return api.delete(`/admin/customer-categories/${id}`);
};

/* ============================
          CUSTOMERS
=============================== */

export const fetchCustomers = (params = {}) => {
  return api.get("/admin/customers", { params });
};

export const getCustomer = (id) => {
  return api.get(`/admin/customers/${id}`);
};

export const createCustomer = (formData) => {
  return api.post("/admin/customers", formData);
};

export const updateCustomer = (id, formData) => {
  const fd = new FormData();
  for (const [k, v] of formData.entries()) fd.append(k, v);
  fd.append("_method", "PUT");
  return api.post(`/admin/customers/${id}`, fd);
};

export const deleteCustomer = (id) => {
  return api.delete(`/admin/customers/${id}`);
};

export const restoreCustomer = (id) => {
  return api.post(`/admin/customers/${id}/restore`);
};

export const forceDeleteCustomer = (id) => {
  return api.delete(`/admin/customers/${id}/force`);
};
