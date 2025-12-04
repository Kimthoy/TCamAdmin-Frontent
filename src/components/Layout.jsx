// src/components/Layout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom"; // ← This renders the page content
import Sidebar from "./Sidebar";
import Header from "./Header";

export function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - always visible (collapsed or full) */}
      <Sidebar
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
        mobileOpen={mobileSidebarOpen}
        onRequestCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Right side: Header + Changing Content */}
      <div className="flex-1 flex flex-col">
        {/* Header - fixed */}
        <Header onToggleSidebar={() => setMobileSidebarOpen(true)} />

        {/* Main Content - ONLY THIS PART CHANGES */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet /> {/* ← Dashboard or Banners appears here */}
        </main>
      </div>
    </div>
  );
}

export default Layout;
