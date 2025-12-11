// src/components/modals/ResetPasswordModal.jsx
import React, { useState, useEffect } from "react";
import { changePassword } from "../api/auth";
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import PropTypes from "prop-types";

export default function ResetPasswordModal({ isOpen, onClose }) {
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrent("");
      setPassword("");
      setPasswordConfirm("");
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors({});
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    if (!current || !password || !passwordConfirm) {
      setErrors({ general: "Please fill in all fields." });
      return;
    }
    if (password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters." });
      return;
    }
    if (password !== passwordConfirm) {
      setErrors({ password_confirmation: "Passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await changePassword(current, password, passwordConfirm);
      setSuccess(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      const data = err.response?.data;
      setErrors(
        data?.errors ?? {
          general:
            data?.message ?? "Failed to update password. Please try again.",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => !loading && onClose();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop - no click to close */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        aria-hidden="true"
      />

      {/* Modal - Large & Premium */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Change Password
          </h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-3 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-7">
          {/* Success */}
          {success && (
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <p className="text-lg font-medium text-emerald-800 dark:text-emerald-300">
                Password changed successfully!
              </p>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
              <AlertCircle className="w-7 h-7 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-lg font-medium text-red-800 dark:text-red-300">
                {errors.general}
              </p>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-2">
            <label
              htmlFor="current"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              Current Password
            </label>
            <input
              id="current"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full px-5 py-4 text-base rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              placeholder="Enter your current password"
              autoComplete="current-password"
              required
              disabled={loading || success}
            />
          </div>

          {/* New Password + Toggle */}
          <div className="space-y-2">
            <label
              htmlFor="new"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="new"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 pr-14 text-base rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                required
                disabled={loading || success}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-2">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password + Toggle */}
          <div className="space-y-2">
            <label
              htmlFor="confirm"
              className="block text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-5 py-4 pr-14 text-base rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="Repeat your new password"
                autoComplete="new-password"
                required
                disabled={loading || success}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-gray-500" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="text-sm text-red-600 dark:text-red-400 font-medium mt-2">
                {errors.password_confirmation}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-8">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-7 py-3.5 text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || success}
              className={`flex items-center gap-3 px-9 py-3.5 text-base font-semibold text-white rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-98 ${
                loading || success
                  ? "bg-primary-500 cursor-not-allowed"
                  : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Done
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

ResetPasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
