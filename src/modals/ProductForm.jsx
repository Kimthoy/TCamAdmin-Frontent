// src/modals/ProductForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Upload, Trash2, Camera, Check, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createProduct, updateProduct } from "../api/products";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ProductForm({
  open,
  onClose,
  onSaved,
  initial = null,
  categories = [],
}) {
  const isEdit = !!initial?.id;

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [website_link, setWebsiteLink] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fileRef = useRef(null);
  const previewUrlRef = useRef(null);
  const firstInputRef = useRef(null);

  /* Reset form when modal opens */
  useEffect(() => {
    if (!open) return;

    setError(null);
    setTitle(initial?.title || "");
    setCategoryId(initial?.category_id || initial?.category?.id || "");
    setShortDesc(initial?.short_description || "");
    setDescription(initial?.description || "");
    setPrice(initial?.price || "");
    setWebsiteLink(initial?.website_link || "");
    setIsPublished(initial?.is_published !== false);

    setImageFile(null);
    setPreview(initial?.feature_image_url || null);

    if (previewUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [open, initial]);

  /* Handle image preview */
  useEffect(() => {
    if (!imageFile) {
      setPreview(initial?.feature_image_url || null);
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(imageFile);
    previewUrlRef.current = url;
    setPreview(url);
  }, [imageFile, initial]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (previewUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const openFilePicker = () => fileRef.current?.click();

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
    setPreview(isEdit ? initial?.feature_image_url : null);
    if (fileRef.current) fileRef.current.value = null;
    if (previewUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Title is required.");
    if (!categoryId) return setError("Category is required.");
    if (!price || isNaN(price) || Number(price) < 0)
      return setError("Valid price is required.");

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("category_id", categoryId);
    if (shortDesc.trim()) fd.append("short_description", shortDesc.trim());
    if (description.trim()) fd.append("description", description.trim());
    fd.append("price", price);
    fd.append("website_link", website_link);
    fd.append("is_published", isPublished ? "1" : "0");
    if (imageFile) fd.append("feature_image", imageFile);

    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(initial.id, fd);
      } else {
        await createProduct(fd);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.feature_image?.[0] ||
          "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // Same animation variants as BannerForm & ServiceForm
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 "
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
            variants={backdropVariants}
            aria-hidden
          />

          {/* Modal Card */}
          <motion.div
            variants={cardVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full  overflow-y-scroll  h-[99vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="productform-title"
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 dark:border-gray-800/50">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <h2
                  id="productform-title"
                  className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight"
                >
                  {isEdit ? "Edit Product" : "Create New Product"}
                </h2>

                <div className="flex items-center gap-3">
                  {/* Status Pill */}
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

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5  ">
                <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-4 ">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </div>
                  )}

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
                      placeholder="Premium Wireless Headphones"
                      className="w-full cursor-pointer px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-2xl shadow-gray-300 hover:shadow-gray-200  "
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full cursor-pointer px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-2xl shadow-gray-300 hover:shadow-gray-200  "
                    >
                      <option value="">Select category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Short Description & Price */}

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={shortDesc}
                      onChange={(e) => setShortDesc(e.target.value)}
                      placeholder="Noise-cancelling, 30hr battery..."
                      className="w-full cursor-pointer px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-2xl shadow-gray-300 hover:shadow-gray-200  "
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="299.99"
                      className="w-full cursor-pointer px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-2xl shadow-gray-300 hover:shadow-gray-200  "
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Web Site Link
                    </label>
                    <input
                      type="text"
                      value={website_link}
                      onChange={(e) => setWebsiteLink(e.target.value)}
                      placeholder="Noise-cancelling, 30hr battery..."
                      className="w-full cursor-pointer px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-2xl shadow-gray-300 hover:shadow-gray-200  "
                    />
                  </div>
                  {/* Full Description */}

                  {/* Status Toggle */}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Full Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed product features, benefits, specs..."
                    className="w-full cursor-pointer px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-2xl shadow-gray-300 hover:shadow-gray-200   resize-none"
                  />
                </div>

                {/* Image Upload - Identical to BannerForm */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Feature Image
                  </label>

                  <div
                    className="relative group cursor-pointer"
                    onClick={openFilePicker}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFile(file);
                    }}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] && handleFile(e.target.files[0])
                      }
                      className="hidden cursor-pointer"
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
                            alt="Product preview"
                            className="absolute inset-0 w-full h-full object-cover"
                          />

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openFilePicker();
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-emerald-600 shadow-xl hover:bg-gray-100/90 transition-colors"
                              title="Change image"
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
                                title="Remove image"
                              >
                                <Trash2 className="w-5 h-5" />
                                <span className="text-sm font-semibold">
                                  Remove
                                </span>
                              </button>
                            )}
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                <div className="flex items-center gap-3 py-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Status:
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-12 h-7 rounded-full transition-colors duration-200 shadow-inner ${
                        isPublished
                          ? "bg-emerald-500"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-200 ${
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
                    className="w-full cursor-pointer sm:w-1/2 lg:w-2/5 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-2xl shadow-gray-300 hover:shadow-gray-200  "
                  >
                    <Ban className="w-5 h-5" />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full cursor-pointer sm:w-1/2 lg:w-2/5 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-base font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all duration-200 disabled:opacity-70 disabled:shadow-none"
                  >
                    {saving ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 " />
                        {isEdit ? "Save Changes" : "Create Product"}
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
