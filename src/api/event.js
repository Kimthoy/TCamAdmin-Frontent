// src/api/event.js
import api from "./index";

// Fetch all events
export const fetchEvents = (params = {}) => {
  return api.get("/admin/events", { params });
};

// Get a single event by ID
export const getEventById = (id) => {
  return api.get(`/admin/events/${id}`);
};

// Create a new event
export const createEvent = (formData) => {
  return api.post("/admin/events", formData);
};

// Update an existing event
export const updateEvent = (id, formData) => {
  if (formData instanceof FormData) {
    const fd = new FormData();
    for (const [key, value] of formData.entries()) {
      fd.append(key, value);
    }
    fd.append("_method", "PUT"); // Laravel expects _method for POST override
    return api.post(`/admin/events/${id}`, fd);
  }
  return api.put(`/admin/events/${id}`, formData);
};

// Delete an event
export const deleteEvent = (id) => {
  return api.delete(`/admin/events/${id}`);
};
