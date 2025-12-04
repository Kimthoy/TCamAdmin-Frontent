// src/services/bannerService.js
import {
  fetchBanners,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from "../api/banner";

export async function listBanners(params = {}) {
  const res = await fetchBanners(params);
  return res.data.data ?? res.data;
}

export async function findBanner(id) {
  const res = await getBanner(id);
  return res.data.data ?? res.data;
}

export async function saveBanner(formData, id = null) {
  if (id) {
    return updateBanner(id, formData);
  }
  return createBanner(formData);
}

export async function removeBanner(id) {
  return deleteBanner(id);
}

export async function switchBannerStatus(id) {
  return toggleBannerStatus(id);
}
