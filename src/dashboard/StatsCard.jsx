// src/dashboard/StatsCard.jsx
import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const variants = {
  teal: {
    bg: "from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20",
    border: "border-teal-200 dark:border-teal-800",
    icon: "from-teal-400/40 to-teal-600/40",
  },
  purple: {
    bg: "from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20",
    border: "border-purple-200 dark:border-purple-800",
    icon: "from-purple-400/40 to-purple-600/40",
  },
  blue: {
    bg: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    border: "border-blue-200 dark:border-blue-800",
    icon: "from-blue-400/40 to-blue-600/40",
  },
  orange: {
    bg: "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
    border: "border-orange-200 dark:border-orange-800",
    icon: "from-orange-400/40 to-orange-600/40",
  },
  default: {
    bg: "from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20",
    border: "border-gray-300 dark:border-gray-700",
    icon: "from-gray-400/40 to-gray-600/40",
  },
};

export function StatsCard({
  title,
  value,
  change,
  trend = "up",
  icon: Icon,
  variant = "default",
  subtitle,
}) {
  const isUp = trend === "up";
  const style = variants[variant] || variants.default;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-6 
      bg-gradient-to-r ${style.bg} border ${style.border}
      shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        {/* Left text block */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            {title}
          </p>

          <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>

          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-sm font-semibold ${
                isUp
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {isUp ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {change}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              vs last month
            </span>
          </div>
        </div>

        {/* RIGHT ICON WITH LIQUID GLASS EFFECT */}
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            bg-gradient-to-br ${style.icon}
            backdrop-blur-xl bg-opacity-30
            shadow-lg border border-white/30 dark:border-white/10
          `}
        >
          <Icon
            className="w-8 h-8 text-white drop-shadow-md"
            strokeWidth={2.2}
          />
        </div>
      </div>
    </div>
  );
}
