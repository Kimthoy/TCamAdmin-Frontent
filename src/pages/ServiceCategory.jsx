// src/pages/ServiceCategoriesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { fetchServiceCategories, deleteServiceCategory } from "../api/services";
import ServiceCategoryForm from "../modals/ServiceCategoryForm";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

export default function ServiceCategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(false);

  // search + pagination
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(null);

  const normalizeResponse = (res) => {
    const payload = res?.data;
    if (!payload) return { items: [], meta: null };

    if (Array.isArray(payload)) {
      return { items: payload, meta: null };
    }

    if (Array.isArray(payload.data)) {
      if (payload.current_page != null) {
        return {
          items: payload.data,
          meta: {
            current_page: payload.current_page,
            last_page: payload.last_page ?? 1,
            total: payload.total ?? payload.data.length,
          },
        };
      }
      return { items: payload.data, meta: null };
    }

    return { items: [], meta: null };
  };

  const load = async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const currentParams = { ...params };
      if (query.trim()) currentParams.q = query.trim();

      const res = await fetchServiceCategories(currentParams);
      const normalized = normalizeResponse(res);

      setItems(normalized.items);

      if (normalized.meta) {
        setCurrentPage(normalized.meta.current_page || 1);
        setTotalPages(normalized.meta.last_page || 1);
        setTotalItems(normalized.meta.total ?? normalized.items.length);
      } else {
        setCurrentPage(1);
        setTotalPages(
          Math.max(1, Math.ceil((normalized.items?.length || 0) / PAGE_SIZE))
        );
        setTotalItems(normalized.items?.length ?? 0);
      }
    } catch (err) {
      console.error("Failed to load:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ page: 1 });
    setPage(1);
  }, [query]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((p) => (p.name || "").toLowerCase().includes(q));
  }, [items, query]);

  const effectiveTotal = totalItems != null ? totalItems : filtered.length;
  const effectiveTotalPages =
    totalPages !== 1
      ? totalPages
      : Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > effectiveTotalPages && effectiveTotalPages > 0) {
      setPage(effectiveTotalPages);
    }
  }, [effectiveTotalPages, page]);

  const pageItems = useMemo(() => {
    if (totalPages > 1) return filtered;
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, totalPages]);

  const handleEdit = (category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const openDelete = (item) => setDeleteModal({ open: true, item });
  const closeDelete = () => setDeleteModal({ open: false, item: null });

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    setDeleting(true);
    try {
      await deleteServiceCategory(deleteModal.item.id);
      await load({
        page:
          currentPage > 1 && pageItems.length === 1
            ? currentPage - 1
            : currentPage,
      });
      closeDelete();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(err?.response?.data?.message || "Failed to delete category.");
      closeDelete();
    } finally {
      setDeleting(false);
    }
  };

  const onSaved = async () => {
    await load({ page: 1 });
    setFormOpen(false);
    setEditing(null);
    setPage(1);
    setQuery("");
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    if (totalPages > 1) load({ page: newPage });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Tag className="w-8 h-8 text-emerald-600" /> Service Categories
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage the categories used to organize services.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full sm:w-72 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/40"
          />

          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="group flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Category
          </button>
        </div>
      </div>

      {/* content */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-emerald-500"></div>
              <span className="text-gray-500 dark:text-gray-400">
                Loading categories...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-300">
            <p className="font-medium">Error</p>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Category Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Updated At
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="mx-auto w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Tag className="w-10 h-10 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium">
                            No categories found
                          </h3>
                          <p className="mt-2 text-sm">
                            Create your first service category to get started.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((item, i) => (
                      <tr
                        key={item.id}
                        className={`${
                          i % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-50 dark:bg-gray-800/50"
                        } hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-all`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {item.name}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {formatDate(item.created_at)}
                        </td>

                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                          {formatDate(item.updated_at)}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => openDelete(item)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition"
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

            {/* pagination */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold">
                  {effectiveTotal === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(page * PAGE_SIZE, effectiveTotal)}
                </span>{" "}
                of <span className="font-semibold">{effectiveTotal}</span>{" "}
                entries
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, page - 1))}
                  disabled={page <= 1 || loading}
                  className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-60 transition"
                >
                  Prev
                </button>

                <div className="text-sm text-gray-700 dark:text-gray-300 px-3 font-medium">
                  Page {page} of {effectiveTotalPages}
                </div>

                <button
                  onClick={() =>
                    handlePageChange(Math.min(effectiveTotalPages, page + 1))
                  }
                  disabled={page >= effectiveTotalPages || loading}
                  className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-60 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ServiceCategoryForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={onSaved}
        initial={editing}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={closeDelete}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete category "${deleteModal.item?.name}"?`}
        message="Are you sure? Categories cannot be deleted if they are assigned to existing services."
      />
    </div>
  );
}
