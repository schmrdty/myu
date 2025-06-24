// Location: /components/ThemeToggle.tsx

import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <button
      className="ml-2 rounded-full px-3 py-1 bg-gray-700/40 border border-gray-500 text-cyber hover:bg-cyberglass hover:text-white transition"
      aria-label="Toggle color theme"
      title="Toggle theme (Ctrl/Cmd+J)"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      type="button"
    >
      {resolvedTheme === "dark" ? "🌙" : "🌞"}
    </button>
  );
}
