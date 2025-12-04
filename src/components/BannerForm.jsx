// src/components/BannerForm.jsx
import React, { useState, useEffect } from "react";
import { X, Upload, Trash2 } from "lucide-react";

export default function BannerForm({ open, onClose, onSaved, initial = null }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;

    if (initial) {
      setTitle(initial.title || "");
      setSubtitle(initial.subtitle || "");
      setLink(initial.link || "");
      setStatus(!!initial.status);
      setPreview(initial.image_url || null);
      setImageFile(null);
    } else {
      setTitle("");
      setSubtitle("");
      setLink("");
      setStatus(true);
      setImageFile(null);
      setPreview(null);
    }
  }, [open, initial]);

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !imageFile && !preview) {
      alert("Please upload a banner image.");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("subtitle", subtitle);
    fd.append("link", link);
    fd.append("status", status ? 1 : 0);
    if (imageFile) fd.append("image", imageFile);

    try {
      await onSaved(fd, isEdit);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Banner" : "Create New Banner"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-7">
          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                placeholder="e.g. Summer Sale 50% Off"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Subtitle{" "}
                <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
                placeholder="e.g. Limited time offer"
              />
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Link URL{" "}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none"
              placeholder="https://yoursite.com/promotion"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Banner Image{" "}
              {isEdit && (
                <span className="font-normal text-gray-500">
                  (leave empty to keep current)
                </span>
              )}
            </label>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <label
                htmlFor="image-upload"
                className={`relative flex flex-col items-center justify-center w-full sm:w-64 h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  preview
                    ? "border-gray-300 dark:border-gray-600"
                    : "border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/20"
                }`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="text-center p-6">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Click to upload
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG, WebP up to 4MB
                    </p>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>

              {preview && (
                <div className="flex-1 space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <img
                      src={preview}
                      alt="Full preview"
                      className="w-full max-w-md rounded-lg shadow-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove image
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 py-4">
            <input
              type="checkbox"
              id="banner-status"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
            />
            <label
              htmlFor="banner-status"
              className="text-base font-medium text-gray-700 dark:text-gray-300"
            >
              {status ? "Banner is active" : "Banner is disabled"}
            </label>
          </div>

          {/* Action Buttons - NOW WITH PROPER COLOR & STYLE */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm"
            >
              Cancel
            </button>

            {/* Save/Create Button - Primary Color Fixed */}
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-3 min-w-[140px] justify-center"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>{isEdit ? "Save Changes" : "Create Banner"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
