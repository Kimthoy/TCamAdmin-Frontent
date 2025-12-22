import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchJobs, deleteJob } from "../api/jobs";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import Swal from "sweetalert2";

export default function Job() {
  const navigate = useNavigate();
  const [jobsRaw, setJobsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, job: null });
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchJobs({ per_page: 100 });
      setJobsRaw(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = () => navigate("/jobs/create");
  const handleEdit = (id) => navigate(`/jobs/${id}/edit`);

  const handleDelete = async () => {
    if (!deleteModal.job) return;

    const confirm = await Swal.fire({
      title: "Delete this job?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!confirm.isConfirmed) return;

    setDeleting(true);

    // 🔄 Loading popup
    Swal.fire({
      title: "Deleting job...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      await deleteJob(deleteModal.job.id);
      await load();

      Swal.close(); // close loading popup

      // ✅ Toast success
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Job deleted successfully",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });

      setDeleteModal({ open: false, job: null });
    } catch (err) {
      console.error(err);
      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text:
          err?.response?.data?.message ||
          "Failed to delete job. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8 text-gray-800 dark:text-gray-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Job Openings</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 transition-colors text-white font-semibold rounded-lg shadow-md"
        >
          <Plus className="w-5 h-5" /> New Job
        </button>
      </div>

      {/* Loading / Error / Empty State */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-600 font-medium">
          {error}
        </div>
      ) : jobsRaw.length === 0 ? (
        <div className="text-center py-10 text-gray-400">No jobs found</div>
      ) : (
        <div className="grid gap-6">
          {jobsRaw.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-900 shadow hover:shadow-lg transition-shadow"
            >
              {/* Job Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                <h2 className="font-semibold text-xl md:text-2xl">
                  {job.job_title}
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(job.id)}
                    className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-slate-800"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setDeleteModal({ open: true, job })}
                    className="text-red-600 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Job Tabs / Details */}
              <Tabs job={job} />
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, job: null })}
        onConfirm={handleDelete}
        loading={deleting}
        title={`Delete "${deleteModal.job?.job_title}"?`}
        message="This will permanently delete the job posting."
      />
    </div>
  );
}

/* =======================
   Tabs
======================= */
function Tabs({ job }) {
  const tabs = [
    "Info",
    "Responsibilities",
    "Benefits",
    "Certifications",
    "Attributes",
    "Qualification",
    "Application Info",
  ];

  const [active, setActive] = useState("Info");

  return (
    <div className="mt-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-300 dark:border-slate-700 mb-4">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200 ${
              active === t
                ? "border-b-4 border-emerald-500 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-slate-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {active === "Info" && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
              <div>
                <span className="font-semibold">Location:</span>{" "}
                {job.location || "—"}
              </div>
              <div>
                <span className="font-semibold">Hiring Number:</span>{" "}
                {job.hiring_number || "—"}
              </div>
              <div>
                <span className="font-semibold">Deadline:</span>{" "}
                {job.closing_date || "—"}
              </div>
            </div>
          </div>
        )}

        {active === "Responsibilities" && (
          <ul className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {job.responsibilities?.map((r) => (
              <li key={r.id}>{r.responsibility_text}</li>
            ))}
          </ul>
        )}

        {active === "Benefits" && (
          <ul className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {job.benefits?.map((b) => (
              <li key={b.id}>
                <span className="font-medium">{b.benefit_title}</span>
                {b.benefit_description && ` – ${b.benefit_description}`}
              </li>
            ))}
          </ul>
        )}

        {active === "Certifications" && (
          <ul className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {job.certifications?.map((c) => (
              <li key={c.id}>
                {c.certification_name} {c.is_required && " (Required)"}
              </li>
            ))}
          </ul>
        )}

        {active === "Attributes" && (
          <ul className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {job.attributes?.map((a) => (
              <li key={a.id}>{a.attribute_text}</li>
            ))}
          </ul>
        )}

        {active === "Qualification" && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-semibold">Education:</span>{" "}
              {job.qualification?.education_level || "—"}
            </div>
            <div>
              <span className="font-semibold">Experience:</span>{" "}
              {job.qualification?.experience_required || "—"}
            </div>
          </div>
        )}

        {active === "Application Info" && (
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-semibold">Email:</span>{" "}
              {job.application_info?.email || "—"}
            </div>
            <div>
              <span className="font-semibold">Phone:</span>{" "}
              {job.application_info?.phone_number || "—"}
            </div>
            <div>
              <span className="font-semibold">Telegram:</span>{" "}
              {job.application_info?.telegram_link || "—"}
            </div>
            <div className="col-span-1 md:col-span-2">
              <span className="font-semibold">Note:</span>{" "}
              {job.application_info?.note || "—"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
