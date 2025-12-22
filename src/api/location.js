import api from "./index";

// Fetch all locations
export const fetchLocation = (params = {}) => {
  return api.get("/admin/location-system", { params });
};

// Get a single location by ID
export const getLocationById = (id) => {
  return api.get(`/admin/location-system/${id}`);
};

// Create a new location
export const createLocation = (formData) => {
  return api.post("/admin/location-system", formData);
};

// Update an existing location
export const updateLocation = (id, formData) => {
  // If using FormData (for files), handle method override
  if (formData instanceof FormData) {
    const fd = new FormData();
    for (const [key, value] of formData.entries()) {
      fd.append(key, value);
    }
    fd.append("_method", "PUT"); // Laravel requires method override in POST
    return api.post(`/admin/location-system/${id}`, fd);
  }
  return api.put(`/admin/location-system/${id}`, formData);
};

// Delete a location
export const deleteLocation = (id) => {
  return api.delete(`/admin/location-system/${id}`);
};
