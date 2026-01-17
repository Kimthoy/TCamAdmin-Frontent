// src/modals/SubProductModal.jsx
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import subProductService from "../api/subProductService";

const BACKEND_URL = "http://localhost:8000"; // adjust to your Laravel backend

export default function SubProductModal({
  isOpen,
  onClose,
  editData,
  onSaved,
  products,
}) {
  const [form, setForm] = useState({
    product_id: "",
    name: "",
    description: "",
    price: "",
    images: [], // new File objects
    existingImages: [], // images already uploaded
    previewImages: [], // URLs for preview
    primary_image_index: 0,
    properties: [{ key: "", value: "" }],
  });

  const [originalProductId, setOriginalProductId] = useState(null);
  const fileRef = useRef(null);

  // Load editData
  useEffect(() => {
    if (editData) {
      setOriginalProductId(editData.product_id);
      const existingImgs = editData.images || [];
      setForm({
        product_id: editData.product_id ?? "",
        name: editData.name ?? "",
        description: editData.description ?? "",
        price: editData.price ?? "",
        images: [],
        existingImages: existingImgs,
        previewImages:
          existingImgs.map(
            (img) => `${BACKEND_URL}/storage/${img.image_path}`
          ) || [],
        primary_image_index: existingImgs.findIndex((i) => i.is_primary) ?? 0,
        properties: editData.properties?.length
          ? editData.properties.map((p) => ({ key: p.key, value: p.value }))
          : [{ key: "", value: "" }],
      });
    } else {
      setOriginalProductId(null);
      setForm({
        product_id: "",
        name: "",
        description: "",
        price: "",
        images: [],
        existingImages: [],
        previewImages: [],
        primary_image_index: 0,
        properties: [{ key: "", value: "" }],
      });
    }
  }, [editData]);

  // Input handlers
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePropertyChange = (i, field, val) => {
    const newProps = [...form.properties];
    newProps[i][field] = val;
    setForm((prev) => ({ ...prev, properties: newProps }));
  };

  const addProperty = () =>
    setForm((prev) => ({
      ...prev,
      properties: [...prev.properties, { key: "", value: "" }],
    }));

  const removeProperty = (i) =>
    setForm((prev) => ({
      ...prev,
      properties: prev.properties.filter((_, idx) => idx !== i),
    }));

  // Image handlers
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
      previewImages: [...prev.previewImages, ...newPreviews],
    }));
  };

  const removeImage = (index) => {
    setForm((prev) => {
      const totalExisting = prev.existingImages.length;
      let newImages = [...prev.images];
      let newExisting = [...prev.existingImages];
      let newPreviews = [...prev.previewImages];

      if (index < totalExisting) {
        // Remove existing image
        newExisting.splice(index, 1);
      } else {
        // Remove newly added image
        newImages.splice(index - totalExisting, 1);
      }
      newPreviews.splice(index, 1);

      return {
        ...prev,
        images: newImages,
        existingImages: newExisting,
        previewImages: newPreviews,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) return Swal.fire("Error", "Name is required!", "error");
    if (!editData && !form.product_id)
      return Swal.fire("Error", "Product is required!", "error");

    try {
      const formData = new FormData();
      if (editData) formData.append("_method", "PUT");

      formData.append("name", form.name);
      formData.append("description", form.description ?? "");
      formData.append("price", form.price ?? "");
      formData.append("primary_image_index", form.primary_image_index ?? 0);

      if (!editData) formData.append("product_id", form.product_id);
      if (editData && form.product_id !== originalProductId)
        formData.append("product_id", form.product_id);

      form.images.forEach((file) => formData.append("images[]", file));

      // Send IDs of existing images to keep
      form.existingImages.forEach((img) => {
        formData.append("existing_image_ids[]", img.id);
      });

      form.properties.forEach((prop, i) => {
        formData.append(`properties[${i}][key]`, prop.key);
        formData.append(`properties[${i}][value]`, prop.value);
      });

      if (editData)
        await subProductService.updateSubProduct(editData.id, formData);
      else await subProductService.createSubProduct(formData);

      Swal.fire(
        editData ? "Updated!" : "Created!",
        "SubProduct saved successfully",
        "success"
      );
      onSaved?.();
      onClose();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Something went wrong",
        "error"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-h-[95vh] overflow-auto w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editData ? "Edit" : "Add"} SubProduct
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 font-bold text-xl hover:text-red-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product select */}
            <div>
              <label>Product / Service</label>
              <select
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
                className="border border-slate-400 py-2 px-2 w-full rounded-xl"
                required={!editData}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="border border-slate-400 py-2 px-2 w-full rounded-xl"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="border h-72 border-slate-400 py-2 px-2 w-full rounded-xl"
              />
            </div>

            {/* Price */}
            <div>
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="border border-slate-400 py-2 px-2 w-full rounded-xl"
              />
            </div>

            {/* Images */}
            <div className="md:col-span-2">
              <label>Images</label>
              <input
                type="file"
                multiple
                onChange={handleImages}
                className="border border-slate-400 py-2 px-2 w-full rounded-xl"
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.previewImages.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={img}
                      alt="preview"
                      className="w-24 h-24 object-cover border rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Properties */}
            <div className="md:col-span-2">
              <label>Properties</label>
              {form.properties.map((prop, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Key"
                    value={prop.key}
                    onChange={(e) =>
                      handlePropertyChange(i, "key", e.target.value)
                    }
                    className="border border-slate-400 py-2 px-2 w-1/2 rounded-xl"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={prop.value}
                    onChange={(e) =>
                      handlePropertyChange(i, "value", e.target.value)
                    }
                    className="border border-slate-400 py-2 px-2 w-1/2 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => removeProperty(i)}
                    className="bg-red-500 text-white px-4 rounded-xl"
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addProperty}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl"
              >
                Add Property
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded-xl"
          >
            {editData ? "Update" : "Create"}
          </button>
        </form>
      </div>
    </div>
  );
}
