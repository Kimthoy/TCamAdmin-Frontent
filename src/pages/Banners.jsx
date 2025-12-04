// src/pages/BannersPage.jsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ImageOff,
} from "lucide-react";
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from "../api/banner";
import BannerForm from "../components/BannerForm";

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchBanners();
      setBanners(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaved = async (formData, isEdit) => {
    try {
      if (isEdit && editing) {
        formData.append("_method", "PUT");
        await updateBanner(editing.id, formData);
      } else {
        await createBanner(formData);
      }
      await load();
      setEditing(null);
      setFormOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (b) => {
    setEditing(b);
    setFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await deleteBanner(id);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleBannerStatus(id);
      await load();
    } catch (err) {
      console.error(err);
    }
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
            Manage your homepage banners — add, edit, enable/disable, or remove
            them.
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="relative group px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 flex items-center gap-2.5 overflow-hidden"
        >
          <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-full transition-transform duration-700" />
          <Plus className="w-5 h-5" />
          <span>New Banner</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-emerald-500"></div>
              <span>Loading banners...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Table Header - Modern bordered style */}
              <thead>
                <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/50">
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Title & Subtitle
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Link
                  </th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-5 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <div className="mx-auto w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                          <ImageOff className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium">No banners yet</h3>
                        <p className="mt-2 text-sm">
                          Get started by adding your first banner.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {banners.map((b, index) => (
                      <tr
                        key={b.id}
                        className={`transition-all hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                          index % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-10 dark:bg-gray-800/50"
                        }`}
                      >
                        {/* Preview */}
                        <td className="px-6 py-5">
                          <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                            {b.image_url ? (
                              <img
                                src={b.image_url}
                                alt={b.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextElementSibling.style.display =
                                    "flex";
                                }}
                              />
                            ) : null}
                            <div className="hidden flex-col items-center justify-center text-gray-400">
                              <ImageOff className="w-8 h-8 mb-1" />
                              <span className="text-xs">No image</span>
                            </div>
                          </div>
                        </td>

                        {/* Title & Subtitle */}
                        <td className="px-6 py-5">
                          <div className="max-w-md">
                            <div className="font-semibold text-gray-900 dark:text-white text-base">
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

                        {/* Link */}
                        <td className="px-6 py-5">
                          {b.link ? (
                            <a
                              href={b.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm font-medium break-all"
                            >
                              {b.link.length > 50
                                ? `${b.link.substring(0, 50)}...`
                                : b.link}
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              b.status
                                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                b.status ? "bg-emerald-500" : "bg-gray-400"
                              }`}
                            />
                            {b.status ? "Active" : "Disabled"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggle(b.id)}
                              className={`p-2.5 rounded-lg transition-all ${
                                b.status
                                  ? "hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                              }`}
                              title={b.status ? "Disable" : "Enable"}
                            >
                              {b.status ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleEdit(b)}
                              className="p-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => handleDelete(b.id)}
                              className="p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <BannerForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initial={editing}
      />
    </div>
  );
}
