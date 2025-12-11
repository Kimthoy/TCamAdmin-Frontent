// src/api/posts.js
import api from "./index";

/* =========================================================
   POST CATEGORIES API
   ========================================================= */

// GET /admin/post-categories
export const fetchPostCategories = (params = {}) => {
  return api.get("/admin/post-categories", { params });
};

// GET /admin/post-categories/:id
export const getPostCategory = (id) => {
  return api.get(`/admin/post-categories/${id}`);
};

// POST /admin/post-categories
export const createPostCategory = (data) => {
  // data = FormData or JSON object
  return api.post("/admin/post-categories", data);
};

// POST /admin/post-categories/:id (Laravel requires FormData + _method)
export const updatePostCategory = (id, data) => {
  if (data instanceof FormData) {
    // ensure we don't modify the original FormData reference unexpectedly
    const fd = new FormData();
    for (const [k, v] of data.entries()) fd.append(k, v);
    fd.append("_method", "PUT");
    return api.post(`/admin/post-categories/${id}`, fd);
  }

  // If JSON is provided instead of FormData
  return api.put(`/admin/post-categories/${id}`, data);
};

// DELETE /admin/post-categories/:id
export const deletePostCategory = (id) => {
  return api.delete(`/admin/post-categories/${id}`);
};

/* =========================================================
   POSTS API
   ========================================================= */

export const fetchPosts = (params = {}) => {
  return api.get("/admin/posts", { params });
};

// GET /admin/posts/:id
export const getPost = (id) => {
  return api.get(`/admin/posts/${id}`);
};

export const createPost = (formData) => {
  return api.post("/admin/posts", formData);
};

export const updatePost = (id, formData) => {
  if (formData instanceof FormData) {
    // copy entries into a fresh FormData to avoid accidental mutation
    const data = new FormData();
    for (const [key, value] of formData.entries()) {
      data.append(key, value);
    }
    data.append("_method", "PUT");
    return api.post(`/admin/posts/${id}`, data);
  }

  // If JSON object passed in (no files)
  return api.put(`/admin/posts/${id}`, formData);
};

// DELETE (soft delete) /admin/posts/:id
export const deletePost = (id) => {
  return api.delete(`/admin/posts/${id}`);
};

// POST /admin/posts/:id/restore
export const restorePost = (id) => {
  return api.post(`/admin/posts/${id}/restore`);
};

// DELETE /admin/posts/:id/force
export const forceDeletePost = (id) => {
  return api.delete(`/admin/posts/${id}/force`);
};

/* =========================================================
   POST MEDIA
   ========================================================= */

// POST /admin/posts/:post/media
// formData should include media[] files and optionally captions[] (or any additional fields)
export const addPostMedia = (postId, formData) => {
  return api.post(`/admin/posts/${postId}/media`, formData);
};

// DELETE /admin/posts/:post/media/:media
export const removePostMedia = (postId, mediaId) => {
  return api.delete(`/admin/posts/${postId}/media/${mediaId}`);
};
