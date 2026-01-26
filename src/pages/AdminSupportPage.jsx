import React, { useEffect, useState } from "react";
import {
  fetchSupport,
  createSupport,
  deleteSupportPlan,
  deleteSupportFeature,
  deleteSupportOption,
} from "../api/support";
import { Plus, SaveAll, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminSupportPage() {
  const [section, setSection] = useState({
    section_title: "",
    section_description: "",
    iso_certification: "",
    is_active: true,
  });

  const [planList, setPlanList] = useState([]);
  const [optionList, setOptionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(null);
  useEffect(() => {
    loadSupport();
  }, []);

  const loadSupport = async () => {
    try {
      const data = await fetchSupport();
      setSection({
        section_title: data.section.section_title || "",
        section_description: data.section.section_description || "",
        iso_certification: data.section.iso_certification || "",
        is_active: data.section.is_active ?? true,
      });

      setPlanList(
        (data.plans || []).map((p) => ({
          id: p.id || null,
          plan_name: p.plan_name || "",
          support_hours_label: p.support_hours_label || "",
          support_coverage: p.support_coverage || "",
          features: (p.features || []).map((f) => ({
            id: f.id || null,
            feature_text: f.feature_text || "",
            is_highlighted: f.is_highlighted || false,
          })),
        })),
      );

      setOptionList(
        (data.options || []).map((o) => ({
          id: o.id || null,
          option_title: o.option_title || "",
          option_description: o.option_description || "",
        })),
      );
      setForm(data);
    } catch (err) {
      console.error("Fetch support failed", err);
    }
    setLoading(false);
  };

  const addPlan = () => {
    setPlanList((prev) => {
      const updated = [
        ...prev,
        {
          plan_name: "",
          support_hours_label: "",
          support_coverage: "",
          features: [],
        },
      ];

      const newIndex = updated.length; // this is 1-based index

      Swal.fire({
        icon: "success",
        title: `Plan added! (Plan #${newIndex})`,
        timer: 1400,
        showConfirmButton: false,
      });

      return updated;
    });
  };

  const removePlan = async (idx, plan) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This plan will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    if (plan.id) await deleteSupportPlan(plan.id);

    setPlanList((prev) => prev.filter((_, i) => i !== idx));

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Plan removed successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const addFeature = (planIdx) => {
    setPlanList((prev) => {
      const copy = [...prev];
      copy[planIdx].features.push({ feature_text: "" });
      return copy;
    });

    Swal.fire({
      icon: "success",
      title: "Feature added!",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  const removeFeature = async (planIdx, featIdx, feature) => {
    const result = await Swal.fire({
      title: "Delete feature?",
      text: "This feature will be removed from the plan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    if (feature.id) await deleteSupportFeature(feature.id);

    const copy = [...planList];
    copy[planIdx].features.splice(featIdx, 1);
    setPlanList(copy);

    Swal.fire({
      icon: "success",
      title: "Removed!",
      text: "Feature deleted successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  };
  const addOption = () => {
    setOptionList((prev) => [
      ...prev,
      { option_title: "", option_description: "" },
    ]);

    Swal.fire({
      icon: "success",
      title: "Added!",
      text: "New option has been added.",
      timer: 1400,
      showConfirmButton: false,
    });
  };
  const removeOption = async (idx, option) => {
    const result = await Swal.fire({
      title: "Delete option?",
      text: "This option will be removed permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    if (option.id) await deleteSupportOption(option.id);

    setOptionList((prev) => prev.filter((_, i) => i !== idx));

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Option removed successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const payload = {
        section,
        plans: planList.map((p) => ({
          ...p,
          features: (p.features || []).filter(
            (f) => f.feature_text && f.feature_text.trim() !== "",
          ),
        })),
        options: optionList,
      };

      await createSupport(payload);

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Support updated successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Save failed", err);

      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: "Please check the console for details.",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };
  if (loading || !form) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }
  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Support System</h1>

      {/* SECTION */}
      <div className="border border-slate-300 p-4 rounded-xl mb-6">
        <h2 className="font-semibold mb-3">Section</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            value={section.section_title}
            onChange={(e) =>
              setSection((s) => ({ ...s, section_title: e.target.value }))
            }
            placeholder="Section Title"
            className="border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
          />

          <input
            type="text"
            value={section.iso_certification}
            onChange={(e) =>
              setSection((s) => ({ ...s, iso_certification: e.target.value }))
            }
            placeholder="ISO Certification"
            className="border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
          />
        </div>

        <textarea
          value={section.section_description}
          onChange={(e) =>
            setSection((s) => ({
              ...s,
              section_description: e.target.value,
            }))
          }
          placeholder="Section Description"
          className="border border-slate-300 rounded-xl px-4 py-2 mt-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
        />

        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={section.is_active}
            onChange={(e) =>
              setSection((s) => ({ ...s, is_active: e.target.checked }))
            }
          />
          Active
        </label>
      </div>

      {/* PLANS */}
      <div className="border border-slate-300 p-4 rounded-xl mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Plans</h2>
          <button
            onClick={addPlan}
            className="flex items-center cursor-pointer gap-2 border border-slate-300 px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
          >
            <Plus size={16} /> Add Plan
          </button>
        </div>

        {planList.map((plan, i) => (
          <div key={i} className="border border-slate-300 p-4 rounded-xl mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Plan #{i + 1}</span>
              <button
                onClick={() => removePlan(i, plan)}
                className="text-red-600 cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                value={plan.plan_name}
                onChange={(e) => {
                  const newList = [...planList];
                  newList[i].plan_name = e.target.value;
                  setPlanList(newList);
                }}
                placeholder="Plan Name"
                className="border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
              />

              <input
                value={plan.support_hours_label}
                onChange={(e) => {
                  const newList = [...planList];
                  newList[i].support_hours_label = e.target.value;
                  setPlanList(newList);
                }}
                placeholder="Support Hours Label"
                className="border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
              />
            </div>

            <input
              value={plan.support_coverage}
              onChange={(e) => {
                const newList = [...planList];
                newList[i].support_coverage = e.target.value;
                setPlanList(newList);
              }}
              placeholder="Support Coverage"
              className="border border-slate-300 rounded-xl px-4 py-2 mt-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
            />

            {/* FEATURES */}
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium mb-2">Features</h3>
                <button
                  onClick={() => addFeature(i)}
                  className="flex items-center cursor-pointer gap-2 border border-slate-300 px-4 m-3 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow "
                >
                  <Plus size={16} /> Add Feature
                </button>
              </div>

              {plan.features.map((f, fi) => (
                <div key={fi} className="flex gap-2 mb-2">
                  <input
                    value={f.feature_text}
                    onChange={(e) => {
                      const newList = [...planList];
                      newList[i].features[fi].feature_text = e.target.value;
                      setPlanList(newList);
                    }}
                    placeholder="Feature text"
                    className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
                  />
                  <button
                    onClick={() => removeFeature(i, fi, f)}
                    className="text-red-600 cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* OPTIONS */}
      <div className="border border-slate-300 p-4 rounded-xl mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold">Options</h2>
          <button
            onClick={addOption}
            className="flex items-center cursor-pointer gap-2 border border-slate-300 px-4 py-2 rounded-full"
          >
            <Plus size={16} /> Add Option
          </button>
        </div>

        {optionList.map((opt, i) => (
          <div key={i} className="flex gap-2 mb-3">
            <input
              value={opt.option_title}
              onChange={(e) => {
                const newList = [...optionList];
                newList[i].option_title = e.target.value;
                setOptionList(newList);
              }}
              placeholder="Option Title"
              className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
            />

            <input
              value={opt.option_description}
              onChange={(e) => {
                const newList = [...optionList];
                newList[i].option_description = e.target.value;
                setOptionList(newList);
              }}
              placeholder="Option Description"
              className="flex-1 border border-slate-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
            />

            <button
              onClick={() => removeOption(i, opt)}
              className="text-red-600 cursor-pointer"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-blue-600 flex gap-2 cursor-pointer text-white px-6 py-2 rounded-full"
      >
        <SaveAll />
        {loading ? "Saving..." : "Save all  "}
      </button>
    </div>
  );
}
