// src/pages/AdminSupportListPage.jsx
import React, { useEffect, useState } from "react";
import { Edit, Layers } from "lucide-react";
import SupportForm from "../modals/SupportForm";
import { fetchSupport } from "../api/support";

export default function AdminSupportListPage() {
  const [data, setData] = useState(null); // full support system { section, plans, options }
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  // ---------------- FETCH DATA ----------------
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchSupport();
      setData(res);
    } catch (e) {
      console.error("Failed to load support system", e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------- EDIT HANDLER ----------------
  const handleEdit = () => {
    if (!data?.section) return;
    setEditing({
      ...data.section,
      plans: data.plans || [],
      options: data.options || [],
    });
    setOpenForm(true);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Support System</h1>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left">Section</th>
              <th className="px-6 py-3 text-left">Plans</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-20">
                  Loading...
                </td>
              </tr>
            ) : !data?.section ? (
              <tr>
                <td colSpan={4} className="text-center py-20">
                  <Layers className="mx-auto w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-gray-500">No support system configured</p>
                </td>
              </tr>
            ) : (
              <tr>
                <td className="px-6 py-4">
                  <div className="font-semibold">
                    {data.section.section_title}
                  </div>
                  <div className="text-sm text-gray-500">
                    {data.section.section_description}
                  </div>
                </td>
                <td className="px-6 py-4">{data.plans?.length || 0} Plans</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      data.section.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {data.section.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    title="Edit Planning"
                    onClick={handleEdit}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer hover:bg-blue-100 p-3 rounded-xl transition-all"
                  >
                    <Edit size={16} />
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <SupportForm
        open={openForm}
        initial={editing || null} // pass the editing object
        onClose={() => setOpenForm(false)}
        onSaved={() => {
          setOpenForm(false);
          loadData();
        }}
      />
    </div>
  );
}
