// src/modals/ServiceCategoryForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Check, Ban, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createServiceCategory, updateServiceCategory } from "../api/services";

export default function ServiceCategoryForm({
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

  /* Reset form when modal opens */
  useEffect(() => {
    if (!open) return;

    setError(null);
    setName(initial?.name || "");

    setTimeout(() => firstInputRef.current?.focus(), 100);
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Category name is required.");

    // Using FormData to match the expected input format of the updateServiceCategory API function
    const fd = new FormData();
    fd.append("name", name.trim());

    setSaving(true);
    try {
      if (isEdit) {
        await updateServiceCategory(initial.id, fd);
      } else {
        await createServiceCategory(fd);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.errors?.name?.[0] ||
          "Failed to save category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* Motion variants */
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 220, damping: 26 },
    },
    exit: { opacity: 0, y: 10, scale: 0.98 },
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            variants={backdropVariants}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            variants={modalVariants}
            className="relative w-full max-w-md"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 dark:border-gray-800/50">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {isEdit ? "Edit Category" : "New Category"}
                </h2>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-6"
                spellCheck={false}
              >
                {error && (
                  <div className="p-4 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 hover:cursor-pointer rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <Ban className="w-5 h-5" /> Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || !name.trim()}
                    className="flex-1 px-6 py-3 hover:cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 transition"
                  >
                    {saving ? (
                      "Saving..."
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
