import api from "./index";


export const fetchCareer = (params = {}) => {
  return api.get("/admin/careers", { params });
};


export const getCareerById = (id) => {
  return api.get(`/admin/careers/${id}`);
};

export const createCareer = (formData) => {
  return api.post("/admin/careers", formData);
};


export const updateCareer = (id, formData) => {
  if (formData instanceof FormData) {
    const fd = new FormData();
    for (const [key, value] of formData.entries()) {
      fd.append(key, value);
    }
    fd.append("_method", "PUT");
    return api.post(`/admin/careers/${id}`, fd);
  }
  return api.put(`/admin/careers/${id}`, formData);
};

export const deleteCareer = (id) => {
  return api.delete(`/admin/careers/${id}`);
};



export const restoreCareer = (id) => {
  return api.post(`/admin/careers/${id}/restore`);
};


export const forceDeleteCareer = (id) => {
  return api.delete(`/admin/careers/${id}/force`);
};