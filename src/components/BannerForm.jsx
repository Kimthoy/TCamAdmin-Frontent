// src/components/BannerForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Trash2, Check, ImageOff } from "lucide-react";

export default function BannerForm({ open, onClose, onSaved, initial = null }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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
      resetForm();
    }
  }, [open, initial]);

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setLink("");
    setStatus(true);
    setImageFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setImageFile(file);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !imageFile && !preview) {
      alert("Please upload a banner image.");
      return;
    }

    setSaving(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("subtitle", subtitle || "");
    fd.append("link", link || "");
    fd.append("status", status ? 1 : 0);
    if (imageFile) fd.append("image", imageFile);

    try {
      await onSaved(fd, isEdit);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save banner. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
      {/* Glassmorphic Modal */}
      <div
        className="relative w-full max-w-4xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEdit ? "Edit Banner" : "Create New Banner"}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isEdit
                ? "Update banner details and image"
                : "Add a new promotional banner to your homepage"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
          >
            <X className="w-6 h-6 text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Banner Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-5 py-4 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-base"
                placeholder="Summer Mega Sale – Up to 70% Off!"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Subtitle{" "}
                <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                placeholder="Limited time only – Don't miss out!"
              />
            </div>
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Destination URL{" "}
              <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
              placeholder="https://yoursite.com/summer-sale"
            />
          </div>

          {/* Image Upload - Drag & Drop */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Banner Image {isEdit && "(leave unchanged to keep current)"}
            </label>

            <div
              className={`relative border-2 border-dashed rounded-3xl transition-all ${
                dragActive
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) =>
                  e.target.files?.[0] && setImageFile(e.target.files[0])
                }
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />

              {!preview ? (
                <div className="p-12 text-center">
                  <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <Upload className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Drop your image here, or{" "}
                    <span className="text-emerald-600 dark:text-emerald-400 underline">
                      browse
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    Supports JPG, PNG, WebP, GIF • Max 5MB • Recommended
                    1920×600px
                  </p>
                </div>
              ) : (
                <div className="relative group">
                  <img
                    src={preview}
                    alt="Banner preview"
                    className="w-full h-80 object-cover rounded-3xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg transition-all"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Ready
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center gap-4 py-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={status}
                onChange={(e) => setStatus(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300/30 dark:peer-focus:ring-emerald-800/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
            <span className="text-base font-medium text-gray-700 dark:text-gray-300">
              Banner is {status ? "active" : "disabled"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>

            {/* Gradient Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="relative px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden group flex items-center gap-3"
            >
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-full transition-transform duration-700" />
              {saving ? (
                <>
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {isEdit ? "Save Changes" : "Create Banner"}
                  <Check className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
