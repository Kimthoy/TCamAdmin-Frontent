// src/components/Breadcrumb.jsx
import React, { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronsRight } from "lucide-react";

export default function Breadcrumb({ menu }) {
  const location = useLocation();

  // Build path segments from menu
  const paths = useMemo(() => {
    const segments = [];

    const findPath = (items) => {
      for (let item of items) {
        if (item.route === location.pathname) {
          segments.push({ label: item.label, route: item.route });
          return true;
        }
        if (item.submenu) {
          if (findPath(item.submenu)) {
            // Parent may not have a route, fallback to first submenu route
            const parentRoute = item.route || item.submenu[0]?.route || "#";
            segments.unshift({ label: item.label, route: parentRoute });
            return true;
          }
        }
      }
      return false;
    };

    if (menu?.length) findPath(menu);
    return segments;
  }, [location.pathname, menu]);

  if (!paths.length) return null;

  return (
    <nav className="flex  items-center  align-middle justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <ChevronsRight className="w-4 h-4 mx-3" />
      <Link
        to="/dashboard"
        className="hover:text-emerald-400 hover:underline dark:hover:text-white flex justify-center align-middle items-center"
      >
        Home
      </Link>
      {paths.map((p, i) => {
        const isLast = i === paths.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            <span>
              <ChevronsRight className="w-4 h-4 mx-3" />{" "}
            </span>
            {isLast ? (
              <span className="text-emerald-400 dark:text-white font-semibold">
                {p.label}
              </span>
            ) : (
              <Link
                to={p.route || "/dashboard"}
                className="hover:text-emerald-400 dark:hover:text-white hover:underline"
              >
                {p.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
