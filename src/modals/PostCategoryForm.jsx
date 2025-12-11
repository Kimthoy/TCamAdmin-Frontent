import React, { useEffect, useRef, useState } from "react";
import { X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPostCategory, updatePostCategory } from "../api/posts";

export default function PostCategoryForm({ open, onClose, onSaved, initial }) {
  const [keyVal, setKeyVal] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const firstRef = useRef(null);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;
    setError(null);
    setKeyVal(initial?.key || "");
    setName(initial?.name || "");
    setTimeout(() => firstRef.current?.focus(), 60);
  }, [open, initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!keyVal.trim() || !name.trim()) {
      setError("Both key and name are required.");
      return;
    }

    const payload = { key: keyVal.trim(), name: name.trim() };
    setSaving(true);
    try {
      if (isEdit) {
        // Accept JSON put
        await updatePostCategory(initial.id, payload);
      } else {
        await createPostCategory(payload);
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.1 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.995 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 320, damping: 28, mass: 0.6 },
    },
    exit: { opacity: 0, y: 8, scale: 0.995, transition: { duration: 0.08 } },
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
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
            variants={backdropVariants}
            aria-hidden="true"
          />

          <motion.div
            variants={cardVariants}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl "
            role="dialog"
            aria-modal="true"
            aria-labelledby="postcategoryform-title"
          >
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10 dark:border-gray-800/50">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <h2
                  id="postcategoryform-title"
                  className="text-xl font-extrabold"
                >
                  {isEdit ? "Edit Category" : "Create Category"}
                </h2>

                <button
                  onClick={onClose}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Key <span className="text-xs text-gray-400">(unique)</span>
                  </label>
                  <input
                    ref={firstRef}
                    type="text"
                    value={keyVal}
                    onChange={(e) => setKeyVal(e.target.value)}
                    placeholder="home, blog, events, career"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Blog"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition shadow-sm"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-1/2 lg:w-2/5 flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
                  >
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
