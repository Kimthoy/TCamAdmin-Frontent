import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ImageOff,
  Calendar,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
import { fetchEvents, deleteEvent } from "../api/event";
import EventForm from "../modals/EventForm";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

export default function EventPage() {
  const [eventsRaw, setEventsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, event: null });
  const [deleting, setDeleting] = useState(false);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  /* =======================
     LOAD EVENTS
  ======================= */
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchEvents({ per_page: 100 });
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data || [];
      setEventsRaw(list);
    } catch (err) {
      console.error(err);
      setError("Failed to load events");
      setEventsRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* =======================
     SEARCH
  ======================= */
  const filtered = useMemo(() => {
    if (!query.trim()) return eventsRaw;
    const q = query.toLowerCase();
    return eventsRaw.filter(
      (e) =>
        e.title?.toLowerCase().includes(q) ||
        e.subtitle?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q)
    );
  }, [eventsRaw, query]);

  /* =======================
     PAGINATION
  ======================= */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  /* =======================
     DELETE
  ======================= */
  const handleDelete = async () => {
    if (!deleteModal.event) return;
    setDeleting(true);
    try {
      await deleteEvent(deleteModal.event.id);
      await load();
      setDeleteModal({ open: false, event: null });
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };
  const getCertificateUrl = (cert) =>
    cert.file
      ? `${process.env.REACT_APP_API_BASE_URL || ""}/storage/${cert.file}`
      : null;

  return (
    <div className="space-y-8">
      {/* =======================
          HEADER
      ======================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Events
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage events displayed on your website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search events..."
            className="w-64 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500/40"
          />

          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* =======================
          TABLE CARD
      ======================= */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center gap-3 text-gray-500">
              <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-500 rounded-full" />
              Loading events...
            </div>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50 dark:bg-gray-900/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                      Poster
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                      Date & Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <ImageOff className="mx-auto w-10 h-10 text-gray-400" />
                        <p className="mt-2 text-gray-500">No events found</p>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((e) => (
                      <tr
                        key={e.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/40"
                      >
                        {/* Poster */}
                        <td className="px-6 py-4">
                          <div className="w-24 h-16 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                            {e.poster_image_url ? (
                              <img
                                src={e.poster_image_url}
                                alt={e.title}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <ImageOff className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </td>

                        {/* Title */}
                        <td className="px-6 py-4">
                          <div className="font-semibold">{e.title}</div>
                          {e.subtitle && (
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {e.subtitle}
                            </p>
                          )}
                        </td>

                        {/* Date & Location */}
                        <td className="px-6 py-4 space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {e.event_date
                              ? new Date(e.event_date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "—"}
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {e.location || "—"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              e.is_published
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {e.is_published ? (
                              <Eye className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                            {e.is_published ? "Published" : "Hidden"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => {
                                setEditing(e);
                                setFormOpen(true);
                              }}
                              className="p-3 rounded-xl hover:bg-blue-50 text-blue-600"
                            >
                              <Edit className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() =>
                                setDeleteModal({ open: true, event: e })
                              }
                              className="p-3 rounded-xl hover:bg-red-50 text-red-600"
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

            {/* =======================
                PAGINATION
            ======================= */}
            <div className="px-6 py-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <strong>
                  {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                </strong>{" "}
                to{" "}
                <strong>{Math.min(page * PAGE_SIZE, filtered.length)}</strong>{" "}
                of <strong>{filtered.length}</strong> events
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 rounded-md border"
                >
                  Prev
                </button>
                <span className="px-3 py-2 text-sm">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-2 rounded-md border"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* =======================
          MODALS
      ======================= */}
      <EventForm
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => {
          load();
          setFormOpen(false);
          setEditing(null);
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        loading={deleting}
        onClose={() => setDeleteModal({ open: false, event: null })}
        onConfirm={handleDelete}
        title={`Delete "${deleteModal.event?.title || "Event"}"?`}
        message="This event will be permanently removed."
      />
    </div>
  );
}
