// src/pages/PartnersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  ImageOff,
  ArrowUpDown,
  FolderDot, 
} from "lucide-react";
import { fetchPartners, deletePartner } from "../api/partners";
import PartnerForm from "../modals/PartnerForm";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

export default function PartnersPage() {
  const [partnersRaw, setPartnersRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    partner: null,
  });
  const [deleting, setDeleting] = useState(false);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      // Note: If your API requires specific query params to include category, add them here.
      // Assuming category data is nested directly in the partner object for now.
      const res = await fetchPartners({ per_page: 100 });
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data || [];
      setPartnersRaw(list);
    } catch (err) {
      setError("Failed to load partners");
      setPartnersRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ⬇️ UPDATED: Include category name in search logic
  const filtered = useMemo(() => {
    if (!query.trim()) return partnersRaw;
    const q = query.toLowerCase().trim();
    return partnersRaw.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) // Search by Category Name
    );
  }, [partnersRaw, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleSaved = () => {
    load();
    setFormOpen(false);
    setEditing(null);
    setPage(1);
  };

  const openDeleteModal = (partner) => {
    setDeleteModal({ open: true, partner });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, partner: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.partner) return;
    setDeleting(true);
    try {
      await deletePartner(deleteModal.partner.id);
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
      {/* Header (remains the same) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Partners
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage partner logos displayed on your website.
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
              placeholder="Search partners..."
              className="w-64 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            />
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="relative group px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition duration-300 flex items-center gap-2 overflow-hidden"
          >
            <Plus className="w-4 h-4" />
            New Partner
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-emerald-500" />
              <span>Loading partners...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-300">
            <p className="font-medium">Failed to load partners</p>
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
                      Logo
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    {/* ⬇️ NEW COLUMN HEADER: Category */}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-20 text-center">
                        {" "}
                        {/* Updated colspan to 7 */}
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="mx-auto w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <ImageOff className="w-10 h-10 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium">
                            No partners found
                          </h3>
                          <p className="mt-2 text-sm">
                            Add your first partner or adjust your search.
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
                        {/* Logo */}
                        <td className="px-6 py-4">
                          <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                            {p.logo_url ? (
                              <img
                                src={p.logo_url}
                                alt={p.name}
                                className="max-w-full max-h-full object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <ImageOff className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                        </td>

                        {/* Name & Description */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {p.name}
                          </div>
                          {p.short_description && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {p.short_description}
                            </p>
                          )}
                        </td>

                        {/* ⬇️ NEW COLUMN CELL: Category */}
                        <td className="px-6 py-4">
                          {p.category?.name ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                              <FolderDot className="w-3 h-3" />
                              {p.category.name}
                            </div>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs">
                              Uncategorized
                            </span>
                          )}
                        </td>

                        {/* Link */}
                        <td className="px-6 py-4">
                          {p.link ? (
                            <a
                              href={p.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 text-sm"
                            >
                              Visit <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-gray-500 text-sm">—</span>
                          )}
                        </td>

                        {/* Order */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1 text-sm">
                            <ArrowUpDown className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {p.sort_order ?? 0}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              p.is_active
                                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {p.is_active ? "Active" : "Hidden"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => {
                                setEditing(p);
                                setFormOpen(true);
                              }}
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

            {/* Pagination (remains the same) */}
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
                partners
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

      {/* Modals (remain the same) */}
      <PartnerForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initial={editing}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteModal.partner?.name || "Partner"}"?`}
        message="This partner logo will be permanently removed from the site."
      />
    </div>
  );
}
