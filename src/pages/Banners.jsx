// src/pages/BannersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ImageOff,
  Globe,
} from "lucide-react";
import {
  fetchBanners,
  toggleBannerStatus,
  deleteBanner,
  createBanner,
  updateBanner,
} from "../api/banner";
import BannerForm from "../modals/BannerForm";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

const PAGE_OPTIONS = [
  { value: "home", label: "Home", color: "bg-emerald-100 text-emerald-700" },
  { value: "about", label: "About Us", color: "bg-blue-100 text-blue-700" },
  {
    value: "solutions",
    label: "Solutions",
    color: "bg-purple-100 text-purple-700",
  },
  {
    value: "services",
    label: "Service",
    color: "bg-orange-100 text-orange-700",
  },
  { value: "contact", label: "Contact", color: "bg-pink-100 text-pink-700" },
  {
    value: "customers",
    label: "Customer",
    color: "bg-ember-100 text-amber-700",
  },
  { value: "partners", label: "Partner", color: "bg-lime-100 text-lime-700" },
  { value: "jobs", label: "Job", color: "bg-cyan-100 text-cyan-700" },
  { value: "events", label: "Event", color: "bg-cyan-100 text-cyan-700" },
  { value: "blog", label: "Blog", color: "bg-indigo-100 text-indigo-700" },
];

export default function BannersPage() {
  const [bannersRaw, setBannersRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, banner: null });
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Search & pagination
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchBanners({ per_page: 100 });
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data || [];
      setBannersRaw(list);
    } catch (err) {
      setError("Failed to load banners");
      setBannersRaw([]);
      console.error("fetchBanners error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return bannersRaw;
    const q = query.toLowerCase().trim();
    return bannersRaw.filter(
      (b) =>
        b.title?.toLowerCase().includes(q) ||
        b.subtitle?.toLowerCase().includes(q) ||
        b.page?.toLowerCase().includes(q) ||
        b.link?.toLowerCase().includes(q)
    );
  }, [bannersRaw, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleSave = async (formData, isEdit, id) => {
    setSaving(true);
    try {
      if (isEdit) {
        await updateBanner(id, formData);
      } else {
        await createBanner(formData);
      }
      await load();
    } catch (err) {
      console.error("Save failed:", err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (banner) => {
    setEditing(banner);
    setFormOpen(true);
  };

  const openDeleteModal = (banner) => {
    setDeleteModal({ open: true, banner });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, banner: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.banner) return;
    setDeleting(true);
    try {
      await deleteBanner(deleteModal.banner.id);
      await load();
      closeDeleteModal();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleBannerStatus(id);
      await load();
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const getPageBadge = (pageValue) => {
    const option = PAGE_OPTIONS.find((opt) => opt.value === pageValue);
    if (!option) return <span className="text-gray-500 text-xs">Unknown</span>;
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${option.color}`}
      >
        <Globe className="w-3 h-3" />
        {option.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Banners
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage banners for different pages — Home, About, Services, etc.
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
              placeholder="Search by title, page, link..."
              className="w-64 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            />
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Banner
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center gap-3 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-emerald-500" />
              <span>Loading banners...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Title & Subtitle
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Page
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Link
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
                      <td colSpan="6" className="px-6 py-20 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="mx-auto w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <ImageOff className="w-10 h-10 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium">
                            No banners found
                          </h3>
                          <p className="mt-2 text-sm">
                            Create your first banner or adjust your search.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((b, idx) => (
                      <tr
                        key={b.id}
                        className={`transition-all hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                          idx % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-10 dark:bg-gray-800/50"
                        }`}
                      >
                        {/* Preview */}
                        <td className="px-6 py-4">
                          <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600">
                            {b.image_url ? (
                              <img
                                src={b.image_url}
                                alt={b.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "/images/placeholder.png";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageOff className="w-10 h-10 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Title & Subtitle */}
                        <td className="px-6 py-4">
                          <div className="max-w-md">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {b.title || (
                                <span className="text-gray-400 italic">
                                  No title
                                </span>
                              )}
                            </div>
                            {b.subtitle && (
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {b.subtitle}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Page Badge */}
                        <td className="px-6 py-4">
                          {getPageBadge(b.page || "home")}
                        </td>

                        {/* Link */}
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {b.link ? (
                            <a
                              href={b.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline break-all"
                            >
                              {b.link.length > 40
                                ? `${b.link.substring(0, 40)}...`
                                : b.link}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggle(b.id)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              b.is_active
                                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {b.is_active ? (
                              <ToggleRight className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 text-gray-500" />
                            )}
                            {b.is_active ? "Active" : "Disabled"}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEdit(b)}
                              className="p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(b)}
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
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                {filtered.length} banners
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 disabled:opacity-60 transition"
                >
                  Prev
                </button>
                <span className="px-3 text-gray-700 dark:text-gray-300">
                  Page {page} / {totalPages}
                </span>
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

      {/* Form Modal */}
      <BannerForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSave}
        initial={editing}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteModal.banner?.title || "Banner"}"?`}
        message="This banner will be permanently removed."
      />
    </div>
  );
}
