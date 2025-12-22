import api from "./index";

export const fetchCareer = (params = {}) => {
  return api.get("/admin/job-applications", { params });
};
export const updateApplicationStatus = (id, status) => {
  return api.put(`/admin/job-applications/${id}/status`, { status });
};
