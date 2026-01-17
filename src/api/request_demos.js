
import api from "./index";


export const fetchRequestDemos = (params = {}) => {
  return api.get("/admin/request-demos", { params });
};

export const getRequestDemo = (id) => {
  return api.get(`/admin/request-demos/${id}`);
};

export const updateRequestDemoStatus = (id, status) => {
  return api.post(`/admin/request-demos/${id}/status`, { status });
};


export const deleteRequestDemo = (id) => {
  return api.delete(`/admin/request-demos/${id}`);
};

export default {
  fetchRequestDemos,
  getRequestDemo,
  updateRequestDemoStatus,
  deleteRequestDemo,
};
