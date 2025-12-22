// src/components/JobsForm.jsx
import React, { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";

export default function JobForm({ initialData = {}, onSubmit, loading }) {
  const [job, setJob] = useState({
    job_title: "",
    location: "",
    hiring_number: "",
    closing_date: "",
    responsibilities: [""],
    benefits: [{ title: "", description: "" }],
    certifications: [{ name: "", required: false }],
    attributes: [""],
    qualifications: { education_level: "", experience_required: "" },
    application_info: {
      email: "",
      phone_number: "",
      telegram_link: "",
      note: "Only shortlisted candidates will be contacted.",
    },
    ...initialData,
  });

  const handleChange = (path, value, index = null) => {
    if (index !== null) {
      const arr = [...job[path]];
      arr[index] = value;
      setJob((prev) => ({ ...prev, [path]: arr }));
    } else if (path.includes(".")) {
      const [parent, child] = path.split(".");
      setJob((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setJob((prev) => ({ ...prev, [path]: value }));
    }
  };

  const handleAddField = (path, template) => {
    setJob((prev) => ({
      ...prev,
      [path]: [...prev[path], template],
    }));
  };

  const handleRemoveField = (path, index) => {
    const arr = [...job[path]];
    arr.splice(index, 1);
    setJob((prev) => ({ ...prev, [path]: arr }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(job);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Job Info */}
      <div className="border border-gray-400 p-4 rounded-lg dark:text-slate-400">
        <h2 className="font-semibold mb-6 text-xl ">Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 dark:text-slate-400">
          <div>
            <label htmlFor="">Job Title</label>
            <input
              type="text"
              placeholder="Job Title"
              value={job.job_title}
              onChange={(e) => handleChange("job_title", e.target.value)}
              className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400 mt-2"
              required
            />
          </div>
          <div>
            <label htmlFor="">Location</label>
            <input
              type="text"
              placeholder="Location"
              value={job.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400 mt-2"
            />
          </div>
          <div>
            <label htmlFor="">Hiring positions</label>
            <input
              type="number"
              placeholder="Hiring Number"
              value={job.hiring_number}
              onChange={(e) => handleChange("hiring_number", e.target.value)}
              className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400 mt-2"
            />
          </div>
          <div>
            <label htmlFor="">Deatline / Closing Date</label>
            <input
              type="date"
              placeholder="Closing Date"
              value={job.closing_date}
              onChange={(e) => handleChange("closing_date", e.target.value)}
              className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Responsibilities */}
      <DynamicField
        title="Key Responsibilities"
        items={job.responsibilities}
        onChange={(i, val) => handleChange("responsibilities", val, i)}
        onAdd={() => handleAddField("responsibilities", "")}
        onRemove={(i) => handleRemoveField("responsibilities", i)}
        placeholder="Responsibility"
        isSimple
      />

      {/* Benefits */}
      <DynamicField
        title="Benefits & Perks"
        items={job.benefits}
        onChange={(i, val) => handleChange("benefits", val, i)}
        onAdd={() => handleAddField("benefits", { title: "", description: "" })}
        onRemove={(i) => handleRemoveField("benefits", i)}
        placeholder="Benefit Title"
        extraFieldKey="description"
      />

      {/* Certifications */}
      <DynamicField
        title="Certifications"
        items={job.certifications}
        onChange={(i, val) => handleChange("certifications", val, i)}
        onAdd={() =>
          handleAddField("certifications", { name: "", required: false })
        }
        onRemove={(i) => handleRemoveField("certifications", i)}
        placeholder="Certification Name"
        checkboxKey="required"
      />

      {/* Attributes */}

      <DynamicField
        title="Personal Attributes"
        items={job.attributes}
        onChange={(i, val) => handleChange("attributes", val, i)}
        onAdd={() => handleAddField("attributes", "")}
        onRemove={(i) => handleRemoveField("attributes", i)}
        placeholder="Attribute"
        isSimple
      />

      {/* Qualifications */}
      <div className="border border-gray-400 p-4 rounded-lg dark:text-slate-400">
        <h2 className="font-semibold mb-6 text-xl ">
          Qualification & Experience
        </h2>
        <input
          type="text"
          placeholder="Education Level"
          value={job.qualifications.education_level}
          onChange={(e) =>
            handleChange("qualifications.education_level", e.target.value)
          }
          className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400 mb-2"
        />
        <input
          type="text"
          placeholder="Experience Required"
          value={job.qualifications.experience_required}
          onChange={(e) =>
            handleChange("qualifications.experience_required", e.target.value)
          }
          className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400"
        />
      </div>

      {/* Application Info */}
      <div className="border border-gray-400 p-4 rounded-lg dark:text-slate-400">
        <h2 className="font-semibold mb-6 text-xl ">Application Info</h2>
        <div className=" grid grid-cols-1 sm:grid-cols-3 gap-3 md:grid-cols-3 lg:grid-cols-3  space-y-2">
          <div>
            <label htmlFor="">Contact Email</label>
            <input
              type="email"
              placeholder="Email"
              value={job.application_info.email}
              onChange={(e) =>
                handleChange("application_info.email", e.target.value)
              }
              className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400 mt-2"
            />
          </div>
          <div>
            <label htmlFor="">Contact Phone</label>
            <input
              type="text"
              placeholder="Phone Number"
              value={job.application_info.phone_number}
              onChange={(e) =>
                handleChange("application_info.phone_number", e.target.value)
              }
              className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400 mt-2"
            />
          </div>
          <div>
            <label htmlFor="">Contact Telegram</label>
            <input
              type="text"
              placeholder="Telegram Link"
              value={job.application_info.telegram_link}
              onChange={(e) =>
                handleChange("application_info.telegram_link", e.target.value)
              }
              className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400 mt-2"
            />
          </div>
          <div>
            <label htmlFor="">Note</label>
            <textarea
              type="text"
              placeholder="Note"
              value={job.application_info.note}
              onChange={(e) =>
                handleChange("application_info.note", e.target.value)
              }
              className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400 mt-2"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-emerald-500 dark:bg-emerald-800 dark:text-slate-300 cursor-pointer   text-white rounded-lg flex items-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />} Save&Update
      </button>
    </form>
  );
}

/* DynamicField component */
function DynamicField({
  title,
  items,
  onChange,
  onAdd,
  onRemove,
  placeholder,
  extraFieldKey,
  checkboxKey,
  isSimple = false,
}) {
  return (
    <div className="border border-gray-400 p-4 rounded-lg">
      <h2 className="font-semibold mb-6 text-xl dark:text-slate-400">
        {title}
      </h2>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-2 mb-2 items-center">
          {isSimple ? (
            <input
              type="text"
              placeholder={placeholder}
              value={item}
              onChange={(e) => onChange(idx, e.target.value)}
              className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400"
            />
          ) : (
            <>
              <input
                type="text"
                placeholder={placeholder}
                value={item.title || item.name || ""}
                onChange={(e) =>
                  onChange(idx, {
                    ...item,
                    title: e.target.value,
                    name: e.target.value,
                  })
                }
                className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400"
              />
              {extraFieldKey && (
                <input
                  type="text"
                  placeholder="Description"
                  value={item[extraFieldKey] || ""}
                  onChange={(e) =>
                    onChange(idx, { ...item, [extraFieldKey]: e.target.value })
                  }
                  className="shadow px-3 py-2 rounded-lg w-full border-gray-400 text-blue-800 border dark:text-slate-400"
                />
              )}
              {checkboxKey && (
                <label className="flex items-center gap-1 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={item[checkboxKey] || false}
                    onChange={(e) =>
                      onChange(idx, {
                        ...item,
                        [checkboxKey]: e.target.checked,
                      })
                    }
                  />
                  Required
                </label>
              )}
            </>
          )}
          <button
            type="button"
            className="text-red-600 dark:text-red-800 cursor-pointer hover:underline"
            onClick={() => onRemove(idx)}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="text-emerald-600 flex items-center gap-1  dark:text-green-800 cursor-pointer hover:underline"
        onClick={onAdd}
      >
        <Plus className="w-4 h-4" /> Add {title.slice(0, -1)}
      </button>
    </div>
  );
}
