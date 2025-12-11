// src/pages/PostCreatePage.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  Calendar,
  Tag,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { createPost, fetchPostCategories } from "../api/posts";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

function bytesToMB(n) {
  return +(n / (1024 * 1024)).toFixed(2);
}

export default function PostCreatePage() {
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const featureInputRef = useRef(null);
  const mediaInputRef = useRef(null);

  // Form state
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");

  // Files
  const [featureFile, setFeatureFile] = useState(null);
  const [featurePreview, setFeaturePreview] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  // Load categories
  useEffect(() => {
    fetchPostCategories({ per_page: 100 })
      .then((res) => {
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : res.data || [];
        setCategories(list);
      })
      .catch(() => setGlobalError("Failed to load categories."));
  }, []);

  // Focus title
  useEffect(() => {
    const t = setTimeout(() => titleRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // Feature image preview
  useEffect(() => {
    if (!featureFile) {
      setFeaturePreview(null);
      return;
    }
    const url = URL.createObjectURL(featureFile);
    setFeaturePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [featureFile]);

  // Media previews
  useEffect(() => {
    mediaPreviews.forEach(
      (url) => url.startsWith("blob:") && URL.revokeObjectURL(url)
    );
    const urls = mediaFiles.map((f) => URL.createObjectURL(f));
    setMediaPreviews(urls);
    return () =>
      urls.forEach((u) => u.startsWith("blob:") && URL.revokeObjectURL(u));
  }, [mediaFiles]);

  const validateFile = (file) => {
    if (!file) return "No file selected.";
    if (!ALLOWED_TYPES.includes(file.type))
      return "Only JPG, PNG, WebP, GIF allowed.";
    if (file.size > MAX_FILE_SIZE)
      return `File too large (${bytesToMB(file.size)} MB). Max 5MB.`;
    return null;
  };

  const handleFeatureImage = (file) => {
    setFieldErrors((prev) => ({ ...prev, feature_image: undefined }));
    const err = validateFile(file);
    if (err) {
      setFieldErrors((prev) => ({ ...prev, feature_image: err }));
      return;
    }
    setFeatureFile(file);
  };

  const handleMediaFiles = (files) => {
    const valid = [];
    Array.from(files).forEach((f) => {
      const err = validateFile(f);
      if (!err) valid.push(f);
      else setFieldErrors((prev) => ({ ...prev, images: err }));
    });
    if (valid.length) setMediaFiles((prev) => [...prev, ...valid]);
  };

  const onMediaDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files) handleMediaFiles(e.dataTransfer.files);
  };

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeMediaAt = (i) =>
    setMediaFiles((prev) => prev.filter((_, idx) => idx !== i));
  const clearAllMedia = () =>
    mediaFiles.length && confirm("Remove all media?") && setMediaFiles([]);

  const removeFeatureImage = () =>
    featureFile && confirm("Remove feature image?") && setFeatureFile(null);

  const parseServerErrors = (err) => {
    const errors = err?.response?.data?.errors;
    if (!errors)
      return {
        _global: err?.response?.data?.message || "Something went wrong.",
      };
    const mapped = {};
    Object.keys(errors).forEach((key) => {
      mapped[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
    });
    return mapped;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError("");
    setStatusMessage("");

    if (!title.trim()) {
      setFieldErrors({ title: "Title is required." });
      titleRef.current?.focus();
      return;
    }
    if (!featureFile) {
      setFieldErrors({ feature_image: "Feature image is required." });
      return;
    }

    setSaving(true);
    setStatusMessage("Creating post...");

    const fd = new FormData();
    fd.append("title", title.trim());
    if (shortDescription.trim())
      fd.append("short_description", shortDescription.trim());
    if (content.trim()) fd.append("content", content.trim());
    fd.append("is_active", isActive ? "1" : "0");
    fd.append("is_featured", isFeatured ? "1" : "0");
    if (publishedAt)
      fd.append("published_at", new Date(publishedAt).toISOString());

    selectedCategories.forEach((id) => fd.append("category_ids[]", id));
    if (featureFile) fd.append("feature_image", featureFile);
    mediaFiles.forEach((f) => fd.append("images[]", f));

    try {
      const res = await createPost(fd);
      const postId = res?.data?.data?.id || res?.data?.id;

      setStatusMessage("Post created successfully!");
      setTimeout(() => {
        navigate("/posts");
      }, 800);
    } catch (err) {
      const mapped = parseServerErrors(err);
      if (mapped._global) setGlobalError(mapped._global);
      else setFieldErrors(mapped);
      console.error("Create post error:", err);
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = title.trim() && featureFile && !saving;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Post
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add a new blog post, news, or announcement.
            </p>
          </div>
          <Link
            to="/posts"
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <X className="w-4 h-4" /> Cancel
          </Link>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Status */}
            {(globalError || statusMessage) && (
              <div
                className={`p-4 rounded-xl border ${
                  globalError
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                {globalError || (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {statusMessage}
                  </div>
                )}
              </div>
            )}

            {/* Title & Publish Date */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title..."
                  className={`w-full px-4 py-3 rounded-xl border ${
                    fieldErrors.title
                      ? "border-red-400"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 transition`}
                />
                {fieldErrors.title && (
                  <p className="mt-2 text-xs text-red-600">
                    {fieldErrors.title}
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4" /> Publish Date
                </label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Short Description
              </label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={3}
                placeholder="Brief summary for listings..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 resize-none transition"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                placeholder="Write your full post content..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 resize-none transition font-medium"
              />
              {fieldErrors.content && (
                <p className="mt-2 text-xs text-red-600">
                  {fieldErrors.content}
                </p>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <Tag className="w-4 h-4" /> Categories
              </label>
              <div className="flex flex-wrap gap-3">
                {categories.length === 0 ? (
                  <p className="text-gray-500">No categories available</p>
                ) : (
                  categories.map((cat) => {
                    const active = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          active
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {cat.name}
                        {active && (
                          <CheckCircle2 className="w-4 h-4 inline ml-2" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Feature Image */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <ImageIcon className="w-4 h-4" /> Feature Image{" "}
                <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => featureInputRef.current?.click()}
                onDrop={onMediaDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`relative block w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition ${
                  fieldErrors.feature_image
                    ? "border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                } bg-gray-50 dark:bg-gray-700/50`}
              >
                {featurePreview ? (
                  <div className="relative h-full">
                    <img
                      src={featurePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFeatureImage();
                      }}
                      className="absolute top-4 right-4 p-2 bg-black/70 text-white rounded-full hover:bg-black"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Upload className="w-12 h-12 mb-3" />
                    <p className="font-medium">Click or drop feature image</p>
                    <p className="text-sm">JPG, PNG, WebP, GIF up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={featureInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFeatureImage(e.target.files[0])
                }
              />
              {fieldErrors.feature_image && (
                <p className="mt-2 text-xs text-red-600">
                  {fieldErrors.feature_image}
                </p>
              )}
            </div>

            {/* Additional Images */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Gallery Images (Optional)
              </label>
              <div
                onClick={() => mediaInputRef.current?.click()}
                onDrop={onMediaDrop}
                onDragOver={(e) => e.preventDefault()}
                className="flex items-center gap-4 p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-emerald-500 transition bg-gray-50 dark:bg-gray-700/50"
              >
                <Upload className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    Click or drop images
                  </p>
                  <p className="text-sm text-gray-500">
                    Multiple images • Max 5MB each
                  </p>
                </div>
              </div>
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) =>
                  e.target.files && handleMediaFiles(e.target.files)
                }
              />

              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-6">
                  {mediaPreviews.map((url, i) => (
                    <div
                      key={i}
                      className="relative group rounded-lg overflow-hidden shadow-md"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${i + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeMediaAt(i)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {mediaFiles.length > 0 && (
                <div className="mt-3 text-sm">
                  <button
                    type="button"
                    onClick={clearAllMedia}
                    className="text-red-600 hover:underline"
                  >
                    Clear all
                  </button>
                  <span className="ml-3 text-gray-500">
                    • {mediaFiles.length} image(s)
                  </span>
                </div>
              )}
            </div>

            {/* Options & Submit */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded"
                  />
                  <span className="font-medium">Active</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded"
                  />
                  <span className="font-medium">Featured</span>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  to="/posts"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="relative group px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition duration-300 flex items-center gap-2 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Post
                      <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
