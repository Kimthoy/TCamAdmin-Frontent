import api from "./index";

export const fetchSupport = async () => {
  const res = await api.get("/admin/support-system");
  return res.data; // { section, plans, options }
};

export const createSupport = (formData) =>
  api.post("/admin/support-system", formData);

export const deleteSupportPlan = (id) =>
  api.delete(`/admin/support-plan/${id}`);

export const deleteSupportOption = (id) =>
  api.delete(`/admin/support-option/${id}`);

export const deleteSupportFeature = (id) =>
  api.delete(`/admin/support-feature/${id}`);
