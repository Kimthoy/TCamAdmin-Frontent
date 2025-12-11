// src/api/contactMessages.js
import api from "./index";

/**
 * Fetch contact messages with filters & pagination
 * @param {Object} params - query params
 *   q: string (search)
 *   unhandled_only: boolean
 *   page: number
 *   per_page: number
 */
export const fetchContactMessages = (params = {}) =>
  api.get("/admin/contact-messages", { params });

/**
 * Get single contact message by ID
 */
export const fetchContactMessage = (id) =>
  api.get(`/admin/contact-messages/${id}`);

/**
 * Mark a single message as handled
 */
export const markMessageHandled = (id) =>
  api.post(`/admin/contact-messages/${id}/handled`); // matches your route

/**
 * Bulk mark multiple messages as handled
 * @param {number[]} ids - array of message IDs
 */
export const bulkMarkHandled = (ids = []) =>
  api.post("/admin/contact-messages/bulk-handled", { ids });

/**
 * Delete a contact message
 */
export const deleteContactMessage = (id) =>
  api.delete(`/admin/contact-messages/${id}`);
