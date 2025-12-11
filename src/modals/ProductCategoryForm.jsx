// src/modals/CategoryForm.jsx
import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { X, Check, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createCategory, updateCategory } from "../api/products";

const MAX_NAME_LENGTH = 191;

export default function CategoryForm({
  open,
  onClose,
  onSaved = null,
  initial = null,
}) {
  const isEdit = !!initial?.id;
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(initial?.name || "");
    // focus input after modal opens
    setTimeout(() => firstInputRef.current?.focus(), 60);
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    if (trimmed.length > MAX_NAME_LENGTH) {
      setError(`Name must be ${MAX_NAME_LENGTH} characters or fewer.`);
      return;
    }

    // Build a minimal FormData since your backend expects form submission patterns
    const fd = new FormData();
    fd.append("name", trimmed);

    setSaving(true);
    try {
      if (typeof onSaved === "function") {
        await onSaved(fd, isEdit, initial?.id);
      } else {
        // fallback to internal API methods
        if (isEdit) {
          // some servers expect _method=PUT for FormData updates
          const data = new FormData();
          for (const [k, v] of fd.entries()) data.append(k, v);
          data.append("_method", "PUT");
          await updateCategory(initial.id, data);
        } else {
          await createCategory(fd);
        }
      }
      onClose();
    } catch (err) {
      // best-effort extraction of message
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.name?.[0] ||
        "Failed to save category.";
      setError(msg);
      console.error("Category save error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Motion variants
  const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };
  const panel = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 220, damping: 26 },
    },
    exit: { opacity: 0, y: 10 },
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
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            variants={backdrop}
            aria-hidden
          />

          <motion.div
            variants={panel}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="categoryform-title"
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 dark:border-gray-800/50">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h2
                  id="categoryform-title"
                  className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100"
                >
                  {isEdit ? "Edit Category" : "Create Category"}
                </h2>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:cursor-pointer text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition"
                  aria-label="Close form"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
                {error && (
                  <div className="rounded-lg p-3 text-sm bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={MAX_NAME_LENGTH}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition shadow-sm"
                    aria-invalid={!!error}
                    aria-describedby="name-help"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p
                      id="name-help"
                      className="text-xs text-gray-500 dark:text-gray-400"
                    >
                      Keep it short and descriptive.
                    </p>
                    <p className="text-xs text-gray-400">
                      {name.length}/{MAX_NAME_LENGTH}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-1/2 hover:cursor-pointer lg:w-2/5 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                  >
                    <Ban className="w-4 h-4" /> Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full hover:cursor-pointer sm:w-1/2 lg:w-2/5 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-base font-semibold shadow-lg hover:bg-emerald-700 transition disabled:opacity-70 disabled:shadow-none"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
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

CategoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
  initial: PropTypes.object,
};
