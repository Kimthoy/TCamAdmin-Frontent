// src/pages/admin/JoinUs.jsx
import React, { useEffect, useState } from "react";
import {
  fetchWhyJoinUsSections,
  createWhyJoinUs,
  updateWhyJoinUs,
  deleteWhyJoinUs,
  getWhyJoinUsById,
} from "../api/joinus";
import { Award, BookOpen, Smile, Users } from "lucide-react";
import Swal from "sweetalert2";

const iconOptions = { Award, BookOpen, Smile, Users };

export default function JoinUs() {
  const [sections, setSections] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    section_tag: "",
    section_title: "",
    section_description: "",
    status: true,
    sort_order: 0,
    items: [],
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = () => {
    fetchWhyJoinUsSections()
      .then((res) => {
        const data = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setSections(data);
      })
      .catch((err) => console.error(err));
  };

  const openModal = (section = null) => {
    if (section) {
      // Edit
      const data = section;
      setFormData({
        section_tag: data.section_tag || "",
        section_title: data.section_title,
        section_description: data.section_description || "",
        status: data.status,
        sort_order: data.sort_order,
        items: data.items || [],
      });
      setEditingId(section.id);
    } else {
      // Create
      setFormData({
        section_tag: "",
        section_title: "",
        section_description: "",
        status: true,
        sort_order: 0,
        items: [],
      });
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { title: "", desc: "", icon: "Award" }],
    });
  };

  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This section will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteWhyJoinUs(id)
          .then(() => {
            Swal.fire("Deleted!", "Section deleted successfully.", "success");
            loadSections();
          })
          .catch((err) => console.error(err));
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const apiCall = editingId
      ? updateWhyJoinUs(editingId, formData)
      : createWhyJoinUs(formData);

    apiCall
      .then(() => {
        Swal.fire(
          "Success",
          `Section ${editingId ? "updated" : "created"} successfully`,
          "success"
        );
        closeModal();
        loadSections();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Why Join Us Sections</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-3  py-5 rounded hover:bg-blue-700 transition"
        >
          + Add Section
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto text-sm shadow rounded-lg">
        <table className="w-full table-auto ">
          <thead className="bg-gray-100">
            <tr>
              <th className="  py-5 text-center">ID</th>
              <th className="  py-5 text-center">Title</th>
              <th className="  py-5 text-center">Tag</th>
              <th className="  py-5 text-center">Status</th>
              <th className="  py-5 text-center">Sort</th>
              <th className="  py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(sections) && sections.length > 0 ? (
              sections.map((sec) => (
                <tr key={sec.id} className="hover:bg-gray-50 transition ">
                  <td className="  py-5 text-center">{sec.id}</td>
                  <td className="  py-5 text-center">{sec.section_title}</td>
                  <td className="  py-5 text-center">{sec.section_tag}</td>
                  <td className="  py-5 text-center">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        sec.status
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {sec.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="  py-5 text-center">{sec.sort_order}</td>
                  <td className="  py-5 text-center flex gap-2 items-center align-middle justify-center">
                    <button
                      onClick={() => openModal(sec)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sec.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No sections found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Edit Section" : "Add Section"}
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <input
                  name="section_tag"
                  value={formData.section_tag}
                  onChange={handleChange}
                  placeholder="Section Tag"
                  className="border p-2 flex-1 rounded"
                />
                <input
                  name="section_title"
                  value={formData.section_title}
                  onChange={handleChange}
                  placeholder="Section Title"
                  className="border p-2 flex-1 rounded"
                  required
                />
              </div>
              <textarea
                name="section_description"
                value={formData.section_description}
                onChange={handleChange}
                placeholder="Section Description"
                className="border p-2 w-full rounded"
              />
              <div className="flex items-center gap-4">
                <label>
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Active
                </label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleChange}
                  placeholder="Sort Order"
                  className="border p-2 rounded w-24"
                />
              </div>

              {/* Items */}
              <div>
                <h3 className="font-semibold">Items</h3>
                <div className="space-y-2  h-72 overflow-x-scroll">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center ">
                      <select
                        value={item.icon}
                        onChange={(e) =>
                          handleItemChange(idx, "icon", e.target.value)
                        }
                        className="border p-2 rounded"
                      >
                        {Object.keys(iconOptions).map((iconName) => (
                          <option key={iconName} value={iconName}>
                            {iconName}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) =>
                          handleItemChange(idx, "title", e.target.value)
                        }
                        className="border p-2 rounded flex-1"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.desc}
                        onChange={(e) =>
                          handleItemChange(idx, "desc", e.target.value)
                        }
                        className="border p-2 rounded flex-2"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="bg-red-500 text-white px-2 rounded"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-green-500 text-white  py-5 text-center rounded mt-2"
                >
                  Add Item
                </button>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-5 rounded mt-4 hover:bg-blue-700 transition"
              >
                {editingId ? "Update Section" : "Create Section"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
