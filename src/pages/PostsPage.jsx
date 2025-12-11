// src/pages/PostsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Image, ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPosts, deletePost } from "../api/posts";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function PostsPage() {
  const navigate = useNavigate();

  const [postsRaw, setPostsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, post: null });
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const resolveImageSrc = (p) => {
    if (p.feature_image_url) return p.feature_image_url;
    if (p.feature_image) {
      const path = p.feature_image.trim();
      if (path.startsWith("http")) return path;
      if (path) return `/storage/${path.replace(/^\/+/, "")}`;
    }
    return null;
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPosts({ per_page: 100 });
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data || [];
      setPostsRaw(list);
    } catch (err) {
      console.error("Failed to load posts:", err);
      setError(err?.response?.data?.message || "Failed to load posts");
      setPostsRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return postsRaw;
    const q = query.trim().toLowerCase();
    return postsRaw.filter((p) => {
      const title = (p.title || "").toLowerCase();
      const desc = (p.short_description || "").toLowerCase();
      const content = (p.content || "").toLowerCase();
      const cats = (p.categories || [])
        .map((c) => c.name || "")
        .join(" ")
        .toLowerCase();
      return (
        title.includes(q) ||
        desc.includes(q) ||
        content.includes(q) ||
        cats.includes(q)
      );
    });
  }, [postsRaw, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleAdd = () => navigate("/posts/create");
  const handleEdit = (post) => navigate(`/posts/${post.id}/edit`);
  const openDeleteModal = (post) => setDeleteModal({ open: true, post });
  const closeDeleteModal = () => setDeleteModal({ open: false, post: null });

  const handleDelete = async () => {
    if (!deleteModal.post) return;
    setDeleting(true);
    try {
      await deletePost(deleteModal.post.id);
      await load();
      closeDeleteModal();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Posts
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create and manage blog posts, news, events, and more.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search posts by title, content, or category..."
              className="w-80 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            />
          </div>

          <button
            onClick={handleAdd}
            className="relative group px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition duration-300 flex items-center gap-2 overflow-hidden"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-emerald-500" />
              <span>Loading posts...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-300">
            <p className="font-medium">Failed to load posts</p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Post
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="mx-auto w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <ImageOff className="w-10 h-10 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium">
                            No posts found
                          </h3>
                          <p className="mt-2 text-sm">
                            Create your first post or adjust your search.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((p, idx) => (
                      <tr
                        key={p.id}
                        className={`transition-all hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                          idx % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-10 dark:bg-gray-800/50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-4">
                            <div className="w-20 h-14 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              {(() => {
                                const src = resolveImageSrc(p);
                                return src ? (
                                  <img
                                    src={src}
                                    alt={p.title}
                                    className="object-cover w-full h-full"
                                    onError={(e) =>
                                      (e.currentTarget.style.display = "none")
                                    }
                                  />
                                ) : (
                                  <Image className="w-6 h-6 text-gray-400" />
                                );
                              })()}
                            </div>

                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {p.title}
                                {p.deleted_at && (
                                  <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                                    (Trashed)
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {p.short_description
                                  ? p.short_description.slice(0, 100) +
                                    (p.short_description.length > 100
                                      ? "…"
                                      : "")
                                  : "No description"}
                              </div>

                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {p.is_featured && (
                                  <span className="inline-block mr-2 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-800/30 dark:text-emerald-300">
                                    Featured
                                  </span>
                                )}
                                {p.published_at ? (
                                  <span>
                                    Published {formatDate(p.published_at)}
                                  </span>
                                ) : (
                                  <span className="text-yellow-600 dark:text-yellow-400">
                                    Draft
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {(p.categories || []).length > 0 ? (
                              p.categories.map((c) => (
                                <div
                                  key={c.id}
                                  className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300"
                                >
                                  {c.name}
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-gray-500">
                                Uncategorized
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {p.published_at ? formatDate(p.published_at) : "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {p.views ?? 0}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => openDeleteModal(p)}
                              className="p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold">
                  {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of <span className="font-semibold">{filtered.length}</span>{" "}
                posts
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-60 transition"
                >
                  Prev
                </button>

                <div className="text-sm text-gray-700 dark:text-gray-300 px-3">
                  Page {page} / {totalPages}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-60 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteModal.post?.title || "Post"}"?`}
        message="This will soft-delete the post. You can restore it later."
      />
    </div>
  );
}
