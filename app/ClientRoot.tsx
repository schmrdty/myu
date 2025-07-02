// Location: /app/ClientRoot.tsx

"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { Providers } from "./providers";
import { MiniAppProvider } from "@/hooks/useMiniAppContext";
import { ToastProvider } from "@/components/ToastProvider";
import { ReactNode } from "react";

export default function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <MiniAppProvider>
        <ThemeProvider>
          <ToastProvider />
          {children}
        </ThemeProvider>
      </MiniAppProvider>
    </Providers>
  );
}
