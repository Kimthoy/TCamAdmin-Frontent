import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { X, Check, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createCategory, updateCategory } from "../api/products";

const MAX_NAME_LENGTH = 191;

export default function CategoryForm({
  open,
  onClose,
  onSaved,
  initial = null,
}) {
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const firstInputRef = useRef(null);

  /* ==============================
     Sync initial data
     ============================== */
  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(initial?.name || "");
    setTimeout(() => firstInputRef.current?.focus(), 60);
  }, [open, initial]);

  if (!open) return null;

  /* ==============================
     Submit
     ============================== */
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

    const formData = new FormData();
    formData.append("name", trimmed);

    setSaving(true);
    try {
      // ✅ ALWAYS call API here
      if (isEdit) {
        await updateCategory(initial.id, formData);
      } else {
        await createCategory(formData);
      }

      // ✅ notify parent AFTER success
      if (typeof onSaved === "function") {
        await onSaved();
      }

      onClose();
    } catch (err) {
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

  /* ==============================
     Animations
     ============================== */
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

  return (
    <AnimatePresence>
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
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/10 dark:border-gray-800/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {isEdit ? "Edit Category" : "Create Category"}
              </h2>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
              {error && (
                <div className="p-3 text-sm rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={MAX_NAME_LENGTH}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500/40"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>Keep it short and descriptive</span>
                  <span>
                    {name.length}/{MAX_NAME_LENGTH}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border"
                >
                  <Ban className="w-4 h-4" /> Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-70"
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
    </AnimatePresence>
  );
}

CategoryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func,
  initial: PropTypes.object,
};
