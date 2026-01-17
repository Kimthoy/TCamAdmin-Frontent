import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  fetchLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  deleteOffice,
  deleteEmail,
  deletePhone,
  deleteWebsite,
} from "../api/location";
import {
  CopyX,
  Trash,
  CopyPlus,
  Building,
  PenBoxIcon,
  SaveAll,
} from "lucide-react";

export default function AdminLocationPage() {
  const [countries, setCountries] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    country_name: "",
    icon_color: "",
    display_order: 0,
    is_active: true,
    offices: [
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
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    const res = await fetchLocation();
    setCountries(res.data.countries);
  };

  const resetForm = () => {
    setForm({
      country_name: "",
      icon_color: "",
      display_order: 0,
      is_active: true,
      offices: [
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
    setEditingId(null);
  };

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  // Country input change
  const handleCountryChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Office input change
  const handleOfficeChange = (officeIndex, field, value) => {
    const newOffices = [...form.offices];
    newOffices[officeIndex][field] = value;
    setForm({ ...form, offices: newOffices });
  };

  // Add/remove dynamic fields
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

  // Add/remove offices
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

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateLocation(editingId, form);
        Swal.fire(
          "Updated!",
          "Country and offices updated successfully.",
          "success"
        );
      } else {
        await createLocation({ countries: [form] });
        Swal.fire(
          "Created!",
          "Country and offices added successfully.",
          "success"
        );
      }
      closeModal();
      loadLocations();
    } catch (err) {
      Swal.fire(
        "Error!",
        err.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };
  // Edit
  const handleEdit = (country) => {
    setForm({
      country_name: country.country_name || "",
      icon_color: country.icon_color || "",
      display_order: country.display_order || 0,
      is_active: country.is_active ?? true,
      offices: country.offices.map((office) => ({
        id: office.id,
        office_name: office.office_name || "",
        address: office.address || "",
        city: office.city || "",
        province: office.province || "",
        phones:
          office.phones.length > 0
            ? office.phones.map((p) => ({
                id: p.id,
                phone_number: p.phone_number || "",
                label: p.label || "",
              }))
            : [{ phone_number: "", label: "" }],
        emails:
          office.emails.length > 0
            ? office.emails.map((e) => ({
                id: e.id,
                email_address: e.email_address || "",
                label: e.label || "",
              }))
            : [{ email_address: "", label: "" }],
        websites:
          office.websites.length > 0
            ? office.websites.map((w) => ({
                id: w.id,
                website_url: w.website_url || "",
              }))
            : [{ website_url: "" }],
      })),
    });

    setEditingId(country.id);
    openModal();
  };

  // Delete
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the country and all related offices!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        console.log("Deleting id:", id); // Debug
        await deleteLocation(id);
        Swal.fire("Deleted!", "Country deleted successfully.", "success");
        loadLocations();
      } catch (err) {
        Swal.fire(
          "Error!",
          err.response?.data?.message || "Failed to delete",
          "error"
        );
        console.error(err.response || err);
      }
    }
  };
  const handleDeleteOffice = async (officeId, countryId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the office!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await deleteOffice(officeId);
        Swal.fire("Deleted!", "Office deleted successfully.", "success");
        // Reload countries to reflect change
        loadLocations();
      } catch (err) {
        Swal.fire(
          "Error!",
          err.response?.data?.message || "Failed to delete office",
          "error"
        );
        console.error(err.response || err);
      }
    }
  };

  const handleDeleteEmail = async (emailId, officeIndex, emailIndex) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the email!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        if (emailId) {
          await deleteEmail(emailId);
        }
        // Remove from state
        const newOffices = [...form.offices];
        newOffices[officeIndex].emails.splice(emailIndex, 1);
        setForm({ ...form, offices: newOffices });

        Swal.fire("Deleted!", "Email deleted successfully.", "success");
      } catch (err) {
        Swal.fire(
          "Error!",
          err.response?.data?.message || "Failed to delete email",
          "error"
        );
        console.error(err.response || err);
      }
    }
  };

  const handleDeletePhone = async (phoneId, officeIndex, phoneIndex) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the phone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        if (phoneId) await deletePhone(phoneId);
        const newOffices = [...form.offices];
        newOffices[officeIndex].phones.splice(phoneIndex, 1);
        setForm({ ...form, offices: newOffices });
        Swal.fire("Deleted!", "Phone deleted successfully.", "success");
      } catch (err) {
        Swal.fire(
          "Error!",
          err.response?.data?.message || "Failed to delete phone",
          "error"
        );
        console.error(err.response || err);
      }
    }
  };

  const handleDeleteWebsite = async (websiteId, officeIndex, websiteIndex) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the website!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        if (websiteId) await deleteWebsite(websiteId);
        const newOffices = [...form.offices];
        newOffices[officeIndex].websites.splice(websiteIndex, 1);
        setForm({ ...form, offices: newOffices });
        Swal.fire("Deleted!", "Website deleted successfully.", "success");
      } catch (err) {
        Swal.fire(
          "Error!",
          err.response?.data?.message || "Failed to delete website",
          "error"
        );
        console.error(err.response || err);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Countries & Offices</h1>

      <button
        onClick={openModal}
        className="bg-blue-600 flex  gap-2 rounded-xl    text-white px-4 py-2 rounded-full-full mb-4 hover:bg-blue-200 cursor-pointer hover:text-blue-500 transition-all"
      >
        <CopyPlus /> Add
      </button>

      {/* Country Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex justify-center  items-center  z-50">
          <div className="bg-white rounded-2xl shadow w-full max-w-6xl p-6 overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold ">
                  {editingId ? "Edit Country" : "Add Country"}
                </h2>
                <button
                  type="button"
                  onClick={handleAddOffice}
                  className="text-blue-500 gap-2 border px-4 py-2 rounded-xl transition-all cursor-pointer hover:bg-blue-200 hover:text-blue-500 flex "
                >
                  <CopyPlus /> Add Office
                </button>
              </div>

              <button
                onClick={closeModal}
                title="Close"
                className="text-gray-500 hover:text-red-800 font-bold cursor-pointer hover:underline"
              >
                <CopyX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="country_name"
                placeholder="Country Name"
                value={form.country_name}
                onChange={handleCountryChange}
                className="border-2 focus:bg-slate-200 focus:text-slate-600 focus:shadow p-2 rounded-full w-full border-slate-200 shadow text-slate-500 font-semibold pl-4 py-3 my-2"
                required
              />
              <input
                type="text"
                name="icon_color"
                placeholder="Icon Color"
                value={form.icon_color}
                onChange={handleCountryChange}
                className="border-2 p-2 focus:bg-slate-200 focus:text-slate-600 focus:shadow rounded-full w-full border-slate-200 shadow text-slate-500 font-semibold pl-4 py-3 my-2"
              />

              {form.offices.map((office, idx) => (
                <div
                  key={idx}
                  className=" mt-3  p-2 w-full border-slate-200 space-y-3"
                >
                  <hr className="h-1 border-0 rounded-full bg-gradient-to-r from-emerald-300 via-emerald-400 to-green-400 my-6 shadow-lg" />

                  <div className="flex justify-between items-center mb-2 ">
                    <h3
                      className="font-semibold flex items-center gap-2 border-l-4 border-emerald-600 
               px-4 py-3 bg-gradient-to-r from-emerald-200 to-green-400 rounded-lg shadow"
                    >
                      <Building className="w-5 h-5 text-emerald-600" />
                      Office #{idx + 1}
                    </h3>

                    {form.offices.length > 1 && (
                      <button
                        type="button"
                        title="Delete office"
                        onClick={() => {
                          if (office.id) {
                            handleDeleteOffice(office.id, editingId);
                          } else {
                            handleRemoveOffice(idx); // For new unsaved office
                          }
                        }}
                        className="text-red-500 gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer hover:bg-red-200 hover:text-red-500 flex "
                      >
                        <Trash /> Delete Office
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Office Name"
                    value={office.office_name}
                    onChange={(e) =>
                      handleOfficeChange(idx, "office_name", e.target.value)
                    }
                    className="border-2 focus:bg-slate-200 focus:text-slate-600 focus:shadow p-2 rounded-full w-full border-slate-200 shadow text-slate-500 font-semibold pl-4 py-3 my-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={office.address}
                    onChange={(e) =>
                      handleOfficeChange(idx, "address", e.target.value)
                    }
                    className="border-2 focus:bg-slate-200 focus:text-slate-600 focus:shadow p-2 rounded-full w-full border-slate-200 shadow text-slate-500 font-semibold pl-4 py-3 my-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={office.city}
                    onChange={(e) =>
                      handleOfficeChange(idx, "city", e.target.value)
                    }
                    className="border-2 focus:bg-slate-200 focus:text-slate-600 focus:shadow p-2 rounded-full w-full border-slate-200 shadow text-slate-500 font-semibold pl-4 py-3 my-2"
                  />
                  <input
                    type="text"
                    placeholder="Province"
                    value={office.province}
                    onChange={(e) =>
                      handleOfficeChange(idx, "province", e.target.value)
                    }
                    className="border-2 focus:bg-slate-200 focus:text-slate-600 focus:shadow p-2 rounded-full w-full border-slate-200 shadow text-slate-500 font-semibold pl-4 py-3 my-2"
                  />

                  {/* Phones */}
                  <div className="mb-2">
                    <label className="font-semibold">Phones:</label>
                    {office.phones.map((p, i) => (
                      <div key={i} className="flex gap-2 mb-1 items-center">
                        <div className="flex w-full gap-2">
                          <input
                            type="text"
                            placeholder="Phone Number"
                            value={p.phone_number}
                            onChange={(ev) => {
                              const newPhones = [...office.phones];
                              newPhones[i] = {
                                ...newPhones[i],
                                phone_number: ev.target.value,
                              };
                              handleOfficeChange(idx, "phones", newPhones);
                            }}
                            className="border-2 focus:bg-slate-200 focus:text-slate-600 focus:shadow p-2 rounded-full w-full border-slate-200 shadow text-slate-500 font-semibold pl-4 py-3 my-2"
                          />
                          <input
                            type="text"
                            placeholder="Label"
                            value={p.label}
                            onChange={(ev) => {
                              const newPhones = [...office.phones];
                              newPhones[i] = {
                                ...newPhones[i],
                                label: ev.target.value,
                              };
                              handleOfficeChange(idx, "phones", newPhones);
                            }}
                            className="border-2 p-2 focus:bg-slate-200 focus:text-slate-600 focus:shadow rounded-full w-full border-slate-200 shadow text-slate-500 font-semibold pl-4 py-3 my-2"
                          />
                        </div>
                        <button
                          type="button"
                          title="Delete phone number"
                          onClick={() => {
                            const phoneId = p.id;
                            handleDeletePhone(phoneId, idx, i);
                          }}
                          className="text-red-500 gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer hover:bg-red-200 hover:text-red-500 flex "
                        >
                          <Trash /> Delete
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      title="Add new phone number"
                      onClick={() => handleAddField(idx, "phones")}
                      className="text-green-500 gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer hover:bg-green-200 hover:text-green-500 flex "
                    >
                      <CopyPlus /> Add
                    </button>
                  </div>

                  {/* Emails */}
                  <div className="mb-2">
                    <label className="font-semibold">Emails:</label>
                    {office.emails.map((e, i) => (
                      <div key={i} className="flex gap-2 mb-1 items-center">
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={e.email_address}
                          onChange={(ev) => {
                            const newEmails = [...office.emails];
                            newEmails[i] = {
                              ...newEmails[i],
                              email_address: ev.target.value,
                            };
                            handleOfficeChange(idx, "emails", newEmails);
                          }}
                          className="border-2 focus:bg-slate-200 focus:text-slate-600 focus:shadow p-2 rounded-full w-full border-slate-200 shadow text-slate-500 font-semibold pl-4 py-3 my-2"
                        />
                        <input
                          type="text"
                          placeholder="Label"
                          value={e.label}
                          onChange={(ev) => {
                            const newEmails = [...office.emails];
                            newEmails[i] = {
                              ...newEmails[i],
                              label: ev.target.value,
                            };
                            handleOfficeChange(idx, "emails", newEmails);
                          }}
                          className="border-2 focus:bg-slate-200 focus:text-slate-600 focus:shadow p-2 rounded-full w-full border-slate-200 shadow text-slate-500 font-semibold pl-4 py-3 my-2"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const emailId = office.emails[i].id;
                            handleDeleteEmail(emailId, idx, i);
                          }}
                          className="text-red-500 gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer hover:bg-red-200 hover:text-red-500 flex "
                        >
                          <Trash />
                          Delete
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      title="Add new email"
                      onClick={() => handleAddField(idx, "emails")}
                      className="text-green-500 gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer hover:bg-green-200 hover:text-green-500 flex "
                    >
                      <CopyPlus /> Add
                    </button>
                  </div>

                  {/* Websites */}
                  <div className="mb-2">
                    <label className="font-semibold">Websites:</label>
                    {office.websites.map((w, i) => (
                      <div key={i} className="flex gap-2 mb-1 items-center">
                        <input
                          type="text"
                          placeholder="Website URL"
                          value={w.website_url}
                          onChange={(ev) => {
                            const newWebsites = [...office.websites];
                            newWebsites[i] = {
                              ...newWebsites[i],
                              website_url: ev.target.value,
                            };
                            handleOfficeChange(idx, "websites", newWebsites);
                          }}
                          className="border-2 focus:bg-slate-200 focus:text-slate-600 focus:shadow p-2 rounded-full w-full border-slate-200 shadow text-slate-500 font-semibold pl-4 py-3 my-2"
                        />
                        <button
                          type="button"
                          title="Delete email"
                          onClick={() => {
                            const websiteId = w.id;
                            handleDeleteWebsite(websiteId, idx, i);
                          }}
                          className="text-red-500 gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer hover:bg-red-200 hover:text-red-500 flex "
                        >
                          <Trash /> Delete
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      title="Add new website"
                      onClick={() => handleAddField(idx, "websites")}
                      className="text-green-500 gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer hover:bg-green-200 hover:text-green-500 flex "
                    >
                      <CopyPlus />
                      Website
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3 align-middle ">
                <button
                  type="submit"
                  title="Save data for edit / create"
                  className="bg-blue-600 gap-2 text-white hover:bg-blue-200 hover:text-blue-500 transition-all px-4 py-2 rounded-xl  flex cursor-pointer "
                >
                  <SaveAll /> {editingId ? "Update" : "Save"}
                </button>
                <button
                  onClick={closeModal}
                  title="Cancel"
                  className="text-gray-500  hover:bg-red-200 hover:text-red-500  font-bold cursor-pointer rounded-xl  px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List Countries */}
      <div className="bg-white rounded-full p-4">
        {countries.length === 0 ? (
          <p>No countries found.</p>
        ) : (
          countries.map((country) => (
            <div
              key={country.id}
              className="border-2 border-slate-200 shadow text-slate-500 font-semibold pl-4/30 p-3 rounded-full-2xl mb-4 py-3 my-2"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{country.country_name}</h3>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(country)}
                    title="Edit country"
                    className="bg-yellow-500 text-white px-4 py-2 cursor-pointer transition-all  rounded-xl hover:bg-yellow-200 hover:text-yellow-500"
                  >
                    <PenBoxIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(country.id)}
                    title="Delete country"
                    className="bg-red-500 text-white px-4 py-2 rounded-xl   cursor-pointer transition-all  hover:bg-red-200 hover:text-red-500"
                  >
                    <Trash />
                  </button>
                </div>
              </div>

              {country.offices.map((office) => (
                <div
                  key={office.id}
                  className="pl-4 mb-2 border-l-2 border-gray-200"
                >
                  <p>
                    <strong>{office.office_name}</strong> - {office.address}{" "}
                    {office.city && `, ${office.city}`}{" "}
                    {office.province && `, ${office.province}`}
                  </p>
                  <p>
                    Phones:{" "}
                    {office.phones.map((p) => p.phone_number).join(", ")}
                  </p>
                  <p>
                    Emails:{" "}
                    {office.emails.map((e) => e.email_address).join(", ")}
                  </p>
                  <p>
                    Websites:{" "}
                    {office.websites.map((w) => w.website_url).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
