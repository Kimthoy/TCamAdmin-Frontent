import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchAboutUsList, createAboutUs, updateAboutUs } from "../api/about";
import { SaveAll } from "lucide-react";

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

export default function AdminAboutUs() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAbout();
  }, []);

  const loadAbout = async () => {
    try {
      const res = await fetchAboutUsList();
      if (res?.length > 0) {
        const a = res[0];
        setAbout(a);
        setPreview(a.company_image || null);
      } else {
        setAbout({});
        setPreview(null);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to load about data", "error");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW: Save only when button clicked
  const handleSave = async () => {
    setSaving(true);

    const formData = new FormData();
    Object.keys(about || {}).forEach((key) => {
      if (key === "company_image") {
        if (about[key] instanceof File) {
          formData.append(key, about[key]);
        }
      } else if (about[key] !== null && about[key] !== undefined) {
        if (key === "operational_offices") {
          formData.append(key, JSON.stringify(about[key]));
        } else {
          formData.append(key, about[key]);
        }
      }
    });

    try {
      if (about?.id) {
        await updateAboutUs(about.id, formData);
      } else {
        await createAboutUs(formData);
      }

      Swal.fire("Success", "Saved successfully", "success");
      loadAbout();
    } catch (error) {
      Swal.fire("Error", "Failed to save data", "error");
    } finally {
      setSaving(false);
    }
  };

  // Change handler (NO AUTO SAVE)
  const handleChange = (e) => {
    const newData = { ...about, [e.target.name]: e.target.value };
    setAbout(newData);
  };

  const handleOfficesChange = (e) => {
    const value = e.target.value.split(",").map((v) => v.trim());
    const newData = { ...about, operational_offices: value };
    setAbout(newData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      const newData = { ...about, company_image: file };
      setAbout(newData);
      setPreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <form className="p-6 space-y-12">
          {/* Basic */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Title</Label>
                <Input
                  name="title"
                  value={about?.title || ""}
                  onChange={handleChange}
                  placeholder="Title"
                  required
                />
              </div>

              <div>
                <Label>Founding Year</Label>
                <Input
                  name="founding_year"
                  type="number"
                  value={about?.founding_year || ""}
                  onChange={handleChange}
                  placeholder="Founding Year"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Company Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm py-2 rounded-lg border border-dashed border-gray-400 text-gray-400"
                />
              </div>

              <div className="md:col-span-2">
                {preview ? (
                  <img
                    src={preview}
                    alt="Company Preview"
                    className="h-28 object-contain border rounded-lg p-2 bg-gray-50"
                  />
                ) : (
                  <div className="h-28 w-full flex items-center justify-center border rounded-lg text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Label>Founders Info</Label>
                <Textarea
                  name="founders_info"
                  value={about?.founders_info || ""}
                  onChange={handleChange}
                  placeholder="Founders Info"
                  className="h-28"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Introduction</Label>
                <Textarea
                  name="intro_text"
                  value={about?.intro_text || ""}
                  onChange={handleChange}
                  placeholder="Introduction"
                  className="h-28"
                />
              </div>
            </div>
          </section>

          {/* Operations */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Operational Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label>Operational Offices (comma separated)</Label>
                <Input
                  name="operational_offices"
                  value={(about?.operational_offices || []).join(", ")}
                  onChange={handleOfficesChange}
                  placeholder="Office1, Office2"
                />
              </div>

              <div>
                <Label>Project Count</Label>
                <Input
                  name="project_count"
                  type="number"
                  value={about?.project_count || ""}
                  onChange={handleChange}
                  placeholder="Project Count"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Services Description</Label>
                <Textarea
                  name="services_description"
                  value={about?.services_description || ""}
                  onChange={handleChange}
                  placeholder="Services Description"
                  className="h-28"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Company Profile</Label>
                <Textarea
                  name="company_profile"
                  value={about?.company_profile || ""}
                  onChange={handleChange}
                  placeholder="Company Profile"
                  className="h-28"
                />
              </div>
            </div>
          </section>

          {/* Vision / Mission */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Vision & Mission</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label>Vision</Label>
                <Textarea
                  name="vision"
                  value={about?.vision || ""}
                  onChange={handleChange}
                  placeholder="Vision"
                  className="h-40"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Mission</Label>
                <Textarea
                  name="mission"
                  value={about?.mission || ""}
                  onChange={handleChange}
                  placeholder="Mission"
                  className="h-40"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Value Proposition</Label>
                <Textarea
                  name="value_proposition"
                  value={about?.value_proposition || ""}
                  onChange={handleChange}
                  placeholder="Value Proposition"
                  className="h-40"
                />
              </div>
            </div>
          </section>

          {/* SAVE BUTTON */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex gap-2 items-center cursor-pointer hover:bg-green-200 hover:text-green-500 transition-all justify-center bg-green-500 text-white px-8 py-2 rounded-lg disabled:opacity-50"
            >
              <SaveAll /> {saving ? "Saving..." : " Save About Us"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
