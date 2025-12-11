// src/modals/PartnerForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Trash2, Camera, Check, Ban, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPartner, updatePartner } from "../api/partners";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// ⬇️ MOCK CATEGORIES: Used for the Category select input
const MOCK_CATEGORIES = [
  { id: 1, name: "Cloud Providers" },
  { id: 2, name: "Agency Partners" },
  { id: 3, name: "Technology Vendors" },
  { id: 4, name: "Financial Services" },
];

export default function PartnerForm({
  open,
  onClose,
  onSaved,
  initial = null,
}) {
  const isEdit = !!initial?.id;

  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categories] = useState(MOCK_CATEGORIES);

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const firstInputRef = useRef(null);

  // Reset form when opened
  useEffect(() => {
    if (!open) return;

    setError(null);
    setName(initial?.name || "");
    setLink(initial?.link || "");
    setShortDesc(initial?.short_description || "");
    setSortOrder(initial?.sort_order?.toString() || "");
    // Handle initial category ID
    setCategoryId(
      initial?.category_id?.toString() ||
        initial?.category?.id?.toString() ||
        ""
    );
    setIsActive(initial?.is_active !== false);
    setLogoFile(null);
    setPreview(initial?.logo_url || null);

    if (previewUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [open, initial]);

  // Handle preview
  useEffect(() => {
    if (!logoFile) {
      setPreview(initial?.logo_url || null);
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(logoFile);
    previewUrlRef.current = url;
    setPreview(url);
  }, [logoFile, initial]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const openPicker = () => fileInputRef.current?.click();

  const handleFile = (file) => {
    setError(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, WebP allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Logo too large (max 5MB).");
      return;
    }
    setLogoFile(file);
  };

  const removeLogo = (e) => {
    e?.stopPropagation();
    setLogoFile(null);
    setPreview(initial?.logo_url || null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Partner name is required.");

    const fd = new FormData();
    fd.append("name", name.trim());
    if (link.trim()) fd.append("link", link.trim());
    if (shortDesc.trim()) fd.append("short_description", shortDesc.trim());

    // Include sort_order and category_id
    if (sortOrder !== "") fd.append("sort_order", sortOrder);
    if (categoryId !== "") fd.append("category_id", categoryId);

    fd.append("is_active", isActive ? "1" : "0");
    if (logoFile) fd.append("logo", logoFile);

    setSaving(true);
    try {
      if (isEdit) {
        await updatePartner(initial.id, fd);
      } else {
        await createPartner(fd);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save partner.");
    } finally {
      setSaving(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 25 },
    },
    exit: { opacity: 0, y: 15, scale: 0.985 },
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
            variants={backdropVariants}
            aria-hidden
          />

          <motion.div
            variants={cardVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl overflow-y-scroll  h-[99vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="partnerform-title"
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 dark:border-gray-800/50">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <h2
                  id="partnerform-title"
                  className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight flex items-center gap-3"
                >
                  <Link2 className="w-7 h-7 text-emerald-600" />
                  {isEdit ? "Edit Partner" : "Add New Partner"}
                </h2>

                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {isActive ? "Active" : "Hidden"}
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

                {/* 1️⃣ Name & Link: ALWAYS side-by-side (2 columns) on all screens, including mobile */}
                {/* Changed from grid-cols-1 sm:grid-cols-2 to grid-cols-2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Partner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Microsoft"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://microsoft.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-sm"
                    />
                  </div>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Short Description
                  </label>
                  <textarea
                    rows={3}
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    placeholder="Strategic cloud partner since 2022..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-sm resize-none"
                  />
                </div>

                {/* 2️⃣ Category Selection & Sort Order: ALWAYS side-by-side (2 columns) on all screens, including mobile */}
                {/* Changed from grid-cols-1 sm:grid-cols-2 to grid-cols-2 */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Category Select Field */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="">(None)</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Order Field */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Lower number = appears first
                    </p>
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Partner Logo{" "}
                    {!isEdit && <span className="text-red-500">*</span>}
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
                            Click or Drop Logo
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            JPG, PNG, WebP • Max 5MB
                          </p>
                        </div>
                      ) : (
                        <div className="relative w-full h-full flex items-center justify-center p-6">
                          <img
                            src={preview}
                            alt="Partner logo preview"
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                          />

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
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
                                onClick={removeLogo}
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                                <span className="text-sm font-semibold">
                                  Remove
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEdit && preview && !logoFile && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      Current logo will be kept if unchanged
                    </p>
                  )}
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-3 py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Visibility:
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-12 h-7 rounded-full transition-colors duration-200 shadow-inner ${
                        isActive
                          ? "bg-emerald-500"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-200 ${
                          isActive ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsActive((v) => !v)}
                    className={`text-sm font-semibold ${
                      isActive
                        ? "text-emerald-600"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {isActive ? "Visible" : "Hidden"}
                  </button>
                </div>

                {/* 3️⃣ Buttons: ALWAYS side-by-side (single row) on all screens */}
                {/* Changed from flex-col-reverse sm:flex-row to flex-row */}
                <div className="flex flex-row justify-center gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={onClose}
                    // Changed w-full sm:w-1/2 to w-1/2 for consistent sizing
                    className="w-1/2 lg:w-2/5 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <Ban className="w-5 h-5" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    // Changed w-full sm:w-1/2 to w-1/2 for consistent sizing
                    className="w-1/2 lg:w-2/5 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-base font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all duration-200 disabled:opacity-70 disabled:shadow-none"
                  >
                    {saving ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {isEdit ? "Save Changes" : "Create Partner"}
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
