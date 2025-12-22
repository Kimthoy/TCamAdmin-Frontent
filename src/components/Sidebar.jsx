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
  Handshake,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Info,
  Puzzle,
  Headphones,
  BriefcaseBusiness,
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
  Product: {
    bg: "from-teal-500 to-green-500",
    icon: "from-teal-400 to-green-400",
  },
  Solution: {
    bg: "from-purple-500 to-violet-500",
    icon: "from-purple-400 to-violet-400",
  },
  Users: { bg: "from-blue-500 to-cyan-500", icon: "from-blue-400 to-cyan-400" },
  Customer: {
    bg: "from-orange-500 to-amber-500",
    icon: "from-orange-400 to-amber-400",
  },
  Partner: {
    bg: "from-pink-500 to-rose-500",
    icon: "from-pink-400 to-rose-400",
  },
  Banner: {
    bg: "from-yellow-500 to-amber-500",
    icon: "from-yellow-400 to-amber-400",
  },
  Post: { bg: "from-rose-500 to-pink-500", icon: "from-rose-400 to-pink-400" },
  Message: {
    bg: "from-indigo-500 to-purple-500",
    icon: "from-indigo-400 to-purple-400",
  },
  Widget: {
    bg: "from-green-500 to-emerald-500",
    icon: "from-green-400 to-emerald-400",
  },
  Candidate: {
    bg: "from-green-800 to-green-500",
    icon: "from-green-600 to-green-400",
  },
  Job: {
    bg: "from-blue-500 to-emerald-500",
    icon: "from-blue-400 to-emerald-400",
  },
  Support: {
    bg: "from-blue-500 to-emerald-500",
    icon: "from-blue-400 to-emerald-400",
  },
};
const menu = [
  { group: "Main", icon: Home, label: "Dashboard", route: "/dashboard" },

  {
    group: "Catalog",
    icon: Box,
    label: "Product",
    submenu: [
      { label: "Products list", route: "/products" },
      { label: "Category", route: "/product-category" },
    ],
  },

  {
    group: "Catalog",
    icon: Puzzle,
    label: "Solution",
    submenu: [
      { label: "Solution list", route: "/solutions" },
      { label: "Category", route: "/solution-category" },
      { label: "Industry Solution", route: "/industry" },
    ],
  },

  {
    group: "Catalog",
    icon: Headphones,
    label: "Support",
    route: "/support",
  },

  {
    group: "People",
    icon: Users,
    label: "Customer",
    submenu: [
      { label: "Customer list", route: "/customers" },
      { label: "Category", route: "/customer-categories" },
    ],
  },

  { group: "People", icon: Handshake, label: "Partner", route: "/partners" },

  { group: "Content", icon: Image, label: "Banner", route: "/banners" },
  { group: "Content", icon: BriefcaseBusiness, label: "Job", route: "/jobs" },
  { group: "Content", icon: User, label: "Candidate", route: "/candidate" },

  {
    group: "Content",
    icon: FileText,
    label: "Post",
    submenu: [
      { label: "Post list", route: "/posts" },
      { label: "Category", route: "/post-categories" },
    ],
  },

  {
    group: "Content",
    icon: Mail,
    label: "Message",
    route: "/contact-messages",
  },

  {
    group: "Widget",
    icon: Settings,
    label: "Widget",
    submenu: [
      { label: "Setting", route: "/settings" },
      { label: "Widget", route: "/widget" },
      { label: "Location", route: "/location" },
      { label: "About", route: "/about_us" },
      { label: "Join Us", route: "/joinus" },
    ],
  },
];
const groupedMenu = menu.reduce((acc, item) => {
  const group = item.group || "Other";
  if (!acc[group]) acc[group] = [];
  acc[group].push(item);
  return acc;
}, {});

export default function Sidebar({
  collapsed: collapsedProp,
  onCollapseChange,
  mobileOpen = false,
  onRequestCloseMobile,
}) {
  const location = useLocation();
  const [collapsedInternal, setCollapsedInternal] = useState(false);
  // single open submenu label (or null) — ensures only one submenu is open at a time
  const [openSubmenu, setOpenSubmenu] = useState(null);
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

  // toggles a submenu: if a different submenu is open, close it and open this one
  // clicking the same submenu toggles it closed
  const toggleSubmenu = (label) => {
    setOpenSubmenu((prev) => (prev === label ? null : label));
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
          ${effectiveCollapsed ? "w-24" : "w-60"}`}
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
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg "
              >
                {effectiveCollapsed ? (
                  <ChevronRight className="h-6 w-6 dark:text-slate-200 cursor-pointer" />
                ) : (
                  <ChevronLeft className="h-6 w-6 dark:text-slate-200 cursor-pointer" />
                )}
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {Object.entries(groupedMenu).map(([groupName, items]) => (
              <div key={groupName} className="mb-6">
                {/* Group Title */}
                {!effectiveCollapsed && (
                  <div className="px-4 mb-2 text-xs font-semibold uppercase text-gray-400">
                    {groupName}
                  </div>
                )}

                {items.map((item) => {
                  const Icon = item.icon;
                  const hasSubmenu = !!item.submenu;
                  const isOpen = openSubmenu === item.label;
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
                      {/* MAIN ITEM */}
                      {item.route ? (
                        <Link
                          to={item.route}
                          onClick={onRequestCloseMobile}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all
                ${
                  active
                    ? `bg-gradient-to-r ${variant.bg} text-white shadow-md`
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200"
                }`}
                        >
                          <div
                            className={`h-10 w-10 rounded-full bg-gradient-to-br ${variant.icon} flex items-center justify-center`}
                          >
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          {!effectiveCollapsed && (
                            <span className="font-medium">{item.label}</span>
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
                              className={`h-10 w-10 rounded-full bg-gradient-to-br ${variant.icon} flex items-center justify-center`}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            {!effectiveCollapsed && (
                              <span className="font-medium">{item.label}</span>
                            )}
                          </div>
                          {!effectiveCollapsed &&
                            (isOpen ? <ChevronUp /> : <ChevronDown />)}
                        </button>
                      )}

                      {/* SUBMENU */}
                      {!effectiveCollapsed && hasSubmenu && isOpen && (
                        <div className="ml-12 mt-1 space-y-1">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.route}
                              to={sub.route}
                              className={`block px-3 py-2 rounded-lg text-sm
                    ${
                      location.pathname === sub.route
                        ? `bg-gradient-to-r ${variant.bg} text-white`
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
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
              </div>
            ))}
          </nav>

          {/* Floating Preview Panel (collapsed mode) */}
          {effectiveCollapsed && hoveredItem && (
            <div
              ref={panelRef}
              className="fixed left-[70px] rounded-xl shadow-2xl bg-[#FFFFFF] dark:bg-gray-900 dark:text-slate-200 border border-gray-200 dark:border-gray-800 backdrop-blur-md p-4"
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
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
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
                          className={`block px-3 py-3 hover:shadow-2xl rounded-md text-sm dark:hover:bg-gray-700 hover:bg-gray-200 transition-all`}
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
