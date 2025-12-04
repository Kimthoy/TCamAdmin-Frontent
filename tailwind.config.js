export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",

  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          900: "#0c4a6e",
        },
        accent: {
          500: "#8b5cf6",
          600: "#7c3aed",
        },
      },

      safelist: [
        // BUTTON COLORS
        "bg-primary-600",
        "hover:bg-primary-700",
        "active:bg-primary-800",
        "text-white",

        // GRADIENT (if used somewhere else)
        "bg-gradient-to-r",
        "from-primary-600",
        "to-accent-500",
        "hover:from-primary-700",
        "hover:to-accent-600",

        // Common
        "shadow-lg",
        "rounded-full",
        "bg-white",
        "dark:bg-gray-900",
        "text-gray-900",
        "dark:text-gray-100",
      ],
    },
  },

  plugins: [],
};
