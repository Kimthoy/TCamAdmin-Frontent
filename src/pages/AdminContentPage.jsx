import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLocationPage from "./AdminLocationPage";
import AdminAboutUs from "./AdminAboutUs";
import {
  MapPin,
  Info,
  LayoutDashboard,
  UserPlus,
  LifeBuoy,
} from "lucide-react";
import AdminWidget from "./AdminWidget";
import JoinUs from "./JoinUs";
import AdminSupportPage from "./AdminSupportPage";

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState("location");

  const tabs = [
    {
      id: "location",
      label: "Locations",
      icon: MapPin,
      component: <AdminLocationPage />,
    },
    {
      id: "about",
      label: "About Us",
      icon: Info,
      component: <AdminAboutUs />,
    },
    {
      id: "widget",
      label: "Widget",
      icon: LayoutDashboard,
      component: <AdminWidget />,
    },
    {
      id: "joinus",
      label: "Join Us",
      icon: UserPlus,
      component: <JoinUs />,
    },
    {
      id: "support",
      label: "Ater-Sale",
      icon: LifeBuoy,
      component: <AdminSupportPage />,
    },
  ];

  return (
    <div className="p-6">
      {/* Tabs Header */}
      <div className="flex gap-2 mb-6 border-b border-slate-300">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center cursor-pointer   gap-2 px-5 py-3 rounded-t-xl font-semibold transition-all
                ${
                  isActive
                    ? "bg-green-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600"
                }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {tab.component}
              </motion.div>
            ),
        )}
      </AnimatePresence>
    </div>
  );
}
