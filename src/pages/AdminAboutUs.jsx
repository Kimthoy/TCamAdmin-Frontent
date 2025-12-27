import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAboutUsList,
  createAboutUs,
  updateAboutUs,
  deleteAboutUs,
} from "../api/about";
import { SquarePen, Trash2, Plus } from "lucide-react";

export default function AdminAboutUs() {
  const [abouts, setAbouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    company_image: null,
    founding_year: "",
    founders_info: "",
    intro_text: "",
    operational_offices: [],
    services_description: "",
    company_profile: "",
    project_count: "",
    vision: "",
    mission: "",
    value_proposition: "",
  });
  const [preview, setPreview] = useState(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await fetchAboutUsList();
      setAbouts(data || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Input handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, company_image: file }));
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleOfficesChange = (e) => {
    const value = e.target.value.split(",").map((v) => v.trim());
    setFormData((prev) => ({ ...prev, operational_offices: value }));
  };

  // Modal
  const openModal = (entry = null) => {
    if (entry) {
      setEditing(entry);
      setFormData({
        ...entry,
        operational_offices: entry.operational_offices || [],
        company_image: null,
      });
      setPreview(entry.company_image || null);
    } else {
      setEditing(null);
      setFormData({
        title: "",
        company_image: null,
        founding_year: "",
        founders_info: "",
        intro_text: "",
        operational_offices: [],
        services_description: "",
        company_profile: "",
        project_count: "",
        vision: "",
        mission: "",
        value_proposition: "",
      });
      setPreview(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "operational_offices") {
          dataToSend.append(key, JSON.stringify(value));
        } else if (key === "company_image") {
          // Only append new file if selected
          if (value instanceof File) {
            dataToSend.append(key, value);
          }
          // Otherwise, do nothing to keep existing image
        } else {
          dataToSend.append(key, value ?? "");
        }
      });

      if (editing) {
        await updateAboutUs(editing.id, dataToSend);
        Swal.fire("Updated!", "About Us updated successfully.", "success");
      } else {
        await createAboutUs(dataToSend);
        Swal.fire("Created!", "About Us created successfully.", "success");
      }

      closeModal();
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire("Error!", err.message || "Something went wrong.", "error");
    }
  };

  // Delete
  const handleDelete = (entry) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete "${entry.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAboutUs(entry.id);
          Swal.fire("Deleted!", "Entry has been deleted.", "success");
          fetchData();
        } catch (err) {
          console.error(err);
          Swal.fire("Error!", err.message || "Something went wrong.", "error");
        }
      }
    });
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">About Us</h1>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          onClick={() => openModal()}
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p>Loading...</p>
      ) : abouts.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No entries found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded-xl shadow-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">
                  #
                </th>
                <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">
                  Founded
                </th>
                <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">
                  Projects
                </th>
                <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">
                  Offices
                </th>
                <th className="px-6 py-4 text-center text-lg font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <AnimatePresence>
              <tbody className="divide-y divide-gray-200">
                {abouts.map((about, index) => (
                  <motion.tr
                    key={about.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-5 text-lg text-gray-600">
                      {index + 1}
                    </td>
                    <td className="px-6 py-5 text-lg text-gray-800 flex items-center gap-4">
                      {about.company_image && (
                        <img
                          src={about.company_image}
                          alt={about.title}
                          className="w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-sm"
                        />
                      )}
                      <span className="font-medium">{about.title}</span>
                    </td>
                    <td className="px-6 py-5 text-lg text-gray-800">
                      {about.founding_year || "—"}
                    </td>
                    <td className="px-6 py-5 text-lg text-gray-800">
                      {about.project_count || 0}
                    </td>
                    <td className="px-6 py-5 text-lg text-gray-800">
                      {(about.operational_offices || []).join(", ")}
                    </td>
                    <td className="px-6 py-5 text-center flex justify-center gap-4">
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openModal(about)}
                        className="p-3 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 shadow-lg"
                        title="Edit"
                      >
                        <SquarePen size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2, rotate: -10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(about)}
                        className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 shadow-lg"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    </td>
                  </motion.tr>
                ))}

                {abouts.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-gray-400 text-lg"
                    >
                      No entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </AnimatePresence>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 overflow-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4">
              {editing ? "Edit About Us" : "Create About Us"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4 border border-slate-300 p-4 rounded-lg">
                <h3 className="col-span-2 text-lg font-semibold mb-2">
                  Basic Info
                </h3>

                <div className="flex flex-col">
                  <label
                    htmlFor="title"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="border border-slate-300 rounded p-2 w-full"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="founding_year"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Founding Year
                  </label>
                  <input
                    id="founding_year"
                    type="number"
                    name="founding_year"
                    value={formData.founding_year}
                    onChange={handleChange}
                    className="border border-slate-300 rounded p-2 w-full"
                  />
                </div>

                <div className="flex flex-col col-span-2">
                  <label
                    htmlFor="company_image"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Photo
                  </label>
                  <input
                    id="company_image"
                    type="file"
                    name="company_image"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border border-slate-300 rounded p-2 w-full"
                  />
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-32 h-20 object-cover rounded mt-2"
                    />
                  )}
                </div>

                <div className="flex flex-col col-span-2">
                  <label
                    htmlFor="founders_info"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Founder Info
                  </label>
                  <textarea
                    id="founders_info"
                    name="founders_info"
                    value={formData.founders_info}
                    onChange={handleChange}
                    className="border border-slate-300 rounded p-2 w-full h-32"
                  />
                </div>

                <div className="flex flex-col col-span-2">
                  <label
                    htmlFor="intro_text"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Introduction
                  </label>
                  <textarea
                    id="intro_text"
                    name="intro_text"
                    value={formData.intro_text}
                    onChange={handleChange}
                    className="border border-slate-300 rounded p-2 w-full h-32"
                  />
                </div>
              </div>

              {/* Operational Info */}
              <div className="grid md:grid-cols-2 gap-4 border border-slate-300 p-4 rounded-lg">
                <h3 className="col-span-2 text-lg font-semibold mb-2">
                  Operational Info
                </h3>

                <div className="flex flex-col col-span-2">
                  <label
                    htmlFor="operational_offices"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Operational Offices (comma separated)
                  </label>
                  <input
                    id="operational_offices"
                    type="text"
                    name="operational_offices"
                    value={formData.operational_offices.join(", ")}
                    onChange={handleOfficesChange}
                    className="border border-slate-300 rounded p-2 w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="project_count"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Project Count
                  </label>
                  <input
                    id="project_count"
                    type="number"
                    name="project_count"
                    value={formData.project_count}
                    onChange={handleChange}
                    className="border border-slate-300 rounded p-2 w-full"
                  />
                </div>

                <div className="flex flex-col col-span-2">
                  <label
                    htmlFor="services_description"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Services Description
                  </label>
                  <textarea
                    id="services_description"
                    name="services_description"
                    value={formData.services_description}
                    onChange={handleChange}
                    className="border border-slate-300 rounded p-2 w-full h-24"
                  />
                </div>

                <div className="flex flex-col col-span-2">
                  <label
                    htmlFor="company_profile"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Company Profile
                  </label>
                  <textarea
                    id="company_profile"
                    name="company_profile"
                    value={formData.company_profile}
                    onChange={handleChange}
                    className="border border-slate-300 rounded p-2 w-full h-24"
                  />
                </div>
              </div>

              {/* Vision & Mission */}
              <div className="block border border-slate-300 p-4 rounded-lg">
                <h3 className="col-span-3 text-lg font-semibold mb-2">
                  Vision & Mission & value
                </h3>

                <div className="flex flex-col">
                  <label
                    htmlFor="vision"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Vision
                  </label>
                  <textarea
                    id="vision"
                    type="text"
                    name="vision"
                    value={formData.vision}
                    onChange={handleChange}
                    className="border border-slate-300 rounded p-2 w-full h-32"
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="mission"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Mission
                  </label>
                  <textarea
                    id="mission"
                    type="text"
                    name="mission"
                    value={formData.mission}
                    onChange={handleChange}
                    className="border border-slate-300 h-32 rounded p-2 w-full"
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="value_proposition"
                    className="mb-1 font-medium text-gray-700"
                  >
                    Value Proposition
                  </label>
                  <textarea
                    id="value_proposition"
                    type="text"
                    name="value_proposition"
                    value={formData.value_proposition}
                    onChange={handleChange}
                    className="border border-slate-300 h-32 rounded p-2 w-full"
                  />
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
