// Location: /components/ThemeToggle.tsx

import { useTheme } from "@/components/ThemeProvider";
import { MushroomIcon, CyberSunIcon } from "@/components/DemoComponents";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // 🌑 = moon, 🍄 = mushroom, ⚡️ = cyber sun, ☀️ = sun
  return (
    <button
      className="ml-2 rounded-full px-3 py-1 bg-cyberglass border border-cyber-primary text-cyber hover:bg-cyber-primary hover:text-black transition"
      aria-label="Toggle color theme"
      title="Toggle theme (Ctrl/Cmd+J)"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      type="button"
    >
      {resolvedTheme === "dark" ? <MushroomIcon size={22} /> : <CyberSunIcon size={22} />}
    </button>
  );
}
