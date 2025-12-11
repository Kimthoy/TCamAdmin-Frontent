// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Moon,
  Sun,
  Menu as MenuIcon,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "../ui/Button";
import Avatar from "../ui/Avatar";
import { getMe, logout } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useThemeContext as useTheme } from "../context/ThemeProvider";
import ResetPasswordModal from "../modals/ResetPasswordModal";
import NotificationBell from "./NotificationBell";
import { ShieldUser } from "lucide-react";

export function Header({ onToggleSidebar }) {
  const { effectiveIsDark, toggleTheme } = useTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false); // reset password modal
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false); // NEW
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch current user on mount
  useEffect(() => {
    let mounted = true;
    const fetchUser = async () => {
      try {
        const response = await getMe();
        if (mounted) setUser(response);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (localStorage.getItem("adminToken")) fetchUser();
    else setLoading(false);

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setLogoutConfirmOpen(false); // close modal with Escape too
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // logout logic (same as your current handleLogout)
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // ensure localStorage cleared and redirect
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminAuthenticated");
      localStorage.removeItem("adminUser");
      window.location.href = "/login";
    }
  };

  const menuItems = [
    {
      icon: User,
      label: "My Profile",
      onClick: () => setModalOpen(true),
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
    {
      icon: LogOut,
      label: "Logout",
      onClick: () => {
        // open confirmation modal instead of immediate logout
        setLogoutConfirmOpen(true);
      },
      danger: true,
    },
  ];

  return (
    <>
      <header className="h-20 bg-white dark:bg-gray-900 shadow-md dark:shadow-lg flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
        {/* Left: mobile menu + title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onToggleSidebar && onToggleSidebar()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden transition"
            aria-label="Open sidebar"
          >
            <MenuIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>

          <div className="hidden md:flex items-baseline gap-2">
            <h2 className="text-xl font-semibold text-[#1C1B1B] dark:text-white">
              Dashboard
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              / Overview
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-3 ">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleTheme()}
            title={
              effectiveIsDark ? "Switch to light mode" : "Switch to dark mode"
            }
            aria-label="Toggle theme"
          >
            {effectiveIsDark ? (
              <Sun className="h-5 w-5 text-gray-200" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </Button>

          <NotificationBell />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 hover:cursor-pointer py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="User menu"
              aria-expanded={dropdownOpen}
              disabled={loading}
            >
              {loading ? (
                <div className="w-10 h-10 rounded-full  bg-gray-200 dark:bg-gray-700 animate-pulse" />
              ) : (
                <Avatar name={user?.name || "User"} size="md" />
              )}
              <ChevronDown
                className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && !loading && user && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-[#1C1B1B] dark:text-white truncate">
                    {user.name || "Unknown User"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.email || "No email"}
                  </p>
                  {user.role && (
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  )}
                </div>

                <div className="py-2">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          item.onClick?.();
                          setDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                          item.danger
                            ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium text-sm">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reset password modal */}
      <ResetPasswordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {logoutConfirmOpen && (
        <LogoutConfirmModal
          onClose={() => setLogoutConfirmOpen(false)}
          onConfirm={() => {
            setLogoutConfirmOpen(false);
            handleLogout();
          }}
        />
      )}
    </>
  );
}

export default Header;

/* ================= LogoutConfirmModal Component ================ */
/* This small component lives in the same file for convenience.
   If you prefer, move it to src/components/LogoutConfirmModal.jsx */
function LogoutConfirmModal({ onClose, onConfirm }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 w-full max-w-md animate-scaleIn">
        {/* Floating animated icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg animate-bounceSlow">
            <LogOut className="w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Are you sure?
        </h2>

        {/* Subtitle */}
        <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
          You are about to logout from your admin session.
        </p>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-md"
          >
            Cancel
          </button>

          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all shadow-md"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-bounceSlow {
          animation: bounceSlow 2s infinite ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
