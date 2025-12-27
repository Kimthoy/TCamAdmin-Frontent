// src/components/Search.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";

// Recursive function to flatten menu & include submenu items
const flattenMenu = (menu) => {
  let items = [];
  menu.forEach((item) => {
    items.push({ label: item.label, route: item.route });
    if (item.submenu) {
      items = items.concat(flattenMenu(item.submenu));
    }
  });
  return items;
};

export default function Search({ menu }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  // Flattened menu for easy search
  const flatMenu = useMemo(() => flattenMenu(menu), [menu]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query) setOpen(true);
  }, [query]);

  // Filter items by label or route
  const results = useMemo(
    () =>
      query
        ? flatMenu.filter(
            (item) =>
              item.label.toLowerCase().includes(query.toLowerCase()) ||
              (item.route || "").toLowerCase().includes(query.toLowerCase())
          )
        : [],
    [query, flatMenu]
  );

  return (
    <div ref={containerRef} className="relative w-full mx-6 max-w-sm">
      <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-full px-6 py-2 bg-white dark:bg-gray-900">
        <SearchIcon className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mx-3 w-full bg-transparent outline-none text-gray-800 dark:text-gray-200 "
        />
      </div>

      {results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg">
          {results.map((item, i) => (
            <li key={i} className="">
              {item.route ? (
                <Link
                  to={item.route}
                  className="block hover:bg-emerald-100 px-6 py-3   dark:hover:bg-emerald-600/30 transition-all    text-gray-800 hover:text-emerald-600 dark:text-gray-200 font-medium"
                  onClick={() => setQuery("")} // Clear search on click
                >
                  {item.label}
                  <span className="text-xs text-gray-400 mx-3">
                    {item.route}
                  </span>
                </Link>
              ) : (
                ""
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
