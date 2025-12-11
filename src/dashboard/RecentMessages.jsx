// src/dashboard/RecentMessages.jsx
import React from "react";

export function RecentMessages({ messages = [] }) {
  // fallback demo
  const demo = [
    {
      id: 1,
      name: "John Doe",
      text: "New order #12345 has been placed",
      time: "2 minutes ago",
      avatarColor: "bg-blue-500",
    },
    {
      id: 2,
      name: "Jane Smith",
      text: "New customer registered successfully",
      time: "15 minutes ago",
      avatarColor: "bg-green-500",
    },
  ];
  const list = messages.length ? messages : demo;

  return (
    <div className="space-y-4">
      {list.map((msg) => (
        <div
          key={msg.id}
          className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 group"
        >
          <div
            className={`${
              msg.avatarColor ?? "bg-gray-400"
            } w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0`}
          >
            {msg.name?.[0] ?? "U"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-[#1C1B1B] dark:text-white truncate">
                {msg.name}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {msg.time}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {msg.text}
            </p>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
