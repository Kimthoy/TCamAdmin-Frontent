// src/pages/AdminSupportManagePage.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  fetchSupport,
  createSupport,
  deleteSupportPlan,
  deleteSupportOption,
  deleteSupportFeature,
} from "../api/support";
import { Plus, Trash2 } from "lucide-react";

const Label = ({ title, desc }) => (
  <div className="mb-1">
    <p className="text-sm font-semibold text-gray-700">{title}</p>
    {desc && <p className="text-xs text-gray-500">{desc}</p>}
  </div>
);

export default function AdminSupportManagePage() {
  const [section, setSection] = useState({
    section_title: "",
    section_description: "",
    iso_certification: "",
  });
  const [plans, setPlans] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD ---------------- */
  const loadSupport = async () => {
    try {
      const data = await fetchSupport();
      if (data.section) setSection(data.section);
      setPlans(data.plans || []);
      setOptions(data.options || []);
    } catch {
      Swal.fire("Error", "Failed to load support system", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupport();
  }, []);

  /* ---------------- PLAN ---------------- */
  const addPlan = () =>
    setPlans((prev) => [
      ...prev,
      {
        plan_name: "",
        badge_color: "",
        support_hours_label: "",
        support_coverage: "",
        preventive_maintenance_per_year: 0,
        features: [],
      },
    ]);

  const updatePlan = (i, field, value) => {
    setPlans((prev) =>
      prev.map((plan, idx) => (idx === i ? { ...plan, [field]: value } : plan))
    );
  };

  const removePlan = async (i, planId) => {
    if (planId) {
      try {
        await deleteSupportPlan(planId);
        Swal.fire("Deleted", "Plan removed successfully", "success");
      } catch {
        Swal.fire("Error", "Failed to delete plan", "error");
        return;
      }
    }
    setPlans((prev) => prev.filter((_, idx) => idx !== i));
  };

  /* ---------------- FEATURES ---------------- */
  const addFeature = (planIndex) => {
    setPlans((prev) =>
      prev.map((plan, idx) =>
        idx === planIndex
          ? { ...plan, features: [...plan.features, { feature_text: "" }] }
          : plan
      )
    );
  };

  const updateFeature = (planIndex, featureIndex, value) => {
    setPlans((prev) =>
      prev.map((plan, idx) =>
        idx === planIndex
          ? {
              ...plan,
              features: plan.features.map((f, fidx) =>
                fidx === featureIndex ? { ...f, feature_text: value } : f
              ),
            }
          : plan
      )
    );
  };

  const removeFeature = async (planIndex, featureIndex, featureId) => {
    if (featureId) {
      try {
        await deleteSupportFeature(featureId);
        Swal.fire("Deleted", "Feature removed successfully", "success");
      } catch {
        Swal.fire("Error", "Failed to delete feature", "error");
        return;
      }
    }

    setPlans((prev) =>
      prev.map((plan, idx) =>
        idx === planIndex
          ? {
              ...plan,
              features: plan.features.filter(
                (_, fidx) => fidx !== featureIndex
              ),
            }
          : plan
      )
    );
  };

  /* ---------------- OPTIONS ---------------- */
  const addOption = () =>
    setOptions((prev) => [
      ...prev,
      { option_title: "", option_description: "" },
    ]);

  const updateOption = (i, field, value) => {
    setOptions((prev) =>
      prev.map((opt, idx) => (idx === i ? { ...opt, [field]: value } : opt))
    );
  };

  const removeOption = async (i, optionId) => {
    if (optionId) {
      try {
        await deleteSupportOption(optionId);
        Swal.fire("Deleted", "Option removed successfully", "success");
      } catch {
        Swal.fire("Error", "Failed to delete option", "error");
        return;
      }
    }
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
  };

  /* ---------------- SAVE ---------------- */
  const saveAll = async () => {
    try {
      await createSupport({ section, plans, options });
      Swal.fire("Success", "Support system updated", "success");
      loadSupport(); // Reload fresh data
    } catch {
      Swal.fire("Error", "Validation failed", "error");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-3 max-w-9xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold">Support System Management</h1>

      {/* ================= SECTION ================= */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Section Information</h2>

        <div>
          <Label
            title="Section Title"
            desc="Main heading shown on the support page"
          />
          <input
            className="w-full text-slate-500 font-semibold border py-2 rounded-lg pl-7 border-emerald-200 shadow my-3"
            value={section.section_title}
            onChange={(e) =>
              setSection({ ...section, section_title: e.target.value })
            }
          />
        </div>

        <div>
          <Label
            title="Section Description"
            desc="Short description explaining your support services"
          />
          <textarea
            className="w-full border text-slate-500 font-semibold pl-7 py-3 rounded-lg border-emerald-300 my-3"
            rows={3}
            value={section.section_description || ""}
            onChange={(e) =>
              setSection({ ...section, section_description: e.target.value })
            }
          />
        </div>

        <div>
          <Label
            title="ISO Certification"
            desc="Optional certification or compliance text"
          />
          <input
            className="w-full border text-slate-500 font-semibold py-2 rounded-lg my-3 border-emerald-300/30 pl-7"
            value={section.iso_certification || ""}
            onChange={(e) =>
              setSection({ ...section, iso_certification: e.target.value })
            }
          />
        </div>
      </div>

      {/* ================= PLANS ================= */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Support Plans</h2>
          <button
            onClick={addPlan}
            className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-1 rounded"
          >
            <Plus size={16} /> Add Plan
          </button>
        </div>

        {plans.map((plan, pi) => (
          <div key={pi} className="bg-white p-6 rounded-xl shadow space-y-4">
            <div className="flex justify-between">
              <h3 className="font-semibold">Plan #{pi + 1}</h3>
              <button
                onClick={() => removePlan(pi, plan.id)}
                className="text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div>
              <Label title="Plan Name" desc="Example: Bronze, Silver, Gold" />
              <input
                className="w-full border py-2 text-slate-500 font-semibold rounded-lg pl-7 border-emerald-300/30"
                value={plan.plan_name}
                onChange={(e) => updatePlan(pi, "plan_name", e.target.value)}
              />
            </div>

            <div>
              <Label
                title="Support Hours"
                desc="Displayed service availability (e.g. 8x5, 24x7)"
              />
              <input
                className="w-full border py-2 pl-7 text-slate-500 font-semibold border-emerald-300/30 rounded-lg"
                value={plan.support_hours_label}
                onChange={(e) =>
                  updatePlan(pi, "support_hours_label", e.target.value)
                }
              />
            </div>

            <div>
              <Label
                title="Support Coverage"
                desc="What systems or locations are covered"
              />
              <input
                className="w-full border py-2 text-slate-500 font-semibold pl-7 rounded-lg border-emerald-300/30 my-3"
                value={plan.support_coverage}
                onChange={(e) =>
                  updatePlan(pi, "support_coverage", e.target.value)
                }
              />
            </div>

            {/* FEATURES */}
            <div>
              <Label
                title="Plan Features"
                desc="List of benefits included in this plan"
              />
              {plan.features.map((f, fi) => (
                <div key={fi} className="flex gap-2 mb-2">
                  <input
                    className="flex-1 border text-slate-500 font-semibold pl-7 py-3 rounded-lg border-emerald-300/30 shadow my-1"
                    value={f.feature_text}
                    onChange={(e) => updateFeature(pi, fi, e.target.value)}
                  />
                  <button
                    onClick={() => removeFeature(pi, fi, f.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addFeature(pi)}
                className="text-sm text-emerald-600"
              >
                + Add Feature
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= OPTIONS ================= */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Support Options</h2>
        <p className="text-sm text-gray-500">
          Extra support services shown below the plans
        </p>

        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <div className="w-1/3">
              <Label title="Option Title" desc="Short title of the option" />
              <input
                className="border py-2 text-slate-500 rounded-lg my-3 pl-7 border-emerald-300/30 w-full"
                value={opt.option_title}
                onChange={(e) =>
                  updateOption(i, "option_title", e.target.value)
                }
              />
            </div>

            <div className="flex-1">
              <Label
                title="Option Description"
                desc="Explain what this option includes"
              />
              <input
                className="border py-2 pl-7 rounded-lg border-emerald-300/30 my-3 text-slate-500 font-semibold w-full"
                value={opt.option_description}
                onChange={(e) =>
                  updateOption(i, "option_description", e.target.value)
                }
              />
            </div>

            <button
              onClick={() => removeOption(i, opt.id)}
              className="text-red-500 mt-6"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button onClick={addOption} className="text-sm text-emerald-600">
          + Add Option
        </button>
      </div>

      {/* ================= SAVE ================= */}
      <button
        onClick={saveAll}
        className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-lg"
      >
        Save Support System
      </button>
    </div>
  );
}
