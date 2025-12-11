// src/modals/BannerForm.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Trash2,
  Check,
  Camera,
  Ban,
  Globe,
  Link,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PAGE_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "about", label: "About Us" },
  { value: "services", label: "Services" },
  { value: "products", label: "Products" },
  { value: "contact", label: "Contact" },
  { value: "blog", label: "Blog" },
];

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function BannerForm({
  open,
  onClose,
  onSaved = null,
  initial = null,
}) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [status, setStatus] = useState(true);
  const [page, setPage] = useState("home");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const firstInputRef = useRef(null);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;

    setError(null);
    setTitle(initial?.title || "");
    setSubtitle(initial?.subtitle || "");
    setLink(initial?.link || "");
    setStatus(initial?.status !== false);
    setPage(initial?.page || "home");
    setImageFile(null);

    if (previewUrlRef.current?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(previewUrlRef.current);
      } catch (e) {}
      previewUrlRef.current = null;
    }
    setPreview(initial?.image_url || null);

    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [open, initial]);

  useEffect(() => {
    if (!imageFile) {
      const prev = previewUrlRef.current;
      if (prev?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(prev);
        } catch (e) {}
      }
      previewUrlRef.current = null;
      setPreview(initial?.image_url || null);
      return;
    }

    const oldBlob = previewUrlRef.current;
    const newUrl = URL.createObjectURL(imageFile);
    previewUrlRef.current = newUrl;
    setPreview(newUrl);

    if (oldBlob?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(oldBlob);
      } catch (e) {}
    }

    return () => {
      if (previewUrlRef.current === newUrl && newUrl?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(newUrl);
        } catch (e) {}
        previewUrlRef.current = null;
      }
    };
  }, [imageFile, initial]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewUrlRef.current);
        } catch (e) {}
        previewUrlRef.current = null;
      }
    };
  }, []);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileSelection = (file) => {
    setError(null);
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, WebP allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Image too large (max 4MB).");
      return;
    }
    setImageFile(file);
  };

  const handleRemoveImage = (e) => {
    e?.stopPropagation();
    if (previewUrlRef.current?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(previewUrlRef.current);
      } catch (e) {}
      previewUrlRef.current = null;
    }
    setImageFile(null);
    setPreview(isEdit ? initial?.image_url : null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isEdit && !imageFile) {
      setError("Please upload a banner image.");
      return;
    }
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const fd = new FormData();
    fd.append("title", title.trim());
    if (subtitle.trim()) fd.append("subtitle", subtitle.trim());
    if (link.trim()) fd.append("link", link.trim());
    fd.append("status", status ? "1" : "0");
    fd.append("page", page);
    if (imageFile) fd.append("image", imageFile);

    setSaving(true);
    try {
      if (typeof onSaved === "function") {
        await onSaved(fd, isEdit, initial?.id);
      } else {
        if (isEdit) {
          fd.append("_method", "PUT");
          await updateBanner(initial.id, fd);
        } else {
          await createBanner(fd);
        }
      }
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (err?.response?.data?.errors &&
            Object.values(err.response.data.errors).flat()[0]) ||
          "Failed to save banner."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            className="relative w-full max-w-3xl bg-white dark:bg-gray-900 overflow-y-scroll  h-[99vh] rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {isEdit ? "Edit Banner" : "Create New Banner"}
              </h2>
              <button
                onClick={handleClose}
                disabled={saving}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              {/* Title & Subtitle — One Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summer Sale 70% Off"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Limited time only"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Page & Link — One Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    <Globe className="inline w-4 h-4 mr-1" />
                    Display On Page <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={page}
                    onChange={(e) => setPage(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                  >
                    {PAGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                    <Link className="inline w-4 h-4 mr-1" />
                    Link URL (optional)
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://example.com/promo"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Banner Image{" "}
                  {!isEdit && <span className="text-red-500">*</span>}
                </label>
                <div
                  className="relative group cursor-pointer"
                  onClick={openFilePicker}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileSelection(file);
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files?.[0] &&
                      handleFileSelection(e.target.files[0])
                    }
                    className="hidden"
                  />

                  <div className="w-full h-56 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500/50 transition">
                    {!preview ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                        <Upload className="w-16 h-16 text-emerald-600 mb-4" />
                        <p className="text-lg font-semibold">
                          Click or Drop Image
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          JPG, PNG, WebP • Max 4MB
                        </p>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openFilePicker();
                            }}
                            className="px-5 py-3 bg-white text-emerald-600 rounded-full font-semibold shadow-lg hover:bg-gray-100"
                          >
                            <Camera className="inline w-5 h-5 mr-2" />
                            Change
                          </button>
                          {isEdit && (
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="px-5 py-3 bg-red-600 text-white rounded-full font-semibold shadow-lg hover:bg-red-700"
                            >
                              <Trash2 className="inline w-5 h-5 mr-2" />
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center gap-4 py-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status:
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status}
                    onChange={(e) => setStatus(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-12 h-7 rounded-full transition-colors ${
                      status ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform ${
                        status ? "translate-x-5" : ""
                      }`}
                    />
                  </div>
                </label>
                <span
                  className={`text-sm font-semibold ${
                    status ? "text-emerald-600" : "text-gray-500"
                  }`}
                >
                  {status ? "Active" : "Disabled"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="w-full px-6 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg disabled:opacity-70 transition flex items-center justify-center gap-3"
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {isEdit ? "Save Changes" : "Create Banner"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
