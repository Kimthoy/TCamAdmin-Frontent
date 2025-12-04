import React, { useEffect, useRef, useState } from "react";
import { Bell, Loader2, X } from "lucide-react";

const sampleNotifications = [
  { id: 1, title: "New order", body: "Order #1024", time: "2m", unread: true },
  {
    id: 2,
    title: "Message",
    body: "Anna sent you a message",
    time: "1h",
    unread: false,
  },
];

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setNotifications(sampleNotifications);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const unread = notifications.filter((n) => n.unread).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-700 dark:text-gray-300" />
        ) : (
          <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        )}
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 text-[10px] px-1 py-0.5 bg-red-600 text-white rounded-full">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-semibold">
            Notifications
          </div>

          <div className="max-h-64 overflow-auto custom-scrollbar">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                <div className="flex justify-between">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {n.title}
                  </div>
                  <div className="text-xs text-gray-400">{n.time}</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {n.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
