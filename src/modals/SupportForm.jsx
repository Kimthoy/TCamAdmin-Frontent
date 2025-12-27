// src/modals/SupportForm.jsx
import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { X, Plus, Trash2 } from "lucide-react";
import {
  createSupport,
  updateSupport,
  deleteSupportPlan,
  deleteSupportFeature,
  deleteSupportOption,
} from "../api/support";

export default function SupportForm({ open, onClose, initial, onSaved }) {
  const [section, setSection] = useState({
    section_title: "",
    section_description: "",
    is_active: true,
    id: null,
  });
  const [planList, setPlanList] = useState([]);
  const [optionList, setOptionList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setSection({
        section_title: initial.section_title || "",
        section_description: initial.section_description || "",
        is_active: initial.is_active ?? true,
        id: initial.id || null,
      });
      const normalizedPlans = (initial.plans || []).map((p) => ({
        id: p.id || null,
        plan_name: p.plan_name || "",
        support_hours_label: p.support_hours_label || "",
        features: Array.isArray(p.features)
          ? p.features.map((f) => ({
              id: f.id || null,
              feature_text: f.feature_text || "",
            }))
          : [],
      }));
      setPlanList(normalizedPlans);

      const normalizedOptions = (initial.options || []).map((o) => ({
        id: o.id || null,
        option_title: o.option_title || "",
        option_description: o.option_description || "",
      }));
      setOptionList(normalizedOptions);
    } else {
      setSection({
        section_title: "",
        section_description: "",
        is_active: true,
        id: null,
      });
      setPlanList([]);
      setOptionList([]);
    }
  }, [initial]);

  const handleSectionChange = (key, value) =>
    setSection((s) => ({ ...s, [key]: value }));

  const addPlan = () =>
    setPlanList((prev) => [
      ...prev,
      { plan_name: "", support_hours_label: "", features: [] },
    ]);
  const removePlan = async (idx, plan) => {
    if (plan.id) await deleteSupportPlan(plan.id);
    setPlanList((prev) => prev.filter((_, i) => i !== idx));
  };
  const updatePlan = (idx, key, value) => {
    setPlanList((prev) => {
      const copy = [...prev];
      copy[idx][key] = value;
      return copy;
    });
  };

  const addFeature = (planIdx) => {
    setPlanList((prev) => {
      const copy = [...prev];
      copy[planIdx].features.push({ feature_text: "" });
      return copy;
    });
  };
  const removeFeature = async (planIdx, featIdx, feature) => {
    if (feature.id) await deleteSupportFeature(feature.id);
    setPlanList((prev) => {
      const copy = [...prev];
      copy[planIdx].features.splice(featIdx, 1);
      return copy;
    });
  };
  const updateFeature = (planIdx, featIdx, value) => {
    setPlanList((prev) => {
      const copy = [...prev];
      copy[planIdx].features[featIdx].feature_text = value;
      return copy;
    });
  };

  const addOption = () =>
    setOptionList((prev) => [
      ...prev,
      { option_title: "", option_description: "" },
    ]);
  const removeOption = async (idx, option) => {
    if (option.id) await deleteSupportOption(option.id);
    setOptionList((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateOption = (idx, key, value) => {
    setOptionList((prev) => {
      const copy = [...prev];
      copy[idx][key] = value;
      return copy;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...section, plans: planList, options: optionList };
      if (section.id) await updateSupport(section.id, payload);
      else await createSupport(payload);
      onSaved();
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <Dialog.Panel className="bg-white  rounded-2xl shadow-xl w-full max-w-4xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between  items-center border-b pb-2">
          <h2 className="text-2xl font-semibold">
            {section.id ? "Edit Support System" : "New Support System"}
          </h2>
          <button
            onClick={onClose}
            title="Close form"
            className="text-red-600 hover:text-red-800 cursor-pointer hover:bg-red-100 p-3 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section */}
        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Section Title</label>
            <input
              type="text"
              value={section.section_title}
              onChange={(e) =>
                handleSectionChange("section_title", e.target.value)
              }
              className="w-full focus:bg-slate-200 border border-gray-300 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              value={section.section_description}
              onChange={(e) =>
                handleSectionChange("section_description", e.target.value)
              }
              className="w-full  focus:bg-slate-200 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={section.is_active}
              onChange={(e) =>
                handleSectionChange("is_active", e.target.checked)
              }
              className="accent-slate-300"
            />
            Active
          </label>
        </div>

        {/* Plans */}
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Plans</h3>
            <button
              onClick={addPlan}
              className="flex border px-4 py-2 cursor-pointer rounded-full items-center gap-1 text-slate-600 font-medium hover:text-emerald-500"
            >
              <Plus size={16} /> Add Plan
            </button>
          </div>
          {planList.map((plan, i) => {
            // Card background based on plan
            let cardBg =
              plan.plan_name === "Bronze"
                ? "bg-gradient-to-br from-orange-50 to-white"
                : plan.plan_name === "Silver"
                ? "bg-gradient-to-br from-gray-100 to-white"
                : plan.plan_name === "Gold"
                ? "bg-gradient-to-br from-yellow-50 to-white"
                : "bg-gradient-to-br from-emerald-100 to-white";

            // Badge gradient
            let badgeBg =
              plan.plan_name === "Bronze"
                ? "bg-gradient-to-r from-orange-400 to-orange-100"
                : plan.plan_name === "Silver"
                ? "bg-gradient-to-r from-gray-400 to-gray-100"
                : plan.plan_name === "Gold"
                ? "bg-gradient-to-r from-yellow-400 to-yellow-100"
                : "bg-gradient-to-r from-emerald-400 to-emerald-200";
            let textColor =
              plan.plan_name === "Bronze"
                ? "text-orange-800"
                : plan.plan_name === "Silver"
                ? "text-gray-800"
                : plan.plan_name === "Gold"
                ? "text-yellow-800"
                : "text-emerald-600";
            return (
              <div
                key={i}
                className={`border border-gray-200 rounded-xl p-4 space-y-2 shadow-lg ${cardBg}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`font-medium ${textColor} text-lg px-3 py-1 rounded-lg ${badgeBg}`}
                  >
                    {plan.plan_name || "New Plan"}
                  </span>

                  <button
                    onClick={() => removePlan(i, plan)}
                    title="Delete Plan"
                    className="text-red-600 hover:text-red-800 cursor-pointer hover:bg-red-100 p-3 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Plan Name"
                    value={plan.plan_name}
                    onChange={(e) => updatePlan(i, "plan_name", e.target.value)}
                    className="w-full font-semibold focus:bg-slate-200 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                  <input
                    type="text"
                    placeholder="Support Hours"
                    value={plan.support_hours_label}
                    onChange={(e) =>
                      updatePlan(i, "support_hours_label", e.target.value)
                    }
                    className="w-full font-semibold focus:bg-slate-200 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
                  />
                </div>

                {/* Features */}
                <div className="space-y-2 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Features</span>
                    <button
                      onClick={() => addFeature(i)}
                      title="Add new Feature"
                      className="text-slate-500 flex items-center gap-1 font-medium hover:text-emerald-300 cursor-pointer hover:bg-emerald-100 border px-3 py-2 rounded-full transition-all"
                    >
                      <Plus size={20} /> Add Feature
                    </button>
                  </div>

                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Feature"
                        value={f.feature_text}
                        onChange={(e) => updateFeature(i, fi, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-full px-5 py-3 font-semibold focus:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                      <button
                        title="Delete Feature"
                        onClick={() => removeFeature(i, fi, f)}
                        className="text-red-600 hover:text-red-800 cursor-pointer hover:bg-red-100 p-3 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Options */}
        <div className="space-y-3 mt-12">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Options</h3>
            <button
              onClick={addOption}
              title="Add new Options"
              className="text-slate-500 flex items-center gap-1 font-medium hover:text-emerald-300 cursor-pointer hover:bg-emerald-100 border px-3 py-2 rounded-full transition-all"
            >
              <Plus size={16} /> Add Option
            </button>
          </div>
          {optionList.map((opt, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row gap-3 items-center"
            >
              <input
                type="text"
                placeholder="Title"
                value={opt.option_title}
                onChange={(e) =>
                  updateOption(i, "option_title", e.target.value)
                }
                className="flex-1 font-semibold border focus:bg-slate-200 border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <input
                type="text"
                placeholder="Description"
                value={opt.option_description}
                onChange={(e) =>
                  updateOption(i, "option_description", e.target.value)
                }
                className="flex-1 border font-semibold focus:bg-slate-200 border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
              <button
                onClick={() => removeOption(i, opt)}
                title="Delete options"
                className="text-red-600 hover:text-red-800 cursor-pointer hover:bg-red-100 p-3 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Save */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={loading}
            title="Save Planning"
            className="px-6 py-2 bg-slate-300 text-white rounded-full hover:bg-slate-300 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
