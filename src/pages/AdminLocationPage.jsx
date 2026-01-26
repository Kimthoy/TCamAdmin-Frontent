import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { fetchLocation, updateLocation } from "../api/location";
import { SaveAll, CopyPlus, Trash } from "lucide-react";

export default function AdminLocationPage() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    const res = await fetchLocation();
    const firstCountry = res.data.countries[0];
    setForm(firstCountry);
    setLoading(false);
  };

  const handleCountryChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleOfficeChange = (officeIndex, field, value) => {
    const newOffices = [...form.offices];
    newOffices[officeIndex][field] = value;
    setForm({ ...form, offices: newOffices });
  };

  const handleAddField = (officeIndex, type) => {
    const newOffices = [...form.offices];
    if (type === "phones")
      newOffices[officeIndex].phones.push({ phone_number: "", label: "" });
    if (type === "emails")
      newOffices[officeIndex].emails.push({ email_address: "", label: "" });
    if (type === "websites")
      newOffices[officeIndex].websites.push({ website_url: "" });
    setForm({ ...form, offices: newOffices });
  };

  const handleRemoveField = (officeIndex, type, index) => {
    const newOffices = [...form.offices];
    newOffices[officeIndex][type].splice(index, 1);
    setForm({ ...form, offices: newOffices });
  };

  const handleAddOffice = () => {
    setForm({
      ...form,
      offices: [
        ...form.offices,
        {
          office_name: "",
          address: "",
          city: "",
          province: "",
          phones: [{ phone_number: "", label: "" }],
          emails: [{ email_address: "", label: "" }],
          websites: [{ website_url: "" }],
        },
      ],
    });
  };

  const handleRemoveOffice = (index) => {
    const newOffices = [...form.offices];
    newOffices.splice(index, 1);
    setForm({ ...form, offices: newOffices });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateLocation(form.id, form);
      Swal.fire("Success!", "Updated successfully", "success");
    } catch (err) {
      Swal.fire("Error!", "Update failed", "error");
    } finally {
      setSaving(false);
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
    <div className="max-w-8xl mx-auto ">
      <div className="bg-transparent    overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold ">Location Management</h1>
          <p className=" mt-1">
            Update your country & offices directly in the form
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Country Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="country_name"
              placeholder="Country Name"
              value={form.country_name ?? ""}
              onChange={handleCountryChange}
              className="border border-gray-200 rounded-xl p-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
              required
            />

            <input
              type="text"
              name="icon_color"
              placeholder="Icon Color (ex: #4F46E5)"
              value={form.icon_color ?? ""}
              onChange={handleCountryChange}
              className="border border-gray-200 rounded-xl p-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
            />
          </div>

          {/* Offices */}
          {form.offices.map((office, idx) => (
            <div
              key={idx}
              className="bg-transparent p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Office #{idx + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleRemoveOffice(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Office Name"
                  value={office.office_name ?? ""}
                  onChange={(e) =>
                    handleOfficeChange(idx, "office_name", e.target.value)
                  }
                  className="border border-gray-200 rounded-xl p-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
                  required
                />

                <textarea
                  type="text"
                  placeholder="Address"
                  value={office.address ?? ""}
                  onChange={(e) =>
                    handleOfficeChange(idx, "address", e.target.value)
                  }
                  className="border border-gray-200 rounded-xl p-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
                  required
                />

                <input
                  type="text"
                  placeholder="City"
                  value={office.city ?? ""}
                  onChange={(e) =>
                    handleOfficeChange(idx, "city", e.target.value)
                  }
                  className="border border-gray-200 rounded-xl p-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
                />

                <input
                  type="text"
                  placeholder="Province"
                  value={office.province ?? ""}
                  onChange={(e) =>
                    handleOfficeChange(idx, "province", e.target.value)
                  }
                  className="border border-gray-200 rounded-xl p-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
                />
              </div>

              {/* Phones */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold">Phones</label>
                  <button
                    type="button"
                    onClick={() => handleAddField(idx, "phones")}
                    className="text-green-600 flex cursor-pointer gap-2 hover:text-green-800"
                  >
                    <CopyPlus /> Add Phone
                  </button>
                </div>

                {office.phones.map((p, i) => (
                  <div key={i} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Phone Number"
                      value={p.phone_number ?? ""}
                      onChange={(ev) => {
                        const newPhones = [...office.phones];
                        newPhones[i] = {
                          ...newPhones[i],
                          phone_number: ev.target.value,
                        };
                        handleOfficeChange(idx, "phones", newPhones);
                      }}
                      className="border border-gray-200 rounded-xl p-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={p.label ?? ""}
                      onChange={(ev) => {
                        const newPhones = [...office.phones];
                        newPhones[i] = {
                          ...newPhones[i],
                          label: ev.target.value,
                        };
                        handleOfficeChange(idx, "phones", newPhones);
                      }}
                      className="border border-gray-200 rounded-xl p-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx, "phones", i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash />
                    </button>
                  </div>
                ))}
              </div>

              {/* Emails */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold">Emails</label>
                  <button
                    type="button"
                    onClick={() => handleAddField(idx, "emails")}
                    className="text-green-600 flex cursor-pointer gap-2 hover:text-green-800"
                  >
                    <CopyPlus /> Add Email
                  </button>
                </div>

                {office.emails.map((e, i) => (
                  <div key={i} className="flex gap-2 mb-3">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={e.email_address ?? ""}
                      onChange={(ev) => {
                        const newEmails = [...office.emails];
                        newEmails[i] = {
                          ...newEmails[i],
                          email_address: ev.target.value,
                        };
                        handleOfficeChange(idx, "emails", newEmails);
                      }}
                      className="border border-gray-200 rounded-xl p-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={e.label ?? ""}
                      onChange={(ev) => {
                        const newEmails = [...office.emails];
                        newEmails[i] = {
                          ...newEmails[i],
                          label: ev.target.value,
                        };
                        handleOfficeChange(idx, "emails", newEmails);
                      }}
                      className="border border-gray-200 rounded-xl p-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx, "emails", i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash />
                    </button>
                  </div>
                ))}
              </div>

              {/* Websites */}
              <div className="mt-5">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold">Websites</label>
                  <button
                    type="button"
                    onClick={() => handleAddField(idx, "websites")}
                    className="text-green-600 flex cursor-pointer gap-2 hover:text-green-800"
                  >
                    <CopyPlus /> Add Website
                  </button>
                </div>

                {office.websites.map((w, i) => (
                  <div key={i} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Website URL"
                      value={w.website_url ?? ""}
                      onChange={(ev) => {
                        const newWebsites = [...office.websites];
                        newWebsites[i] = {
                          ...newWebsites[i],
                          website_url: ev.target.value,
                        };
                        handleOfficeChange(idx, "websites", newWebsites);
                      }}
                      className="border border-gray-200 rounded-xl p-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 input-inner-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveField(idx, "websites", i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center gap-4">
            <button
              type="button"
              onClick={handleAddOffice}
              className="text-green-600 flex cursor-pointer gap-2 hover:text-green-800"
            >
              <CopyPlus /> Add Office
            </button>

            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition flex items-center gap-2"
            >
              <SaveAll /> {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
