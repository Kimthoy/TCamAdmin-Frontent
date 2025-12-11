// src/pages/CustomersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit, Trash2, ExternalLink, ImageOff } from "lucide-react";
import {
  fetchCustomers,
  deleteCustomer,
  fetchCustomerCategories,
} from "../api/customers";
import CustomerForm from "../modals/CustomerForm";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

export default function CustomersPage() {
  const [customersRaw, setCustomersRaw] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    customer: null,
  });
  const [deleting, setDeleting] = useState(false);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [custRes, catRes] = await Promise.all([
        fetchCustomers({ per_page: 100 }),
        fetchCustomerCategories(),
      ]);

      const customers = Array.isArray(custRes.data?.data)
        ? custRes.data.data
        : custRes.data || [];
      const cats = Array.isArray(catRes.data?.data)
        ? catRes.data.data
        : catRes.data || [];

      setCustomersRaw(customers);
      setCategories(cats);
    } catch (err) {
      setError("Failed to load customers");
      setCustomersRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return customersRaw;
    const q = query.toLowerCase().trim();
    return customersRaw.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.short_description?.toLowerCase().includes(q) ||
        c.link?.toLowerCase().includes(q) ||
        c.category?.name?.toLowerCase().includes(q)
    );
  }, [customersRaw, query]);

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

  const openDeleteModal = (customer) => {
    setDeleteModal({ open: true, customer });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, customer: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.customer) return;
    setDeleting(true);
    try {
      await deleteCustomer(deleteModal.customer.id);
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
            Customers
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your client logos and testimonials.
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
              placeholder="Search customers..."
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
            New Customer
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-emerald-500" />
              <span>Loading customers...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-300">
            <p className="font-medium">Failed to load customers</p>
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Category
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
                            No customers found
                          </h3>
                          <p className="mt-2 text-sm">
                            Add your first client logo or adjust your search.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((c, idx) => (
                      <tr
                        key={c.id}
                        className={`transition-all hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                          idx % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-10 dark:bg-gray-800/50"
                        }`}
                      >
                        {/* Logo */}
                        <td className="px-6 py-4">
                          <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                            {c.logo_url ? (
                              <img
                                src={c.logo_url}
                                alt={c.name}
                                className="max-w-full max-h-full object-contain p-2"
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
                            {c.name}
                          </div>
                          {c.short_description && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              {c.short_description}
                            </p>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {c.category?.name || "—"}
                        </td>

                        {/* Link */}
                        <td className="px-6 py-4">
                          {c.link ? (
                            <a
                              href={c.link}
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

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              c.is_active
                                ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {c.is_active ? "Active" : "Hidden"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => {
                                setEditing(c);
                                setFormOpen(true);
                              }}
                              className="p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => openDeleteModal(c)}
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
                customers
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

      {/* Form Modal */}
      <CustomerForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={handleSaved}
        initial={editing}
        categories={categories}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteModal.customer?.name || "Customer"}"?`}
        message="This customer logo will be permanently removed from the site."
      />
    </div>
  );
}
