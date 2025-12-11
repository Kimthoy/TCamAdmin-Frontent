import React, { useEffect, useState } from "react";
import api from "../api/index.js";

import {
  Package2, // For Products
  Briefcase, // For Services
  Users, // For Customers
  Building2, // For Partners
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

/* ========== Configuration (Updated for specific titles/icons) ========== */
const ICONS = [Package2, Briefcase, Users, Building2];
const VARIANTS = ["teal", "purple", "blue", "orange"];
const WANTED_TITLES = ["Products", "Services", "Customers", "Partners"];
/* ===================================================================== */

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [activity, setActivity] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const prettyKey = (k) =>
    String(k)
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const normalizeStats = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((it) =>
        typeof it === "object" ? it : { title: String(it), value: it }
      );
    }
    if (raw.data && Array.isArray(raw.data)) {
      return raw.data;
    }
    if (typeof raw === "object") {
      return Object.keys(raw).map((k) => {
        const v = raw[k];
        if (typeof v === "object") {
          return {
            title: v.title ?? v.label ?? prettyKey(k),
            value: v.value ?? v.count ?? v.total ?? String(v),
            change: v.change ?? v.delta ?? "+0%",
            trend: v.trend ?? "up",
            trendData: Array.isArray(v.trendData) ? v.trendData : [],
            subtitle: v.subtitle ?? "",
            variant: v.variant ?? "default",
            icon: v.icon ?? null,
          };
        }
        return {
          title: prettyKey(k),
          value: v,
          change: "+0%",
          trend: "up",
          trendData: [],
        };
      });
    }
    return [];
  };

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, activityRes, messagesRes] = await Promise.all([
          api.get("/admin/dashboard/stats"),
          api.get("/admin/dashboard/activity"),
          api.get("/admin/contact-messages?limit=8"),
        ]);

        if (cancelled) return;

        // Normalize
        let allStats = normalizeStats(statsRes.data ?? statsRes);

        // Try to pick wanted titles first (normalize titles for matching)
        let filtered = allStats.filter(
          (s) =>
            WANTED_TITLES.includes(String(s.title)) ||
            (String(s.title) === "Total Clients" &&
              WANTED_TITLES.includes("Customers")) ||
            (String(s.title) === "Total Products" &&
              WANTED_TITLES.includes("Products")) ||
            (String(s.title) === "Active Services" &&
              WANTED_TITLES.includes("Services"))
        );
        if (!filtered.length) filtered = allStats.slice(0, 4);

        // Ensure exactly 4 entries (fill placeholders if needed)
        const defaultTitles = WANTED_TITLES;
        const filled = new Array(4).fill(null).map((_, idx) => {
          const item =
            filtered.find(
              (s) =>
                s.title === defaultTitles[idx] ||
                (defaultTitles[idx] === "Customers" &&
                  s.title === "Total Clients") ||
                (defaultTitles[idx] === "Products" &&
                  s.title === "Total Products") ||
                (defaultTitles[idx] === "Services" &&
                  s.title === "Active Services")
            ) || {};

          const rawTitle = item.title ?? defaultTitles[idx];
          const title =
            rawTitle === "Total Clients"
              ? "Customers"
              : rawTitle === "Total Products"
              ? "Products"
              : rawTitle === "Active Services"
              ? "Services"
              : rawTitle;

          const value = item.value ?? item.count ?? item.total ?? "—";
          const change = item.change ?? "+0%";
          const trend = item.trend ?? "up";
          const trendData = Array.isArray(item.trendData) ? item.trendData : [];
          const subtitle = item.subtitle ?? "";
          const variant = VARIANTS[idx] || "teal";
          const Icon = ICONS[idx] || Package2;

          return {
            title,
            value,
            change,
            trend,
            trendData,
            subtitle,
            variant,
            icon: Icon,
          };
        });

        setStats(filled);

        // activity: support { points: [...] }, direct array, or { data: [...] }
        const act =
          activityRes.data?.points ??
          (Array.isArray(activityRes.data)
            ? activityRes.data
            : activityRes.data?.data ?? []);
        setActivity(Array.isArray(act) ? act : []);

        // messages: array expected (support .data wrapper)
        const msgs = messagesRes.data ?? messagesRes;
        setMessages(Array.isArray(msgs) ? msgs : []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(
          err?.response?.data?.message ??
            err?.message ??
            "Failed to load dashboard data"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-medium text-gray-600 dark:text-gray-300">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 text-red-700 p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className=" space-y-7">
      <header>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
          Welcome back! Here's your business at a glance.
        </p>
      </header>

      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <ModernStatsCard key={i} {...s} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 dark:text-slate-200">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-3xl hover:shadow-2xl p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Activity Overview
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Last 7 days – quick snapshot
              </p>
            </div>

            <div className="h-96">
              <Line data={makeChartData(activity)} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl hover:shadow-2xl p-8 transition-all transform-view">
          <h3 className="text-2xl font-bold mb-6">Recent Messages</h3>

          {messages.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No new messages</p>
          ) : (
            <div className="space-y-5">
              {messages.slice(0, 6).map((m, idx) => (
                <div key={m.id ?? `${m.name}-${idx}`} className="flex gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                    {m.name?.[0] ?? "U"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {m.name ?? m.from ?? "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {m.text ?? m.message ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {m.time ?? m.created_at ?? ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =================== Modern Stats Card (Updated Background Colors + hover) =================== */
function ModernStatsCard({
  title,
  value,
  change = "+0%",
  trend = "up",
  icon: Icon,
  variant = "teal",
  subtitle = "",
  trendData = [],
}) {
  const isUp = trend === "up";

  const VARS = {
    teal: {
      bg: "bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 dark:from-teal-900/20 dark:to-green-900/20 dark:border-teal-800",
      ring: "#10b981",
      iconBg: "from-teal-500 to-emerald-500",
    },
    purple: {
      bg: "bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-800",
      ring: "#8b5cf6",
      iconBg: "from-violet-500 to-pink-500",
    },
    blue: {
      bg: "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-800",
      ring: "#3b82f6",
      iconBg: "from-sky-500 to-cyan-500",
    },
    orange: {
      bg: "bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-800",
      ring: "#fb923c",
      iconBg: "from-amber-500 to-orange-500",
    },
    default: {
      bg: "bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 dark:from-gray-900/20 dark:to-gray-800/20 dark:border-gray-700",
      ring: "#94a3b8",
      iconBg: "from-gray-400 to-gray-600",
    },
  };
  const style = VARS[variant] || VARS.default;

  // Convert hex (#rrggbb or #rgb) to "r,g,b"
  const hexToRgb = (hex) => {
    if (!hex) return "148,163,184";
    const h = hex.replace("#", "");
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r},${g},${b}`;
  };

  const ringRgb = hexToRgb(style.ring);

  const percentMatch = String(change).match(/-?\d+(\.\d+)?/);
  const percentValue = percentMatch
    ? Math.min(100, Math.abs(Number(percentMatch[0])))
    : 0;
  const percentDash = Math.round((percentValue / 100) * 94); // dash length approximation

  const IconComp = Icon || Package2;

  return (
    <div
      className={`dark:text-slate-300 stats-card relative overflow-hidden rounded-2xl p-6 ${style.bg} shadow-sm transition-transform`}
      style={{ ["--ring-rgb"]: ringRgb }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start ">
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Glow background */}
            <div
              className="absolute -inset-2 rounded-full blur-xl opacity-30"
              style={{
                background:
                  "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))",
              }}
            />

            {/* Circular progress ring */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 36 36"
              aria-hidden="true"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Background ring */}
              <circle
                cx="18"
                cy="18"
                r="15"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="3"
                fill="none"
              />

              {/* Progress ring */}
              <circle
                cx="18"
                cy="18"
                r="15"
                stroke={style.ring}
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${percentDash} 94`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Icon container */}
            <div
              className={`relative w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br ${style.iconBg} text-white shadow-lg`}
            >
              <IconComp className="w-5 h-5" />
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {title}
            </p>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white truncate">
                {value}
              </p>
              {subtitle && (
                <p
                  className="text-sm text-gray-500 truncate max-w-6xl dark:text-gray-400"
                  title={subtitle}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div
            className={`inline-flex items-center  px-3   rounded-full font-semibold text-sm ${
              isUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            {isUp ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{change}</span>
          </div>
          <div className="text-xs text-gray-400 mt-2">vs last month</div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm text-gray-500 dark:text-gray-400">Trend</div>
          <div className="mt-2">
            <SparklineModern
              data={trendData}
              stroke={isUp ? "#10b981" : "#ef4444"}
            />
          </div>
        </div>

        <div className="w-36 text-right">
          <div className="text-xs text-gray-400">Goal progress</div>
          <div className="text-sm font-semibold mt-1">{percentValue}%</div>
        </div>
      </div>
    </div>
  );
}

/* =================== Modern Sparkline =================== */
function SparklineModern({ data = [], stroke = "#0ea5e9" }) {
  if (!Array.isArray(data) || data.length < 2) {
    return (
      <div className="h-8 flex items-center">
        <div className="h-2 w-full bg-gray-100 rounded-full dark:bg-gray-700" />
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 140;
  const h = 40;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = max === min ? h / 2 : h - ((v - min) / (max - min)) * h;
    return { x, y };
  });

  // build a smooth-ish path using quadratic curve through midpoints
  let d = "";
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (i === 0) d += `M ${p.x} ${p.y}`;
    else {
      const prev = points[i - 1];
      const midX = (prev.x + p.x) / 2;
      const midY = (prev.y + p.y) / 2;
      if (i === 1) d += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`;
      else d += ` T ${midX} ${midY}`;
    }
  }
  const last = points[points.length - 1];
  d += ` T ${last.x} ${last.y}`;

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="trend sparkline"
    >
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`${stroke}20`} />
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r="3.5"
        fill={stroke}
        stroke="white"
        strokeWidth="1"
      />
    </svg>
  );
}

/* =================== Chart helpers =================== */
const makeChartData = (data = []) => {
  const pts =
    Array.isArray(data) && data.length
      ? data.slice(-7)
      : [8, 12, 10, 18, 15, 25, 32];
  const labels = ["7d ago", "6d", "5d", "4d", "3d", "2d", "Today"].slice(
    -pts.length
  );
  return {
    labels,
    datasets: [
      {
        label: "Activity",
        data: pts,
        fill: true,
        backgroundColor: "rgba(99, 102, 241, 0.18)",
        borderColor: "#6366f1",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#6366f1",
      },
    ],
  };
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { grid: { color: "rgba(0,0,0,0.03)" }, ticks: { font: { size: 12 } } },
  },
};
