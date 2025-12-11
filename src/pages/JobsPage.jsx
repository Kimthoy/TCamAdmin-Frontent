// src/pages/JobsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchJobs, deleteJob, restoreJob, forceDeleteJob } from "../api/jobs";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function JobsPage() {
  const navigate = useNavigate();

  const [jobsRaw, setJobsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, job: null });
  const [deleting, setDeleting] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchJobs({ per_page: 100 });
      const list = Array.isArray(res.data?.data)
        ? res.data.data
        : res.data || [];
      setJobsRaw(list);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load jobs");
      setJobsRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return jobsRaw;
    const q = query.toLowerCase().trim();
    return jobsRaw.filter(
      (job) =>
        job.title?.toLowerCase().includes(q) ||
        job.company?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        job.job_type?.toLowerCase().includes(q)
    );
  }, [jobsRaw, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleAdd = () => navigate("/jobs/create");
  const handleEdit = (job) => navigate(`/jobs/${job.id}/edit`);
  const openDeleteModal = (job) => setDeleteModal({ open: true, job });
  const closeDeleteModal = () => setDeleteModal({ open: false, job: null });

  const handleDelete = async () => {
    if (!deleteModal.job) return;
    setDeleting(true);
    try {
      await deleteJob(deleteModal.job.id);
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
            Job Openings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage career opportunities and job postings.
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
              placeholder="Search jobs by title, company, location..."
              className="w-80 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            />
          </div>

          <button
            onClick={handleAdd}
            className="relative group px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition duration-300 flex items-center gap-2 overflow-hidden"
          >
            <Plus className="w-4 h-4" />
            New Job
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-emerald-500" />
              <span>Loading jobs...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-300">
            <p className="font-medium">Failed to load jobs</p>
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
                      Job Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Deadline
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
                        <div className="text-gray-500 dark:text-gray-400">
                          <div className="mx-auto w-20 h-20 mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                            <Briefcase className="w-10 h-10 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-medium">No jobs found</h3>
                          <p className="mt-2 text-sm">
                            Create your first job posting or adjust your search.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((job, idx) => (
                      <tr
                        key={job.id}
                        className={`transition-all hover:bg-gray-50 dark:hover:bg-gray-700/40 ${
                          idx % 2 === 0
                            ? "bg-white dark:bg-gray-800"
                            : "bg-gray-10 dark:bg-gray-800/50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {job.title}
                            {job.deleted_at && (
                              <span className="ml-2 text-xs text-red-600 dark:text-red-400">
                                (Trashed)
                              </span>
                            )}
                          </div>
                          {job.is_closed && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-red-700 dark:text-red-300">
                              <XCircle className="w-3.5 h-3.5" /> Closed
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {job.company || "—"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            {job.location || "Remote"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-white">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            {job.salary || "Competitive"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            {job.job_type || "Full-time"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            {job.deadline
                              ? formatDate(job.deadline)
                              : "No deadline"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEdit(job)}
                              className="p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-all"
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>

                            <button
                              onClick={() => openDeleteModal(job)}
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
                of <span className="font-semibold">{filtered.length}</span> jobs
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

      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteModal.job?.title || "Job"}"?`}
        message="This will soft-delete the job posting. You can restore it later."
      />
    </div>
  );
}
