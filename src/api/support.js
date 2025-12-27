import api from "./index";

export const fetchSupport = async () => {
  const res = await api.get("/admin/support-system");

  // return full object as-is
  return res.data; // { section, plans, options }
};

export const createSupport = (formData) =>
  api.post("/admin/support-system", formData);

export const updateSupport = (id, formData) => {
  if (formData instanceof FormData) {
    formData.append("_method", "PUT");
    return api.post(`/admin/support-system/${id}`, formData);
  }
  return api.put(`/admin/support-system/${id}`, formData);
};

export const deleteSupportPlan = (id) =>
  api.delete(`/admin/support-plan/${id}`);
export const deleteSupportOption = (id) =>
  api.delete(`/admin/support-option/${id}`);
export const deleteSupportFeature = (id) =>
  api.delete(`/admin/support-feature/${id}`);
