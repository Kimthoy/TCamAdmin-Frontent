import React, { useEffect, useState, useRef } from "react";
import {
  Eye,
  Trash2,
  Loader2,
  Search,
  FileText,
  X,
  User,
  ArrowDownNarrowWide,
} from "lucide-react";
import Swal from "sweetalert2";
import { fetchCareer } from "../../api/candidate";
import api from "../../api";

export default function Candidate() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [openStatusId, setOpenStatusId] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  const dropdownRef = useRef(null);

  const STATUS_OPTIONS = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      value: "reviewed",
      label: "Reviewed",
      color: "bg-blue-100 text-blue-700",
    },
    {
      value: "shortlisted",
      label: "Shortlisted",
      color: "bg-green-100 text-green-700",
    },
    { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
  ];

  /* =========================
     LOAD & NORMALIZE DATA
  ========================== */
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchCareer({ search });

      const normalized = (res.data?.data || []).map((c) => ({
        ...c,
        status: c.status ? c.status.toLowerCase() : "pending",
      }));

      setData(normalized);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     CLICK OUTSIDE DROPDOWN
  ========================== */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenStatusId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     SEARCH DEBOUNCE
  ========================== */
  useEffect(() => {
    const t = setTimeout(() => loadData(), 400);
    return () => clearTimeout(t);
  }, [search]);

  /* =========================
     DELETE
  ========================== */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Remove candidate?",
      text: "You won’t be able to recover this application.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    await api.delete(`/admin/job-applications/${id}`);
    loadData();
  };

  /* =========================
     UPDATE STATUS
  ========================== */
  const updateStatus = async (id, status) => {
    try {
      setUpdatingStatusId(id);

      await api.put(`/admin/job-applications/${id}/status`, { status });

      setData((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: `Status changed to ${status}`,
        showConfirmButton: false,
        timer: 2000,
      });

      setOpenStatusId(null);
    } catch {
      Swal.fire("Error", "Failed to update status", "error");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  /* =========================
     FILTER BY TAB (FIXED)
  ========================== */
  const filteredData = data.filter(
    (c) => (c.status || "pending") === activeTab
  );

  /* =========================
     RENDER
  ========================== */
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-semibold">Candidate Applications</h1>
        <p className="text-sm opacity-90 mt-1">
          Manage and review job applicants
        </p>

        {/* TABS */}
        <div className="mt-4 flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setActiveTab(s.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeTab === s.value
                  ? "bg-white text-gray-800"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {s.label} (
              {data.filter((c) => (c.status || "pending") === s.value).length})
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="mt-4 relative max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/70" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm text-white bg-white/10 placeholder-white/70 focus:ring focus:ring-white/40"
            placeholder="Search by name, email or position"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow border border-slate-300">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No applications found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-300 text-gray-500">
              <tr>
                <th className="px-6 py-4 text-left">Candidate</th>
                <th className="px-6 py-4">Position</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-300 hover:bg-blue-50/40 transition"
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                      {item.first_name?.[0]}
                      {item.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium">
                        {item.first_name} {item.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{item.email}</p>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                      {item.position_apply}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-gray-600">
                    {item.phone_number}
                  </td>

                  <td className="px-6 py-4 relative">
                    <button
                      onClick={() =>
                        setOpenStatusId(
                          openStatusId === item.id ? null : item.id
                        )
                      }
                      className={`px-3 py-1 rounded-full flex gap-2 items-center text-xs font-medium ${
                        STATUS_OPTIONS.find((s) => s.value === item.status)
                          ?.color
                      }`}
                    >
                      {updatingStatusId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        item.status
                      )}
                      <ArrowDownNarrowWide className="w-4 h-4" />
                    </button>

                    {openStatusId === item.id && (
                      <div
                        ref={dropdownRef}
                        className="absolute mt-2 left-0 z-20 rounded-lg shadow bg-white overflow-hidden"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => updateStatus(item.id, s.value)}
                            className={`block w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${s.color}`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-3">
                      {item.cv_file && (
                        <a
                          href={item.cv_file}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <FileText size={16} />
                        </a>
                      )}
                      <button
                        onClick={() => setSelected(item)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-400"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-semibold mb-4 flex gap-2 items-center">
              <User /> Candidate Profile
            </h2>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <p>
                <b>Name:</b> {selected.first_name} {selected.last_name}
              </p>
              <p>
                <b>Gender:</b> {selected.gender}
              </p>
              <p>
                <b>Email:</b> {selected.email}
              </p>
              <p>
                <b>Phone:</b> {selected.phone_number}
              </p>
              <p>
                <b>Position:</b> {selected.position_apply}
              </p>
              <p>
                <b>Source:</b> {selected.hear_about_job}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
