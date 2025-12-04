// src/hooks/useTheme.js
// Shim to preserve the old useTheme() array API so you don't have to change many imports.
// Internally uses ThemeProvider's context.

import { useThemeContext } from "../context/ThemeProvider";

export default function useTheme() {
  const { theme, setTheme, effectiveIsDark, toggleTheme } = useThemeContext();

  return [theme, setTheme, effectiveIsDark, toggleTheme];
}
