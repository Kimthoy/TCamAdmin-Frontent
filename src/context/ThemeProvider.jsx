// src/context/ThemeProvider.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";

const ThemeContext = createContext();

const readStored = () => {
  try {
    if (typeof window === "undefined") return "system";
    const v = localStorage.getItem("theme");
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
};

const getSystemPref = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readStored);

  const effectiveIsDark = useMemo(() => {
    if (theme === "system") return getSystemPref();
    return theme === "dark";
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;

    if (effectiveIsDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [effectiveIsDark, theme]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const handler = () => {
      if (theme === "system") {
        setTheme((t) => t); // trigger re-eval
      }
    };

    mq.addEventListener
      ? mq.addEventListener("change", handler)
      : mq.addListener(handler);

    return () =>
      mq.removeEventListener
        ? mq.removeEventListener("change", handler)
        : mq.removeListener(handler);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      if (prev === "dark") return "light";
      if (prev === "light") return "dark";
      return getSystemPref() ? "light" : "dark";
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, effectiveIsDark, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
export default ThemeProvider;
