import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchWidgets, createWidget, updateWidget } from "../api/widget";

const Label = ({ children }) => (
  <label className="block mb-1 text-sm font-medium text-gray-700">
    {children}
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      props.className || ""
    }`}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      props.className || ""
    }`}
  />
);
export default function AdminWidget() {
  const [widget, setWidget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWidget();
  }, []);

  const loadWidget = async () => {
    try {
      const res = await fetchWidgets();
      if (res.data?.data?.length > 0) {
        const w = res.data.data[0];
        setWidget(w);
        // If the backend returns a full URL accessor, use it
        setPreview(
          w.app_logo_url ||
            (w.app_logo ? `/storage/widgets/${w.app_logo}` : null)
        );
      } else {
        setWidget({});
        setPreview(null);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to load widget data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setWidget({ ...widget, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Revoke previous blob URL if exists
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      setWidget({ ...widget, app_logo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();

    Object.keys(widget || {}).forEach((key) => {
      if (key === "app_logo") {
        if (widget[key] instanceof File) {
          formData.append(key, widget[key]);
        }
      } else if (widget[key] !== null && widget[key] !== undefined) {
        formData.append(key, widget[key]);
      }
    });

    try {
      if (widget?.id) {
        await updateWidget(widget.id, formData);
        Swal.fire("Success", "Settings updated successfully", "success");
      } else {
        await createWidget(formData);
        Swal.fire("Success", "Settings saved successfully", "success");
      }
      loadWidget();
    } catch (error) {
      Swal.fire("Error", "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600">
          <h1 className="text-xl font-semibold text-white">
            Website Widget Settings
          </h1>
          <p className="text-sm text-blue-100">
            Manage branding, contact & footer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-12">
          {/* General */}
          <section>
            <h2 className="text-lg font-semibold mb-4">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>App Name</Label>
                <Input
                  name="app_name"
                  value={widget?.app_name || ""}
                  onChange={handleChange}
                  placeholder="App Name"
                />
              </div>
              <div>
                <Label>Short Description</Label>
                <Input
                  name="app_sort_desc"
                  value={widget?.app_sort_desc || ""}
                  onChange={handleChange}
                  placeholder="Short Description"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Abstract Description</Label>
                <Textarea
                  name="abstract_desc"
                  value={widget?.abstract_desc || ""}
                  onChange={handleChange}
                  placeholder="Abstract Description"
                  className="h-40"
                />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Email</Label>
                <Input
                  name="contact_email"
                  value={widget?.contact_email || ""}
                  onChange={handleChange}
                  placeholder="Email"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  name="contact_number"
                  value={widget?.contact_number || ""}
                  onChange={handleChange}
                  placeholder="Phone"
                />
              </div>
              <div>
                <Label>Facebook</Label>
                <Input
                  name="contact_facebook"
                  value={widget?.contact_facebook || ""}
                  onChange={handleChange}
                  placeholder="Facebook URL"
                />
              </div>
              <div>
                <Label>YouTube</Label>
                <Input
                  name="contact_youtube"
                  value={widget?.contact_youtube || ""}
                  onChange={handleChange}
                  placeholder="YouTube URL"
                />
              </div>
              <div>
                <Label>Telegram</Label>
                <Input
                  name="contact_telegram"
                  value={widget?.contact_telegram || ""}
                  onChange={handleChange}
                  placeholder="Telegram URL"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Textarea
                  name="contact_address"
                  value={widget?.contact_address || ""}
                  onChange={handleChange}
                  placeholder="Address"
                  className="h-40"
                />
              </div>
            </div>
          </section>

          {/* Branding */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Branding</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <Label>App Logo</Label>
                <p>Please select a logo to update the company branding.</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm py-2 rounded-lg border border-dashed border-gray-400 text-gray-400"
                />
              </div>
              <div className="flex justify-center">
                {preview ? (
                  <img
                    src={preview}
                    alt="Logo Preview"
                    className="h-28 object-contain border rounded-lg p-2 bg-gray-50"
                  />
                ) : widget?.app_logo ? (
                  <img
                    src={`/storage/widgets/${widget.app_logo}`}
                    alt="Current Logo"
                    className="h-28 object-contain border rounded-lg p-2 bg-gray-50"
                  />
                ) : (
                  <div className="h-28 w-28 flex items-center justify-center border rounded-lg text-gray-400">
                    No Logo
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Footer */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Footer</h2>
            <Label>Footer Ownership</Label>
            <Input
              name="footer_ownership"
              value={widget?.footer_ownership || ""}
              onChange={handleChange}
              placeholder="Footer Ownership"
            />
          </section>

          <div className="pt-4">
            <button
              disabled={saving}
              className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
