// src/pages/BannersPage.jsx
import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Banners
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage homepage banners — add, edit, toggle and remove.
          </p>
        </div>

        {/* Add Button (styled with fixed ring) */}
        <div>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="
    relative px-6 h-14 rounded-xl
    bg-emerald-500 dark:bg-black
    shadow-xl shadow-emerald-500/40
    ring-4 ring-emerald-500/20
    flex items-center gap-3
    animate-pulse-slow
    transition-all 
    hover:ring-emerald-400/80 hover:shadow-emerald-400/70
  "
          >
            {/* Glow layer */}
            <span
              className="
      absolute inset-0 rounded-xl 
      ring-8 ring-emerald-400/40 blur-xl
      transition-all
      group-hover:ring-emerald-300/60
    "
            />

            {/* Icon (left) */}
            <Plus
              className="
      relative z-10 w-6 h-6
      text-white dark:text-emerald-400 
      transition-colors
    "
            />

            {/* Title (right) */}
            <span
              className="
      relative z-10 text-lg font-semibold
      text-white dark:text-emerald-400 
      tracking-wide
    "
            >
              New
            </span>
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {loading ? (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="mt-2">Loading banners...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="p-3">Preview</th>
                  <th className="p-3">Title & Subtitle</th>
                  <th className="p-3">Link</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {banners.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      <div className="text-lg">No banners yet</div>
                      <p className="mt-1">
                        Click "Add Banner" to create your first one.
                      </p>
                    </td>
                  </tr>
                )}

                {banners.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {/* Image preview */}
                    <td className="p-3 w-36">
                      <div className="h-16 w-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex items-center justify-center border">
                        {b.image_url ? (
                          <img
                            src={b.image_url}
                            alt={b.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "block";
                            }}
                          />
                        ) : null}
                        <span className="text-xs text-gray-400 hidden">
                          No image
                        </span>
                      </div>
                    </td>

                    {/* Title & subtitle */}
                    <td className="p-3 align-top max-w-[28rem]">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {b.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {b.subtitle || (
                          <span className="italic">No subtitle</span>
                        )}
                      </div>
                    </td>

                    {/* Link */}
                    <td className="p-3 align-top max-w-[18rem]">
                      {b.link ? (
                        <a
                          href={b.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-xs break-all hover:underline transition-colors"
                        >
                          {b.link}
                        </a>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400 text-xs italic">
                          -
                        </span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="p-3 align-top">
                      {b.status ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right align-top">
                      <div className="inline-flex items-center gap-1">
                        {/* Toggle status */}
                        <button
                          title={b.status ? "Disable banner" : "Enable banner"}
                          onClick={() => handleToggle(b.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
                          aria-label={
                            b.status ? "Disable banner" : "Enable banner"
                          }
                        >
                          {b.status ? (
                            <ToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </button>

                        {/* Edit */}
                        <button
                          title="Edit banner"
                          onClick={() => handleEdit(b)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30"
                          aria-label="Edit banner"
                        >
                          <Edit className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </button>

                        {/* Delete */}
                        <button
                          title="Delete banner"
                          onClick={() => handleDelete(b.id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
                          aria-label="Delete banner"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form modal */}
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
