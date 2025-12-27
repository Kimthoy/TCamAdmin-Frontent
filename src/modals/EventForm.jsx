// src/modals/EventForm.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Trash2,
  Camera,
  Check,
  Ban,
  Calendar,
  Users,
  Award,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createEvent, updateEvent } from "../api/event";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function EventForm({ open, onClose, onSaved, initial = null }) {
  const isEdit = !!initial?.id;

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("events");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [participants, setParticipants] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [certificates, setCertificates] = useState([{ title: "" }]);

  const [posterFile, setPosterFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  /* =======================
     INIT / RESET
  ======================= */
  useEffect(() => {
    if (!open) return;

    setError(null);
    setTitle(initial?.title || "");
    setSubtitle(initial?.subtitle || "");
    setEventDate(initial?.event_date || "");
    setLocation(initial?.location || "");
    setCategory(initial?.category || "events");
    setDescription(initial?.description || "");
    setIsPublished(initial?.is_published !== false);

    setParticipants(initial?.participants || []);
    setCertifications(initial?.certifications || []);
    setCertificates(initial?.certificates || []);

    setPosterFile(null);
    setPreview(initial?.poster_image_url || null);
  }, [open, initial]);

  /* =======================
     IMAGE PREVIEW
  ======================= */
  useEffect(() => {
    if (!posterFile) return;
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    const url = URL.createObjectURL(posterFile);
    previewUrlRef.current = url;
    setPreview(url);
  }, [posterFile]);

  /* =======================
     FILE HANDLING
  ======================= */
  const handleFile = (file) => {
    setError(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      return setError("Only JPG, PNG, WebP allowed.");
    }
    if (file.size > MAX_FILE_SIZE) {
      return setError("Image too large (max 5MB).");
    }
    setPosterFile(file);
  };

  const removeImage = () => {
    setPosterFile(null);
    setPreview(initial?.poster_image_url || null);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  /* =======================
     DYNAMIC JSON HELPERS
  ======================= */
  const addItem = (setter, item) => setter((prev) => [...prev, item]);
  const updateItem = (setter, index, key, value) =>
    setter((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  const removeItem = (setter, index) =>
    setter((prev) => prev.filter((_, i) => i !== index));

  /* =======================
     SUBMIT
  ======================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Title is required.");

    const fd = new FormData();
    fd.append("title", title);
    fd.append("subtitle", subtitle);
    fd.append("event_date", eventDate);
    fd.append("location", location);
    fd.append("category", category);
    fd.append("description", description);
    fd.append("is_published", isPublished ? "1" : "0");

    fd.append("participants", JSON.stringify(participants));
    fd.append("certifications", JSON.stringify(certifications));
    fd.append("certificates", JSON.stringify(certificates));

    if (posterFile) fd.append("poster_image", posterFile);

    setSaving(true);
    try {
      if (isEdit) {
        await updateEvent(initial.id, fd);
      } else {
        await createEvent(fd);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save event.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl 
                       max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-2xl font-extrabold flex items-center gap-3">
                <Calendar className="text-blue-600" />
                {isEdit ? "Edit Event" : "Create Event"}
              </h2>
              <button onClick={onClose}>
                <X />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 80px)" }} // header height
            >
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-xl">
                  {error}
                </div>
              )}

              {/* BASIC INFO */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Annual Tech Conference"
                    className="border px-5 py-3 w-full border-slate-300 rounded-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subtitle
                  </label>
                  <input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Innovation & Growth"
                    className="border px-5 py-3 w-full border-slate-300 rounded-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="border px-5 py-3 w-full border-slate-300 rounded-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Phnom Penh, Cambodia"
                    className="border px-5 py-3 w-full border-slate-300 rounded-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Event Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the event details..."
                  className="border px-5 py-3 w-full border-slate-300 rounded"
                />
              </div>

              {/* POSTER IMAGE */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Event Poster
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-700 
                             rounded-xl h-48 flex items-center justify-center cursor-pointer 
                             hover:border-blue-500 transition"
                >
                  {preview ? (
                    <img src={preview} className="h-full object-contain p-4" />
                  ) : (
                    <div className="text-center h-40 flex flex-col items-center justify-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400" />
                      <p className="text-sm text-emerald-500 mt-2">
                        Click to upload poster
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* PARTICIPANTS */}
              <Section
                icon={<Users />}
                title="Participants"
                items={participants}
                onAdd={() => addItem(setParticipants, { name: "", role: "" })}
                onUpdate={(i, k, v) => updateItem(setParticipants, i, k, v)}
                onRemove={(i) => removeItem(setParticipants, i)}
                fields={["name", "role"]}
              />

              {/* CERTIFICATIONS */}
              <Section
                icon={<Award />}
                title="Certifications"
                items={certifications}
                onAdd={() => addItem(setCertifications, "")}
                simple
              />

              {/* CERTIFICATES */}
              <Section
                icon={<ImageIcon />}
                title="Certificates"
                items={certificates}
                onAdd={() => addItem(setCertificates, { title: "" })}
                onUpdate={(i, k, v) => updateItem(setCertificates, i, k, v)}
                onRemove={(i) => removeItem(setCertificates, i)}
                fields={["title"]}
              />

              {/* ACTIONS */}
              <div className="flex gap-4 sticky -bottom-6 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-red-500 rounded-full px-5 py-3 flex text-slate-200 cursor-pointer gap-2"
                >
                  <Ban /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-500 rounded-full px-5 py-3 flex text-slate-200 cursor-pointer gap-2"
                >
                  <Check /> {isEdit ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =======================
   REUSABLE SECTION
======================= */
function Section({
  icon,
  title,
  items,
  onAdd,
  onUpdate,
  onRemove,
  fields,
  simple,
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="flex items-center gap-2 text-slate-600">
          {icon} {title}
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="text-blue-600 font-semibold"
        >
          + Add
        </button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          {simple ? (
            <input
              value={item}
              onChange={(e) => onUpdate?.(i, null, e.target.value)}
              className="border px-5 py-3 w-full border-slate-300 rounded-full"
            />
          ) : (
            fields.map((f) => (
              <input
                key={f}
                value={item[f] || ""}
                onChange={(e) => onUpdate(i, f, e.target.value)}
                placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                className="border px-5 py-3 w-full border-slate-300 rounded-full"
              />
            ))
          )}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-red-600"
          >
            <Trash2 />
          </button>
        </div>
      ))}
    </div>
  );
}
