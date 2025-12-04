export function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-2xl bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-glass ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div
      className={`p-6 border-b border-gray-200/50 dark:border-gray-700/50 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children }) {
  return (
    <h3
      className={`text-2xl font-bold text-gray-900 dark:text-white ${className}`}
    >
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
