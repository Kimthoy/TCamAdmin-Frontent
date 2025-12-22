// src/pages/ProductsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, ImageOff } from "lucide-react";
import { fetchProducts, deleteProduct, fetchCategories } from "../api/products";
import ProductForm from "../modals/ProductForm";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

function fmtPrice(v) {
  if (v == null || v === "") return "—";
  // ensure numeric formatting even when price is string
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  return n.toLocaleString(undefined, { minimumFractionDigits: 2 });
}

export default function Product() {
  const [items, setItems] = useState([]); // products array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // categories (for filters and form)
  const [categories, setCategories] = useState([]);

  // modal / edit
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // delete
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(false);

  // search / pagination (client-side fallback)
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  // server pagination metadata (optional)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(null);

  const normalizeProductsResponse = (res) => {
    // Accept:
    // - paginated: { current_page, data: [...] , last_page, total }
    // - plain list: [ ... ] or { data: [...] } (non-paginated)
    const payload = res?.data;
    if (!payload) return { items: [], meta: null };

    if (Array.isArray(payload)) {
      return { items: payload, meta: null };
    }

    // payload is object
    if (Array.isArray(payload.data)) {
      // paginated if it has current_page
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

      // plain wrapper { data: [...] }
      return { items: payload.data, meta: null };
    }

    // fallback
    return { items: [], meta: null };
  };

  const load = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetchProducts(params),
        fetchCategories(),
      ]);
      const normalized = normalizeProductsResponse(prodRes);
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

      const cats = Array.isArray(catRes.data?.data)
        ? catRes.data.data
        : catRes.data?.data ?? catRes.data ?? [];
      setCategories(cats);
      setItems(normalized.items ?? []);
    } catch (err) {
      console.error("Failed to load products or categories:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // client-side search/filter (works whether server pagination used or not)
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.short_description || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  // If server-side pagination is used prefer meta values; otherwise use client paging
  const effectiveTotal = totalItems != null ? totalItems : filtered.length;
  const effectiveTotalPages =
    totalPages !== 1
      ? totalPages
      : Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > effectiveTotalPages) setPage(effectiveTotalPages);
  }, [effectiveTotalPages, page]);

  const pageItems = useMemo(() => {
    // if server returns paginated data already (and you will call load({ page }) in the future),
    // then items are considered the page data. For now we do client paging:
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleEdit = (product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const openDelete = (item) => setDeleteModal({ open: true, item });
  const closeDelete = () => setDeleteModal({ open: false, item: null });

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteModal.item.id);
      await load();
      closeDelete();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const onSaved = async () => {
    await load();
    setFormOpen(false);
    setEditing(null);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      {/* header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="mt-1 sm:mt-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Manage products — create, edit, publish, or remove items.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title, description..."
            className="w-full sm:w-72 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/40"
          />

          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="group px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> New Product
          </button>
        </div>
      </div>

      {/* content card */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-emerald-500"></div>
              <span className="text-gray-500 dark:text-gray-400">
                Loading products...
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
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[600px] table-auto border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50">
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Website Link
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <ImageOff className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium">No products</h3>
                          <p className="mt-2 text-sm">
                            Create your first product to display here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((p, i) => (
                      <tr
                        key={p.id}
                        className={`${
                          i % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-50 dark:bg-gray-800/50"
                        } hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-all`}
                      >
                        <td className="px-4 sm:px-6 py-3">
                          <div className="w-20 sm:w-28 h-16 sm:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            {p.feature_image_url ? (
                              <img
                                src={p.feature_image_url}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageOff className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400" />
                            )}
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 max-w-[200px] sm:max-w-lg">
                          <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {p.title}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {p.short_description || "—"}
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 max-w-[180px] sm:max-w-32 truncate">
                          {p.website_link ? (
                            <a
                              href={p.website_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {p.website_link}
                            </a>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">
                              N/A
                            </span>
                          )}
                        </td>

                        <td className="px-4 sm:px-6 py-3">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                              p.is_published
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {p.is_published ? "Published" : "Draft"}
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 sm:gap-3">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-2 sm:p-3 rounded-xl hover:cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            >
                              <Edit className="w-4 sm:w-5 h-4 sm:h-5" />
                            </button>
                            <button
                              onClick={() => openDelete(p)}
                              className="p-2 sm:p-3 rounded-xl hover:cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                            >
                              <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
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
            <div className="px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 dark:text-slate-200 text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold">
                  {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of <span className="font-semibold">{effectiveTotal}</span>{" "}
                products
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 sm:px-3 sm:py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:cursor-pointer disabled:opacity-60"
                >
                  Prev
                </button>
                <div className="px-3 text-gray-700 dark:text-gray-300">
                  Page {page} / {effectiveTotalPages}
                </div>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(effectiveTotalPages, p + 1))
                  }
                  disabled={page >= effectiveTotalPages}
                  className="px-3 py-1 sm:px-3 sm:py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-slate-700 hover:cursor-pointer disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ProductForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={onSaved}
        initial={editing}
        categories={categories}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={closeDelete}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteModal.item?.title || "Product"}"?`}
        message="This product will be permanently removed."
      />
    </div>
  );
}
