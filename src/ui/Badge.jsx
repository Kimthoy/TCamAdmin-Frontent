export function Badge({ variant = "default", className = "", children }) {
  const styles = {
    default: "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300",
    destructive: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]} ${className}`}>
      {children}
    </span>
  )
}