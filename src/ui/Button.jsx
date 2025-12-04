export function Button({ children, variant = "default", size = "default", className = "", ...props }) {
  const variants = {
    default: "bg-primary-600 hover:bg-primary-700 text-white",
    outline: "border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800"
  }
  const sizes = {
    default: "h-10 px-5",
    sm: "h-9 px-4 text-sm",
    lg: "h-11 px-6 text-lg"
  }
  return (
    <button className={`rounded-lg font-medium transition-all ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}