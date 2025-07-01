// Location: /components/ThemeToggle.tsx

import { useTheme } from "@/components/ThemeProvider";
import { MushroomIcon, CyberSunIcon } from "@/components/DemoComponents";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <button
      className="p-2 rounded-lg bg-cyberglass border-2 border-cyber-border hover:border-cyber-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyber-primary focus:ring-offset-2"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Currently ${resolvedTheme} theme (Ctrl/Cmd+J to toggle)`}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      type="button"
    >
      <span className="sr-only">Toggle theme</span>
      {resolvedTheme === "dark" ? (
        <MushroomIcon size={20} className="text-cyber-accent" aria-hidden="true" />
      ) : (
        <CyberSunIcon size={20} className="text-cyber-primary" aria-hidden="true" />
      )}
    </button>
  );
}
