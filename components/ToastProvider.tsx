// Location: /components/ToastProvider.tsx

"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "@/components/ThemeProvider";

export function ToastProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: resolvedTheme === "dark" ? "#1e293b" : "#fff",
          color: resolvedTheme === "dark" ? "#f1f5f9" : "#0f172a",
          border: `1px solid ${resolvedTheme === "dark" ? "#334155" : "#e5e7eb"}`,
          boxShadow: resolvedTheme === "dark" 
            ? "0 10px 15px -3px rgba(0, 0, 0, 0.3)" 
            : "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        },
        success: {
          iconTheme: {
            primary: "#10b981",
            secondary: resolvedTheme === "dark" ? "#1e293b" : "#fff",
          },
        },
        error: {
          iconTheme: {
            primary: "#ef4444",
            secondary: resolvedTheme === "dark" ? "#1e293b" : "#fff",
          },
        },
      }}
    />
  );
}
