// src/components/DeleteConfirmModal.jsx
import React, { useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  message = "This action cannot be undone. Are you absolutely sure?",
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
  loading = false,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !loading) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, loading]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 backdrop-blur-sm p-4"
            onClick={!loading ? onClose : undefined}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="glass-card pointer-events-auto w-full max-w-sm overflow-hidden relative flex flex-col items-center text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button (Absolute Top Right) */}
              <button
                onClick={onClose}
                disabled={loading}
                className="absolute top-3 right-3 p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Main Content */}
              <div className="p-8 pb-6 flex flex-col items-center w-full">
                {/* 1. MODERN ICON */}
                <div className="relative mb-6 group">
                  {/* Outer Glow */}
                  <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/10 rounded-full blur-xl transform group-hover:scale-110 transition-transform duration-500" />

                  {/* Icon Circle */}
                  <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 ring-4 ring-red-50 dark:ring-red-900/10">
                    <Trash2
                      className="w-10 h-10 text-red-500 dark:text-red-400 drop-shadow-sm"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {/* 2. TITLE (Under Icon) */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {title}
                </h3>

                {/* Message */}
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[90%]">
                  {message}
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="w-full p-6 pt-2 grid grid-cols-2 gap-3">
                {/* CANCEL BUTTON: No change needed, it maintains its light/border style. */}
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {cancelText}
                </button>

                {/* YES, DELETE BUTTON: Updated to have a red background and white text, matching the style. */}
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  // **UPDATED CLASSES:** Added red background, white text, and hover styles.
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400/50 disabled:text-gray-200 transition-colors shadow-lg shadow-red-500/20"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>{confirmText}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
