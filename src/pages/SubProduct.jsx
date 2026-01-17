import React, { useState, useEffect, useMemo } from "react";
import subProductService from "../api/subProductService";
import SubProductModal from "../modals/SubProductModal";
import Swal from "sweetalert2";
import { CopyPlus, Trash, PenBoxIcon } from "lucide-react";
import productService from "../api/products";

export default function SubProduct() {
  const [subProducts, setSubProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [products, setProducts] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchSubProducts = async () => {
    try {
      setLoading(true);
      const res = await subProductService.fetchSubProducts();
      setSubProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubProducts();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await productService.fetchProducts();
      const items = res?.data?.data ?? res?.data ?? [];
      setProducts(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load products", err);
      setProducts([]);
    }
  };

  const handleEdit = (sp) => {
    setEditData(sp);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the sub-product!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });
    if (confirm.isConfirmed) {
      await subProductService.deleteSubProduct(id);
      Swal.fire("Deleted!", "SubProduct deleted.", "success");
      fetchSubProducts();
    }
  };

  const productMap = useMemo(() => {
    return products.reduce((acc, product) => {
      acc[product.id] = product.title;
      return acc;
    }, {});
  }, [products]);

  // -----------------------------
  // Pagination logic
  // -----------------------------
  const totalPages = Math.ceil(subProducts.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return subProducts.slice(start, end);
  }, [subProducts, currentPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sub Services Management</h1>
        <button
          className="bg-blue-500 transition-all text-white px-7 hover:bg-blue-200 hover:text-blue-500 py-2 rounded-xl shadow-2xl cursor-pointer"
          title="Add new sub product"
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
        >
          <CopyPlus />
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-100 rounded-xl p-4">
        {loading ? (
          <p>Fetching Data ...</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border border-slate-300 table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-slate-300 p-2">ID</th>
                    <th className="border border-slate-300 p-2">Image</th>
                    <th className="border border-slate-300 p-2">
                      Sub Service Name
                    </th>
                    <th className="border border-slate-300 p-2">Product</th>
                    <th className="border border-slate-300 p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((sp) => (
                    <tr key={sp.id}>
                      <td className="border border-slate-300 p-2 py-3">
                        {sp.id}
                      </td>
                      <td className="border border-slate-300 p-2 py-3">
                        {sp.feature_image_url ? (
                          <img
                            src={sp.feature_image_url}
                            alt={sp.name}
                            className="w-16 h-16 object-cover rounded border"
                          />
                        ) : (
                          <span className="text-gray-400">No image</span>
                        )}
                      </td>
                      <td className="border border-slate-300 p-2 py-3">
                        {sp.name}
                      </td>
                      <td className="border border-slate-300 p-2 py-3">
                        {productMap[sp.product_id] || "—"}
                      </td>
                      <td className="border border-slate-300 p-2 py-6 flex gap-2 items-center justify-center">
                        <button
                          title="Edit sub products / services"
                          className="bg-yellow-500 text-white px-4 transition-all py-2 rounded-xl hover:bg-yellow-200 hover:text-yellow-500 cursor-pointer"
                          onClick={() => handleEdit(sp)}
                        >
                          <PenBoxIcon />
                        </button>
                        <button
                          title="Delete sub products / services"
                          className="bg-red-500 text-white transition-all hover:bg-red-300 hover:text-red-500 px-4 py-2 rounded-xl cursor-pointer"
                          onClick={() => handleDelete(sp.id)}
                        >
                          <Trash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      <SubProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editData={editData}
        onSaved={fetchSubProducts}
        products={products}
      />
    </div>
  );
}
