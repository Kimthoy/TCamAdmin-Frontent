// src/api/about.js
import api from "./index";

/**
 * Public APIs
 */
export const fetchAboutUsList = async () => {
  try {
    const res = await api.get("/about_us/public");
    const items = res?.data?.data || [];

    // operational_offices is already an array from backend
    return items.map((item) => ({
      ...item,
      operational_offices: item.operational_offices || [],
    }));
  } catch (err) {
    console.error(
      "fetchAboutUsList error:",
      err?.response?.statusText || err.message || err
    );
    return [];
  }
};

export const fetchSingleAboutUs = async (id) => {
  try {
    let res;
    if (id) {
      res = await api.get(`/about_us/${id}`);
      const item = res?.data?.data;
      return item
        ? { ...item, operational_offices: item.operational_offices || [] }
        : null;
    } else {
      // fallback: first About Us
      const list = await fetchAboutUsList();
      return list.length > 0 ? list[0] : null;
    }
  } catch (err) {
    console.error(
      "fetchSingleAboutUs error:",
      err?.response?.statusText || err.message || err
    );
    return null;
  }
};

/**
 * Admin APIs (require auth)
 */
export const createAboutUs = async (data) => {
  try {
    const res = await api.post("/admin/about_us", data);
    const item = res?.data?.data;
    return item
      ? { ...item, operational_offices: item.operational_offices || [] }
      : null;
  } catch (err) {
    console.error(
      "createAboutUs error:",
      err?.response?.statusText || err.message || err
    );
    throw err;
  }
};

export const updateAboutUs = async (id, data) => {
  try {
    data.append("_method", "PUT"); // Laravel will treat as PUT
    const res = await api.post(`/admin/about_us/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const item = res?.data?.data;
    return item
      ? { ...item, operational_offices: item.operational_offices || [] }
      : null;
  } catch (err) {
    console.error(
      "updateAboutUs error:",
      err?.response?.statusText || err.message || err
    );
    throw err;
  }
};

export const deleteAboutUs = async (id) => {
  try {
    const res = await api.delete(`/admin/about_us/${id}`);
    return res?.data;
  } catch (err) {
    console.error(
      "deleteAboutUs error:",
      err?.response?.statusText || err.message || err
    );
    throw err;
  }
};

export default {
  fetchAboutUsList,
  fetchSingleAboutUs,
  createAboutUs,
  updateAboutUs,
  deleteAboutUs,
};
