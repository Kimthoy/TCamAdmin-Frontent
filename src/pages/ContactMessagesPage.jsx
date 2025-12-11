// src/pages/ContactMessagesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Phone,
  Clock,
  CheckCircle,
  Trash2,
  Search,
  Filter,
  CheckSquare,
  Square,
} from "lucide-react";
import { format } from "date-fns";
import {
  fetchContactMessages,
  markMessageHandled,
  bulkMarkHandled,
  deleteContactMessage,
} from "../api/contactMessages";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [query, setQuery] = useState("");
  const [unhandledOnly, setUnhandledOnly] = useState(false);
  const [page, setPage] = useState(1);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: "",
  });

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await fetchContactMessages({
        q: query || undefined,
        unhandled_only: unhandledOnly || undefined,
        page,
        per_page: 20,
      });

      const data = res.data;
      setMessages(data.data || []);
      setPagination({
        current: data.current_page,
        last: data.last_page,
        total: data.total,
        from: data.from,
        to: data.to,
      });
      setSelectedIds([]); // reset selection
      setSelectAll(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load messages");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [page, query, unhandledOnly]);

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map((m) => m.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkMarkHandled = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkMarkHandled(selectedIds);
      setMessages((prev) =>
        prev.map((m) =>
          selectedIds.includes(m.id) ? { ...m, handled: true } : m
        )
      );
      setSelectedIds([]);
      setSelectAll(false);
    } catch (err) {
      alert("Failed to mark as handled");
    }
  };

  const handleMarkHandled = async (id) => {
    try {
      await markMessageHandled(id);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, handled: true } : m))
      );
    } catch (err) {
      alert("Failed");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteContactMessage(deleteModal.id);
      loadMessages();
    } catch (err) {
      alert("Delete failed");
    }
    setDeleteModal({ open: false, id: null, name: "" });
  };

  const hasUnhandled = messages.some((m) => !m.handled);
  const selectedCount = selectedIds.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 ">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Contact Messages
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {unhandledOnly
              ? `Showing only unhandled messages`
              : `All messages from contact form`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, message..."
              className="pl-10 pr-4 py-2.5 w-80 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Filter */}
          <button
            onClick={() => setUnhandledOnly(!unhandledOnly)}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition ${
              unhandledOnly
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700"
            }`}
          >
            <Filter className="w-4 h-4" />
            Unhandled Only
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-medium">{selectedCount} selected</span>
            <button
              onClick={handleBulkMarkHandled}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Handled
            </button>
          </div>
          <button
            onClick={() => {
              setSelectedIds([]);
              setSelectAll(false);
            }}
            className="text-gray-600 hover:text-gray-900"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Messages List */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-emerald-500 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : messages.length === 0 ? (
          <div className="p-20 text-center text-gray-500">
            <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium">No messages found</h3>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-6 hover:bg-gray-100 hover:cursor-pointer dark:hover:bg-gray-700/30 transition-all ${
                    !msg.handled ? "bg-orange-50/70 dark:bg-orange-900/20" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(msg.id)}
                      className="mt-1"
                    >
                      {selectedIds.includes(msg.id) ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <h3 className="font-semibold text-lg dark:text-slate-200">
                          {msg.name || "Anonymous"}
                        </h3>
                        {msg.email && (
                          <a
                            href={`mailto:${msg.email}`}
                            className="text-emerald-600 hover:underline mx-3"
                          >
                            {msg.email}
                          </a>
                        )}
                        {msg.phone && (
                          <span className="flex items-center gap-1 text-gray-600">
                            <Phone className="w-4 h-4" /> {msg.phone}
                          </span>
                        )}
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">
                          {format(
                            new Date(msg.created_at),
                            "dd MMM yyyy, HH:mm"
                          )}
                        </span>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {msg.ip_address && <span>IP: {msg.ip_address}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!msg.handled ? (
                        <button
                          onClick={() => handleMarkHandled(msg.id)}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark Handled
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                          Handled
                        </span>
                      )}

                      <button
                        onClick={() =>
                          setDeleteModal({
                            open: true,
                            id: msg.id,
                            name: msg.name || "this message",
                          })
                        }
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.last > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-sm">
                <div className="text-gray-600">
                  Showing {pagination.from}–{pagination.to} of{" "}
                  {pagination.total}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2">
                    Page {pagination.current} / {pagination.last}
                  </span>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(pagination.last, p + 1))
                    }
                    disabled={page === pagination.last}
                    className="px-4 py-2 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, name: "" })}
        onConfirm={handleDelete}
        title={`Delete message from "${deleteModal.name}"?`}
        message="This action cannot be undone."
      />
    </div>
  );
}
