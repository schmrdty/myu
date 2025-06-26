// Location: /app/ClientRoot.tsx

"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { Providers } from "./providers";
import { ReactNode } from "react";

/**
 * Wraps the app with damn client-side providers.
 * Use this ONLY in layout.tsx to ensure context for client components.
 */
export default function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <ThemeProvider>{children}</ThemeProvider>
    </Providers>
  );
}
