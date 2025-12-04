// src/components/Sidebar.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Home,
  Users,
  Box,
  Briefcase,
  Image,
  FileText,
  Mail,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const COLLAPSED_PANEL_OFFSET = 20;
const PANEL_MIN_TOP = 75;
const PANEL_WIDTH_PX = 280;

const menuVariants = {
  Dashboard: {
    bg: "from-sky-500 to-indigo-500",
    icon: "from-sky-500 to-indigo-500",
  },
  Products: {
    bg: "from-teal-500 to-green-500",
    icon: "from-teal-400 to-green-400",
  },
  Services: {
    bg: "from-purple-500 to-violet-500",
    icon: "from-purple-400 to-violet-400",
  },
  Users: { bg: "from-blue-500 to-cyan-500", icon: "from-blue-400 to-cyan-400" },
  Customers: {
    bg: "from-orange-500 to-amber-500",
    icon: "from-orange-400 to-amber-400",
  },
  Partners: {
    bg: "from-pink-500 to-rose-500",
    icon: "from-pink-400 to-rose-400",
  },
  Banners: {
    bg: "from-yellow-500 to-amber-500",
    icon: "from-yellow-400 to-amber-400",
  },
  Pages: { bg: "from-gray-500 to-gray-600", icon: "from-gray-400 to-gray-500" },
  "Contact Messages": {
    bg: "from-indigo-500 to-purple-500",
    icon: "from-indigo-400 to-purple-400",
  },
  Settings: {
    bg: "from-green-500 to-emerald-500",
    icon: "from-green-400 to-emerald-400",
  },
};

const menu = [
  { icon: Home, label: "Dashboard", route: "/dashboard" },
  {
    icon: Box,
    label: "Products",
    submenu: [
      { label: "All Products", route: "/products" },
      { label: "Product Categories", route: "/product-categories" },
    ],
  },
  {
    icon: Briefcase,
    label: "Services",
    submenu: [
      { label: "All Services", route: "/services" },
      { label: "Service Categories", route: "/service-categories" },
    ],
  },
  { icon: Users, label: "Users", route: "/users" },
  { icon: Users, label: "Customers", route: "/customers" },
  { icon: Users, label: "Partners", route: "/partners" },
  { icon: Image, label: "Banners", route: "/banners" },
  { icon: FileText, label: "Pages", route: "/pages" },
  { icon: Mail, label: "Contact Messages", route: "/contact-messages" },
  { icon: Settings, label: "Settings", route: "/settings" },
];

export default function Sidebar({
  collapsed: collapsedProp,
  onCollapseChange,
  mobileOpen = false,
  onRequestCloseMobile,
}) {
  const location = useLocation();
  const [collapsedInternal, setCollapsedInternal] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [panelTop, setPanelTop] = useState(PANEL_MIN_TOP + 40);
  const itemRefs = useRef({});
  const panelRef = useRef(null);

  const collapsed = collapsedProp ?? collapsedInternal;
  const effectiveCollapsed = isMobile ? false : collapsed;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setCollapsedInternal(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggleCollapse = () => {
    if (onCollapseChange) onCollapseChange(!collapsed);
    else setCollapsedInternal((s) => !s);
  };

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isItemActive = (item) => {
    if (item.route && location.pathname === item.route) return true;
    if (item.submenu) {
      return item.submenu.some((sub) => location.pathname === sub.route);
    }
    return false;
  };

  const openPreviewFor = (label) => {
    if (isMobile || !effectiveCollapsed) return;
    const node = itemRefs.current[label];
    if (node) {
      const rect = node.getBoundingClientRect();
      const centered = rect.top + rect.height / 2;
      const desiredTop = centered - 48 + COLLAPSED_PANEL_OFFSET;
      const clamped = Math.max(
        PANEL_MIN_TOP,
        Math.min(desiredTop, window.innerHeight - 100)
      );
      setPanelTop(clamped);
    }
    setHoveredItem(label);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onRequestCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 h-full z-40 transition-all duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${effectiveCollapsed ? "w-23" : "w-72"}`}
      >
        <div className="glass-sidebar h-full flex flex-col bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-xl border-r border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-lg h-11 w-11 bg-gradient-to-br from-sky-600 to-indigo-600 text-white font-bold text-xl">
                T
              </div>
              {!effectiveCollapsed && (
                <div>
                  <div className="font-bold text-xl text-[#1C1B1B] dark:text-white">
                    TCAM Solution
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Admin Panel
                  </div>
                </div>
              )}
            </div>
            {!isMobile && (
              <button
                onClick={handleToggleCollapse}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                {effectiveCollapsed ? (
                  <ChevronRight className="h-6 w-6" />
                ) : (
                  <ChevronLeft className="h-6 w-6" />
                )}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menu.map((item) => {
              const Icon = item.icon;
              const hasSubmenu = !!item.submenu;
              const isOpen = openSubmenus[item.label];
              const active = isItemActive(item);
              const variant = menuVariants[item.label] || {
                bg: "from-gray-500 to-gray-600",
                icon: "from-gray-400 to-gray-500",
              };

              return (
                <div
                  key={item.label}
                  ref={(el) => el && (itemRefs.current[item.label] = el)}
                  onMouseEnter={() =>
                    effectiveCollapsed && openPreviewFor(item.label)
                  }
                  onMouseLeave={() =>
                    effectiveCollapsed && setHoveredItem(null)
                  }
                >
                  {item.route ? (
                    <Link
                      to={item.route}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                        ${
                          active
                            ? `bg-gradient-to-r ${variant.bg} text-white shadow-md`
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                        }`}
                      onClick={onRequestCloseMobile}
                    >
                      <div
                        className={`h-10 w-10 rounded-full bg-gradient-to-br ${variant.icon} flex items-center justify-center shadow-md`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {!effectiveCollapsed && (
                        <span className="font-medium">{item.label}</span>
                      )}
                      {effectiveCollapsed && active && (
                        <div className="absolute left-0 w-1 h-full bg-gradient-to-b from-sky-600 to-indigo-600 rounded-r-full" />
                      )}
                    </Link>
                  ) : (
                    <button
                      onClick={() => toggleSubmenu(item.label)}
                      className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all
                        ${
                          active
                            ? `bg-gradient-to-r ${variant.bg} text-white shadow-md`
                            : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full bg-gradient-to-br ${variant.icon} flex items-center justify-center shadow-md`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        {!effectiveCollapsed && (
                          <span className="font-medium">{item.label}</span>
                        )}
                      </div>
                      {!effectiveCollapsed &&
                        hasSubmenu &&
                        (isOpen ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        ))}
                    </button>
                  )}

                  {/* Submenu */}
                  {!effectiveCollapsed && hasSubmenu && isOpen && (
                    <div className="ml-12 mt-1 space-y-1">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.route}
                          to={sub.route}
                          onClick={onRequestCloseMobile}
                          className={`block px-4 py-2 rounded-lg text-sm font-medium transition-all
                            ${
                              location.pathname === sub.route
                                ? `bg-gradient-to-r ${variant.bg} text-white`
                                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                            }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 transition">
              <LogOut className="h-6 w-6" />
              {!effectiveCollapsed && (
                <span className="font-medium">Logout</span>
              )}
            </button>
          </div>

          {/* Floating Preview Panel (collapsed mode) */}
          {effectiveCollapsed && hoveredItem && (
            <div
              ref={panelRef}
              className="fixed left-24 rounded-xl shadow-2xl bg-white/95 dark:bg-gray-900/95 border border-gray-200 dark:border-gray-800 backdrop-blur-md p-4"
              style={{ top: panelTop, width: PANEL_WIDTH_PX }}
              onMouseEnter={() => setHoveredItem(hoveredItem)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Same content as expanded item */}
              {(() => {
                const item = menu.find((i) => i.label === hoveredItem);
                if (!item) return null;
                const variant = menuVariants[item.label] || {};
                const Icon = item.icon;
                return (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-12 w-12 rounded-lg bg-gradient-to-br ${variant.icon} flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-xs text-gray-500">
                          Quick actions
                        </div>
                      </div>
                    </div>
                    {item.submenu &&
                      item.submenu.map((sub) => (
                        <Link
                          key={sub.route}
                          to={sub.route}
                          onClick={onRequestCloseMobile}
                          className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    {item.route && (
                      <Link
                        to={item.route}
                        onClick={onRequestCloseMobile}
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Open {item.label}
                      </Link>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
