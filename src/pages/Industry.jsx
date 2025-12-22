import React, { useEffect, useState } from "react";
import {
  fetchIndustries,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} from "../api/industry";
import { toast } from "react-hot-toast";
import { Pencil, Trash2, Plus, X } from "lucide-react";

function Industry() {
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingIndustry, setEditingIndustry] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    industry_name: "",
    industry_description: "",
    status: true,
    sort_order: 0,
    solutions: [],
  });

  // Load all industries
  const loadIndustries = async () => {
    setLoading(true);
    try {
      const res = await fetchIndustries();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setIndustries(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch industries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndustries();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle solutions array change
  const handleSolutionChange = (index, key, value) => {
    const updated = [...form.solutions];
    updated[index][key] = value;
    setForm((prev) => ({ ...prev, solutions: updated }));
  };

  const addSolution = () =>
    setForm((prev) => ({
      ...prev,
      solutions: [...prev.solutions, { title: "", description: "" }],
    }));

  const removeSolution = (index) => {
    const updated = [...form.solutions];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, solutions: updated }));
  };

  // Open modal for add/edit
  const openModal = (industry = null) => {
    if (industry) {
      setEditingIndustry(industry.id);
      setForm({
        industry_name: industry.industry_name || "",
        industry_description: industry.industry_description || "",
        status: industry.status ?? true,
        sort_order: industry.sort_order || 0,
        solutions: industry.solutions || [],
      });
    } else {
      setEditingIndustry(null);
      setForm({
        industry_name: "",
        industry_description: "",
        status: true,
        sort_order: 0,
        solutions: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // Delete industry
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this industry?")) return;
    try {
      await deleteIndustry(id);
      toast.success("Industry deleted");
      loadIndustries();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  // Submit create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, solutions: form.solutions };
      if (editingIndustry) await updateIndustry(editingIndustry, payload);
      else await createIndustry(payload);

      toast.success(
        editingIndustry ? "Updated successfully" : "Created successfully"
      );
      closeModal();
      loadIndustries();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Industries</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow"
        >
          <Plus className="w-4 h-4" /> Add Industry
        </button>
      </div>

      {/* Industry Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center">Loading...</p>
        ) : industries.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No industries found
          </p>
        ) : (
          industries.map((ind) => (
            <div
              key={ind.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{ind.industry_name}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(ind)}
                    className="p-1 rounded hover:bg-yellow-100"
                  >
                    <Pencil className="w-5 h-5 text-yellow-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(ind.id)}
                    className="p-1 rounded hover:bg-red-100"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              </div>
              {ind.industry_description && (
                <p className="text-gray-600 mb-2">{ind.industry_description}</p>
              )}
              <div className="flex flex-wrap gap-1 mb-2">
                {Array.isArray(ind.solutions) &&
                  ind.solutions.map((s, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
                    >
                      {s.title}
                    </span>
                  ))}
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{ind.status ? "Active" : "Inactive"}</span>
                <span>Sort: {ind.sort_order}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] p-6 relative overflow-y-auto">
            {/* Modal Header */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-2xl font-semibold mb-6">
              {editingIndustry ? "Edit Industry" : "Add Industry"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Industry Name */}
              <div>
                <label className="block font-medium mb-1">Industry Name</label>
                <input
                  type="text"
                  name="industry_name"
                  placeholder="Enter industry name"
                  value={form.industry_name}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  The name of the industry (e.g., Banking, Healthcare,
                  Manufacturing).
                </p>
              </div>

              {/* Industry Description */}
              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  name="industry_description"
                  placeholder="Enter description"
                  value={form.industry_description}
                  onChange={handleChange}
                  className="w-full border rounded p-2"
                />
                <p className="text-sm text-gray-500 mt-1">
                  A brief description of the industry and its focus.
                </p>
              </div>

              {/* Solutions */}
              <div>
                <label className="block font-medium mb-1">Solutions</label>
                <p className="text-sm text-gray-500 mb-2">
                  List all solutions related to this industry. Each solution has
                  a title and an optional description.
                </p>
                {form.solutions.map((s, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      placeholder="Solution Title"
                      value={s.title}
                      onChange={(e) =>
                        handleSolutionChange(idx, "title", e.target.value)
                      }
                      className="border rounded p-1 flex-1"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Solution Description"
                      value={s.description}
                      onChange={(e) =>
                        handleSolutionChange(idx, "description", e.target.value)
                      }
                      className="border rounded p-1 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeSolution(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSolution}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Solution
                </button>
              </div>

              {/* Status */}
              <div>
                <label className="flex items-center gap-2 font-medium">
                  <input
                    type="checkbox"
                    name="status"
                    checked={form.status}
                    onChange={handleChange}
                  />{" "}
                  Active
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Determines whether this industry is active and visible in the
                  system.
                </p>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block font-medium mb-1">Sort Order</label>
                <input
                  type="number"
                  name="sort_order"
                  value={form.sort_order}
                  onChange={handleChange}
                  className="border rounded p-1 w-24"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Lower numbers appear first when listing industries. Default is
                  0.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingIndustry ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Industry;
