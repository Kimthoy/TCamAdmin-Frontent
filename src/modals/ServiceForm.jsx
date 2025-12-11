// src/modals/ServiceForm.jsx
import React, { useEffect, useRef, useState } from "react";
import { X, Upload, Trash2, Camera, Check, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createService, updateService } from "../api/services";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ServiceForm({
  open,
  onClose,
  onSaved,
  initial,
  categories = [],
}) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const firstInputRef = useRef(null);
  const isEdit = !!initial?.id;

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return;

    setError(null);
    setTitle(initial?.title || "");
    setCategoryId(initial?.category_id || "");
    setDescription(initial?.description || "");
    setIsPublished(initial?.is_published !== false);
    setImageFile(null);
    setPreview(initial?.feature_image_url || null);

    if (previewUrlRef.current?.startsWith?.("blob:")) {
      try {
        URL.revokeObjectURL(previewUrlRef.current);
      } catch {}
      previewUrlRef.current = null;
    }

    // Focus immediately
    firstInputRef.current?.focus();
  }, [open, initial]);

  // Handle image preview
  useEffect(() => {
    if (!imageFile) {
      setPreview(initial?.feature_image_url || null);
      return;
    }

    if (previewUrlRef.current) {
      try {
        URL.revokeObjectURL(previewUrlRef.current);
      } catch {}
    }

    const url = URL.createObjectURL(imageFile);
    previewUrlRef.current = url;
    setPreview(url);

    return () => {
      if (previewUrlRef.current?.startsWith?.("blob:")) {
        try {
          URL.revokeObjectURL(previewUrlRef.current);
        } catch {}
        previewUrlRef.current = null;
      }
    };
  }, [imageFile, initial?.feature_image_url]);

  const openPicker = () => fileInputRef.current?.click();

  const handleFile = (file) => {
    setError(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, WebP images allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Image too large (max 5MB).");
      return;
    }
    setImageFile(file);
  };

  const removeImage = (e) => {
    e?.stopPropagation();
    setImageFile(null);
    setPreview(initial?.feature_image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("category_id", categoryId || "");
    if (description.trim()) fd.append("description", description.trim());
    fd.append("is_published", isPublished ? "1" : "0");
    if (imageFile) fd.append("feature_image", imageFile);

    setSaving(true);
    try {
      if (isEdit) {
        await updateService(initial.id, fd);
      } else {
        await createService(fd);
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.985 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 28, mass: 0.7 },
    },
    exit: { opacity: 0, y: 10, scale: 0.985, transition: { duration: 0.1 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
            variants={backdropVariants}
            aria-hidden="true"
          />

          {/* Modal card */}
          <motion.div
            variants={cardVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl overflow-y-scroll  h-[99vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="serviceform-title"
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 dark:border-gray-800/50">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <h2
                  id="serviceform-title"
                  className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight"
                >
                  {isEdit ? "Edit Service" : "Create New Service"}
                </h2>

                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isPublished
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {isPublished ? "Published" : "Draft"}
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                {error && (
                  <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                {/* Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Web Design & Development"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-sm"
                    >
                      <option value="">Select category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Brief description of the service..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-sm resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Feature Image
                  </label>

                  <div
                    className="relative group cursor-pointer"
                    onClick={openPicker}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFile(file);
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] && handleFile(e.target.files[0])
                      }
                      className="hidden"
                    />

                    <div className="w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-white/80 dark:bg-gray-900/60 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500/50 transition duration-150">
                      {!preview ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                          <Upload className="w-14 h-14 text-emerald-600 mb-3" />
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Click or Drop Image
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            JPG, PNG, WebP • Max 5MB
                          </p>
                        </div>
                      ) : (
                        <div className="relative w-full h-full">
                          <img
                            src={preview}
                            alt="Service preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPicker();
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-emerald-600 shadow-xl hover:bg-gray-100/90 transition-colors"
                            >
                              <Camera className="w-5 h-5" />
                              <span className="text-sm font-semibold">
                                Change
                              </span>
                            </button>

                            {isEdit && (
                              <button
                                type="button"
                                onClick={removeImage}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                                <span className="text-sm font-semibold">
                                  Remove
                                </span>
                              </button>
                            )}
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <p className="text-xs font-medium">
                              Click to replace
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEdit && preview && !imageFile && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Current image will be kept if unchanged
                    </p>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3 py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Service Status:
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-12 h-7 rounded-full transition-colors duration-150 shadow-inner ${
                        isPublished
                          ? "bg-emerald-500"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-150 ${
                          isPublished ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsPublished((v) => !v)}
                    className={`text-sm font-semibold ${
                      isPublished
                        ? "text-emerald-600"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {isPublished ? "Published" : "Draft"}
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-1/2 lg:w-2/5 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <Ban className="w-5 h-5" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-1/2 lg:w-2/5 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-base font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all duration-150 disabled:opacity-70 disabled:shadow-none"
                  >
                    {saving ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {isEdit ? "Save Changes" : "Create Service"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
