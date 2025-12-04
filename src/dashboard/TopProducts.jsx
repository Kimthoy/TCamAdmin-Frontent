import React from "react";

const rows = [
  {
    id: 1,
    name: "Premium Widget",
    sales: 245,
    revenue: "$12,250",
    status: "In Stock",
  },
  {
    id: 2,
    name: "Standard Package",
    sales: 189,
    revenue: "$9,450",
    status: "In Stock",
  },
  {
    id: 3,
    name: "Basic Module",
    sales: 156,
    revenue: "$4,680",
    status: "Low Stock",
  },
  {
    id: 4,
    name: "Pro Bundle",
    sales: 98,
    revenue: "$19,600",
    status: "In Stock",
  },
];

export function TopProducts() {
  return (
    <div className="card">
      <h4 className="font-semibold mb-3">Top Products</h4>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center">
                {r.name[0]}
              </div>
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-xs text-gray-400">
                  Sales: {r.sales} • {r.revenue}
                </div>
              </div>
            </div>
            <div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  r.status === "Low Stock"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {r.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
