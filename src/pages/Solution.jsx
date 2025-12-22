// src/pages/Solution.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, ImageOff, Layers } from "lucide-react";

import {
  fetchServices,
  deleteService,
  fetchServiceCategories,
} from "../api/services";

import ServiceForm from "../modals/ServiceForm";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

export default function Solution() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [deleting, setDeleting] = useState(false);

  const [query, setQuery] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [servRes, catRes] = await Promise.all([
        fetchServices(),
        fetchServiceCategories(),
      ]);

      setItems(servRes.data?.data ?? servRes.data ?? []);
      setCategories(catRes.data?.data ?? catRes.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (s) =>
        (s.title || "").toLowerCase().includes(q) ||
        (s.description || "").toLowerCase().includes(q)
    );
  }, [query, items]);

  const handleEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteModal.item) return;
    setDeleting(true);
    try {
      await deleteService(deleteModal.item.id);
      await load();
      setDeleteModal({ open: false, item: null });
    } finally {
      setDeleting(false);
    }
  };

  const onSaved = async () => {
    await load();
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-emerald-600" />
            Services
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage services, categories, images & published status.
          </p>
        </div>

        <div className="flex gap-3">
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
              className="group flex-shrink-0 hover:cursor-pointer px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Category
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {loading ? (
          <div className="p-16 flex justify-center">
            <span className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-emerald-600 rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-gray-500 dark:text-gray-400">
            <ImageOff className="w-14 h-14 mx-auto mb-3 text-gray-400 opacity-70" />
            <p className="text-lg">No services found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 text-left border-b border-gray-200 dark:border-gray-700 dark:text-slate-200">
                  <th className="px-6 py-4 text-sm font-semibold">Preview</th>
                  <th className="px-6 py-4 text-sm font-semibold">Title</th>
                  <th className="px-6 py-4 text-sm font-semibold">Category</th>
                  <th className="px-6 py-4 text-sm font-semibold">Published</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="w-28 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                        <img
                          src={s.image_url || s.feature_image_url} // use 'image_url' returned by API
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {s.title}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {s.category?.name ?? "—"}
                    </td>

                    <td className="px-6 py-4">
                      {s.is_published ? (
                        <span className="px-3 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                          Published
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          Draft
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(s)}
                          className="p-2 rounded-lg hover:cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-all"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() =>
                            setDeleteModal({ open: true, item: s })
                          }
                          className="p-2 rounded-lg hover:cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Modal Form */}
      <ServiceForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={onSaved}
        initial={editing}
        categories={categories}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteModal.item?.title || "Service"}"?`}
        message="This service will be permanently removed."
      />
    </div>
  );
}
