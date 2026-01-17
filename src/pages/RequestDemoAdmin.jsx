import React, { useEffect, useState } from "react";
import { CopyPlus, Trash, PenBoxIcon } from "lucide-react";
import {
  fetchRequestDemos,
  updateRequestDemoStatus,
  deleteRequestDemo,
} from "../api/request_demos";
import Swal from "sweetalert2";

const statusOptions = [
  {
    value: "PENDING",
    label: "PENDING",
    className: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "APPROVED",
    label: "APPROVED",
    className: "bg-green-100 text-green-800",
  },
  {
    value: "REJECTED",
    label: "REJECTED",
    className: "bg-red-100 text-red-800",
  },
  {
    value: "CONTACTED",
    label: "CONTACTED",
    className: "bg-blue-100 text-blue-800",
  },
];

export default function RequestDemoAdmin() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all demo requests
  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetchRequestDemos();
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch demo requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Update status
  const handleStatusChange = async (id, status) => {
    try {
      await updateRequestDemoStatus(id, status);
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: `Status updated to ${status}`,
        timer: 1500,
        showConfirmButton: false,
      });
      loadRequests();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to update status",
      });
    }
  };

  // Delete request
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "This demo request will be permanently deleted!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteRequestDemo(id);
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          timer: 1500,
          showConfirmButton: false,
        });
        loadRequests();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err?.response?.data?.message || "Failed to delete request",
        });
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Demo Requests Mangement
      </h1>

      {loading ? (
        <p className="text-gray-500">Loading demo requests...</p>
      ) : requests.length === 0 ? (
        <p className="text-gray-500">No demo requests found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((req, idx) => {
            const statusObj = statusOptions.find((s) => s.value === req.status);
            return (
              <div
                key={req.id}
                className="bg-white shadow-lg rounded-xl p-5 border border-gray-200 flex flex-col justify-between hover:shadow-2xl transition"
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {req.name}
                  </h2>
                  <p className="text-sm text-gray-500">{req.email}</p>
                  {req.company && (
                    <p className="text-sm text-gray-600">
                      Company: {req.company}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {req.description || "No description provided"}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {/* Status dropdown */}
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req.id, e.target.value)}
                    className={`px-3 py-1 rounded-lg cursor-pointer font-semibold border focus:outline-none ${statusObj?.className}`}
                  >
                    {statusOptions.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(req.id)}
                    className="bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Trash />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
