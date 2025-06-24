// Location: /components/ThemeProvider.tsx

"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light" | "system";
interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  // Apply theme to <html> root and manage CSS vars
  useEffect(() => {
    const root = window.document.documentElement;
    let active: "dark" | "light";
    if (theme === "system") {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      active = mql.matches ? "dark" : "light";
      setResolvedTheme(active);
      const handle = (e: MediaQueryListEvent) => setResolvedTheme(e.matches ? "dark" : "light");
      mql.addEventListener("change", handle);
      return () => mql.removeEventListener("change", handle);
    } else {
      active = theme;
      setResolvedTheme(active);
    }
    root.dataset.theme = active;
    root.classList.toggle("dark", active === "dark");
    root.classList.toggle("light", active === "light");
  }, [theme]);

  // Hotkey: Cmd/Ctrl+J to toggle theme
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
