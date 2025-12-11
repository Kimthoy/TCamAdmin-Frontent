// src/modals/CustomerCategoryForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Check, Ban, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createCustomerCategory,
  updateCustomerCategory,
} from "../api/customers";

export default function CustomerCategoryForm({
  open,
  onClose,
  onSaved,
  initial = null,
}) {
  const isEdit = !!initial?.id;

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const firstInputRef = useRef(null);

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return;

    setError(null);
    setName(initial?.name || "");

    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    const fd = new FormData();
    fd.append("name", name.trim());

    setSaving(true);
    try {
      if (isEdit) {
        await updateCustomerCategory(initial.id, fd);
      } else {
        await createCustomerCategory(fd);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.name?.[0] ||
          "Failed to save category."
      );
    } finally {
      setSaving(false);
    }
  };

  // Same animation variants as all your other forms
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
            className="relative w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customercategory-title"
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 dark:border-gray-800/50">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <h2
                  id="customercategory-title"
                  className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight flex items-center gap-3"
                >
                  <Tag className="w-6 h-6 text-emerald-600" />
                  {isEdit ? "Edit Customer Category" : "New Customer Category"}
                </h2>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                {error && (
                  <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Bank, E-commerce, Startup, Enterprise"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition shadow-sm"
                  />
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
                    disabled={saving || !name.trim()}
                    className="w-full sm:w-1/2 lg:w-2/5 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-base font-semibold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition-all duration-200 disabled:opacity-70 disabled:shadow-none"
                  >
                    {saving ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {isEdit ? "Save Changes" : "Create"}
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
