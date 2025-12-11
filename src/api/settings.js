// src/api/settings.js
import api from "./index";

/**
 * Fetch all settings
 * GET /admin/settings
 */
export const fetchSettings = () => api.get("/admin/settings");

/**
 * Update settings
 * Accepts:
 * - single: { key: "site.title", value: "My Site" }
 * - batch:  [{ key, value }, { key, value }]
 * PUT /admin/settings
 */
export const updateSetting = (payload) => {
  if (payload instanceof FormData) {
    return api.put("/admin/settings", payload); // file support
  }
  return api.put("/admin/settings", payload);
};

/**
 * Refresh cached settings
 * POST /admin/settings/refresh-cache
 */
export const refreshSettingsCache = () =>
  api.post("/admin/settings/refresh-cache");

/**
 * DELETE individual setting
 * DELETE /admin/settings/:key
 */
export const deleteSetting = (key) =>
  api.delete(`/admin/settings/${encodeURIComponent(key)}`);
