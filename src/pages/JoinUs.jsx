import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  fetchWhyJoinUsSections,
  createWhyJoinUs,
  updateWhyJoinUs,
} from "../api/joinus";
import {
  Award,
  BookOpen,
  CopyPlus,
  CopyX,
  PenBoxIcon,
  SaveAll,
  Smile,
  Trash,
  Users,
} from "lucide-react";

const iconOptions = { Award, BookOpen, Smile, Users };

const Label = ({ children }) => (
  <label className="block mb-1 text-sm font-medium text-gray-700">
    {children}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow ${
      props.className || ""
    }`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow ${
      props.className || ""
    }`}
  />
);

export default function JoinUs() {
  const [sections, setSections] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({
    section_tag: "",
    section_title: "",
    section_description: "",
    status: true,
    sort_order: 0,
    items: [],
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const res = await fetchWhyJoinUsSections();
      const data = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setSections(data);

      // Auto select first item
      if (data.length > 0) {
        setSelectedId(data[0].id);
        setFormData({
          section_tag: data[0].section_tag || "",
          section_title: data[0].section_title || "",
          section_description: data[0].section_description || "",
          status: data[0].status ?? true,
          sort_order: data[0].sort_order || 0,
          items: data[0].items || [],
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AUTO SAVE
  const autoSave = async (newData) => {
    setSaving(true);
    try {
      if (selectedId) {
        await updateWhyJoinUs(selectedId, newData);
      } else {
        const res = await createWhyJoinUs(newData);
        setSelectedId(res.data.id);
      }
      Swal.fire("Success", "Saved successfully", "success");
      loadSections();
    } catch (error) {
      Swal.fire("Error", "Failed to save data", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newData = {
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    };
    setFormData(newData);
    autoSave(newData);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    const newData = { ...formData, items: updatedItems };
    setFormData(newData);
    autoSave(newData);
  };

  const addItem = () => {
    const newData = {
      ...formData,
      items: [...formData.items, { title: "", desc: "", icon: "Award" }],
    };
    setFormData(newData);
    autoSave(newData);
  };

  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    const newData = { ...formData, items: updatedItems };
    setFormData(newData);
    autoSave(newData);
  };

  const handleSelect = (id) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;

    setSelectedId(id);
    setFormData({
      section_tag: section.section_tag || "",
      section_title: section.section_title || "",
      section_description: section.section_description || "",
      status: section.status ?? true,
      sort_order: section.sort_order || 0,
      items: section.items || [],
    });
  };

  return (
    <div className="max-w-8xl mx-auto ">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Join Us Management</h1>
            <button
              onClick={() => {
                setSelectedId(null);
                setFormData({
                  section_tag: "",
                  section_title: "",
                  section_description: "",
                  status: true,
                  sort_order: 0,
                  items: [],
                });
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <CopyPlus /> New
            </button>
          </div>

          {/* SELECT */}
          <div className="mb-6">
            <select
              value={selectedId || ""}
              onChange={(e) => handleSelect(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-4 py-3"
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.section_title}
                </option>
              ))}
            </select>
          </div>

          {/* FORM */}
          <form className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold mb-4">Section Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Section Tag</Label>
                  <Input
                    name="section_tag"
                    value={formData.section_tag}
                    onChange={handleChange}
                    placeholder="Section Tag"
                  />
                </div>

                <div>
                  <Label>Section Title</Label>
                  <Input
                    name="section_title"
                    value={formData.section_title}
                    onChange={handleChange}
                    placeholder="Section Title"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Section Description</Label>
                  <Textarea
                    name="section_description"
                    value={formData.section_description}
                    onChange={handleChange}
                    placeholder="Section Description"
                    className="h-28"
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>

                <div>
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleChange}
                    placeholder="Sort Order"
                  />
                </div>
              </div>
            </section>

            {/* Items */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Items</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition"
                  >
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                      title="Remove Item"
                    >
                      <Trash className="w-4 h-4" />
                    </button>

                    {/* Icon + Title */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        {/* Icon Preview */}
                        {React.createElement(iconOptions[item.icon] || Award, {
                          className: "w-5 h-5 text-gray-600",
                        })}
                      </div>

                      <div className="flex-1">
                        <Label>Title</Label>
                        <Input
                          value={item.title}
                          onChange={(e) =>
                            handleItemChange(idx, "title", e.target.value)
                          }
                          placeholder="Title"
                        />
                      </div>
                    </div>

                    {/* Icon Selector */}
                    <div className="mb-4">
                      <Label>Icon</Label>
                      <select
                        value={item.icon}
                        onChange={(e) =>
                          handleItemChange(idx, "icon", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-3"
                      >
                        {Object.keys(iconOptions).map((iconName) => (
                          <option key={iconName} value={iconName}>
                            {iconName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={item.desc}
                        onChange={(e) =>
                          handleItemChange(idx, "desc", e.target.value)
                        }
                        placeholder="Description"
                        className="h-24"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addItem}
                className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-xl hover:opacity-90 transition"
              >
                <CopyPlus className="w-5 h-5" />
                Add Item
              </button>
            </section>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={saving}
                className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <SaveAll /> {saving ? "Saving..." : "Auto Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
