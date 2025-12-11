// src/pages/JobCreatePage.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  MapPin,
  Briefcase,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { createJob } from "../api/jobs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function JobCreatePage() {
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const imageInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [benefits, setBenefits] = useState("");
  const [applyEmail, setApplyEmail] = useState("");
  const [applyLink, setApplyLink] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [featureFile, setFeatureFile] = useState(null);
  const [featurePreview, setFeaturePreview] = useState(null);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!featureFile) {
      setFeaturePreview(null);
      return;
    }
    const url = URL.createObjectURL(featureFile);
    setFeaturePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [featureFile]);

  const handleImage = (file) => {
    setFieldErrors((prev) => ({ ...prev, feature_image: undefined }));
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        feature_image: "Invalid file type.",
      }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFieldErrors((prev) => ({
        ...prev,
        feature_image: "Image too large (max 5MB).",
      }));
      return;
    }
    setFeatureFile(file);
  };

  const removeImage = () => {
    if (featureFile && confirm("Remove feature image?")) {
      setFeatureFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError("");
    setStatusMessage("");

    if (!title.trim()) {
      setFieldErrors({ title: "Job title is required." });
      titleRef.current?.focus();
      return;
    }
    if (!featureFile) {
      setFieldErrors({ feature_image: "Feature image is required." });
      return;
    }

    setSaving(true);
    setStatusMessage("Creating job...");

    const fd = new FormData();
    fd.append("title", title.trim());
    fd.append("company", company.trim());
    fd.append("location", location.trim() || "Remote");
    fd.append("salary", salary.trim() || "Competitive");
    fd.append("job_type", jobType);
    fd.append("description", description.trim());
    fd.append("requirements", requirements.trim());
    fd.append("benefits", benefits.trim());
    fd.append("apply_email", applyEmail.trim());
    fd.append("apply_link", applyLink.trim());
    if (deadline) fd.append("deadline", deadline);
    fd.append("is_active", isActive ? "1" : "0");
    fd.append("feature_image", featureFile);

    try {
      await createJob(fd);
      setStatusMessage("Job created!");
      setTimeout(() => navigate("/jobs"), 1000);
    } catch (err) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        const mapped = {};
        Object.keys(errors).forEach((k) => {
          mapped[k] = Array.isArray(errors[k]) ? errors[k][0] : errors[k];
        });
        setFieldErrors(mapped);
      } else {
        setGlobalError(err?.response?.data?.message || "Failed to create job.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Job Opening
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add a new career opportunity
            </p>
          </div>
          <Link
            to="/jobs"
            className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <X className="w-4 h-4" /> Cancel
          </Link>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
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
                    <Loader2 className="w-5 h-5 animate-spin" /> {statusMessage}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="TCAM Solutions"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4" /> Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Dhaka, Bangladesh"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4" /> Salary Range
                </label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="BDT 80,000 - 120,000"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Briefcase className="w-4 h-4" /> Job Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 transition"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                  <option>Remote</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Job Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                placeholder="Write a detailed job description..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 resize-none transition font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Requirements
                </label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={5}
                  placeholder="List required skills and qualifications..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 resize-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Benefits
                </label>
                <textarea
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  rows={5}
                  placeholder="What we offer..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 resize-none transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Apply Email
                </label>
                <input
                  type="email"
                  value={applyEmail}
                  onChange={(e) => setApplyEmail(e.target.value)}
                  placeholder="careers@tcam.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Apply Link
                </label>
                <input
                  type="url"
                  value={applyLink}
                  onChange={(e) => setApplyLink(e.target.value)}
                  placeholder="https://tcam.com/careers"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4" /> Application Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Active (Accepting applications)
                  </span>
                </label>
              </div>
            </div>

            {/* Feature Image */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                <ImageIcon className="w-4 h-4" /> Feature Image{" "}
                <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => imageInputRef.current?.click()}
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
                        removeImage();
                      }}
                      className="absolute top-4 right-4 p-2 bg-black/70 text-white rounded-full hover:bg-black"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Upload className="w-12 h-12 mb-3" />
                    <p className="font-medium">Click to upload job banner</p>
                    <p className="text-sm">JPG, PNG, WebP, GIF up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleImage(e.target.files[0])
                }
              />
              {fieldErrors.feature_image && (
                <p className="mt-2 text-xs text-red-600">
                  {fieldErrors.feature_image}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <div></div>
              <div className="flex items-center gap-4">
                <Link
                  to="/jobs"
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="relative group px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition duration-300 flex items-center gap-2 overflow-hidden disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Job
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
