// src/pages/SettingsPage.jsx
import React, { useEffect, useState } from "react";
import {
  fetchSettings,
  updateSetting,
  refreshSettingsCache,
} from "../api/settings";
import { Package2, Check, X } from "lucide-react";

/**
 * SettingsPage
 * - Loads settings from GET /admin/settings
 * - Allows editing site.title, site.description, notifications.contact_email
 * - Renders a "Tip" section with pretty JSON of loaded keys (like your screenshot)
 */

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Editable fields (map to backend keys)
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [rawSettings, setRawSettings] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchSettings();
        // expected: { data: { "site.title": "...", ... } }
        const data = res.data?.data ?? res.data ?? {};
        if (cancelled) return;
        setRawSettings(data);
        setSiteTitle(data["site.title"] ?? "");
        setSiteDescription(data["site.description"] ?? "");
        setContactEmail(data["notifications.contact_email"] ?? "");
      } catch (err) {
        console.error("Failed to load settings", err);
        setError(
          err?.response?.data?.message ??
            err.message ??
            "Failed to load settings"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function clearMessages() {
    setMessage(null);
    setError(null);
  }

  const validateEmail = (v) => {
    if (!v) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  };

  const handleSaveSingle = async (key, value) => {
    clearMessages();
    setSaving(true);
    try {
      await updateSetting({ key, value });
      setMessage("Saved.");
      setRawSettings((prev) => ({ ...prev, [key]: value }));
    } catch (err) {
      console.error("Save error:", err);
      setError(
        err?.response?.data?.error ??
          err?.response?.data?.message ??
          "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    clearMessages();
    if (!validateEmail(contactEmail)) {
      setError("Contact email is invalid");
      return;
    }
    setSaving(true);
    try {
      const payload = [
        { key: "site.title", value: siteTitle },
        { key: "site.description", value: siteDescription },
        { key: "notifications.contact_email", value: contactEmail },
      ];
      await updateSetting(payload);
      setMessage("All settings saved.");
      setRawSettings((prev) => ({
        ...prev,
        ...payload.reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {}),
      }));
    } catch (err) {
      console.error("Save all error:", err);
      setError(
        err?.response?.data?.error ?? err?.message ?? "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefreshCache = async () => {
    clearMessages();
    try {
      await refreshSettingsCache();
      setMessage("Cache refreshed.");
    } catch (err) {
      console.error("refresh cache error", err);
      setError("Failed to refresh cache");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 dark:text-slate-200">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-sky-600 to-indigo-600 text-white">
            <Package2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-gray-500">Manage system-wide settings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshCache}
            className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
            disabled={saving}
          >
            Refresh Cache
          </button>

          <button
            onClick={handleSaveAll}
            disabled={saving || !validateEmail(contactEmail)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:opacity-95 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Site</h2>

          <label className="block mb-3">
            <div className="text-sm font-medium mb-1">Site title</div>
            <input
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
              placeholder="TCAM Solution"
            />
          </label>

          <label className="block mb-3">
            <div className="text-sm font-medium mb-1">Site description</div>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
              rows={4}
              placeholder="Admin panel for TCAM Solution"
            />
          </label>

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => handleSaveSingle("site.title", siteTitle)}
              className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-md text-sm inline-flex items-center gap-2"
              disabled={saving}
            >
              <Check className="w-4 h-4" /> Save title
            </button>

            <button
              onClick={() => {
                setSiteTitle(rawSettings["site.title"] ?? "");
                setSiteDescription(rawSettings["site.description"] ?? "");
                clearMessages();
              }}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Notifications</h2>

          <label className="block mb-3">
            <div className="text-sm font-medium mb-1">Contact email</div>
            <input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm"
              placeholder="support@example.com"
            />
            {!validateEmail(contactEmail) && (
              <p className="text-xs text-red-600 mt-1">Invalid email address</p>
            )}
          </label>

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() =>
                handleSaveSingle("notifications.contact_email", contactEmail)
              }
              className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-md text-sm inline-flex items-center gap-2"
              disabled={saving || !validateEmail(contactEmail)}
            >
              <Check className="w-4 h-4" /> Save email
            </button>

            <button
              onClick={() => {
                setContactEmail(
                  rawSettings["notifications.contact_email"] ?? ""
                );
                clearMessages();
              }}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-md text-sm inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="mt-6 space-y-2">
        {message && (
          <div className="p-3 rounded-md bg-emerald-50 text-emerald-800">
            {message}
          </div>
        )}
        {error && (
          <div className="p-3 rounded-md bg-red-50 text-red-700">{error}</div>
        )}
      </div>

      {/* Tip + Current keys loaded (pretty JSON) */}
      <div className="mt-6">
        <div className="text-sm text-gray-600 mb-2">
          Tip: Add new settings from the backend or use the API to add arbitrary
          keys. Current keys loaded:
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-md p-4 border border-gray-100 dark:border-gray-800">
          <pre className="text-xs whitespace-pre-wrap break-words">
            {JSON.stringify(rawSettings, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
