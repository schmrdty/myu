// Location: /app/ClientRoot.tsx

"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { Providers } from "./providers";
import { FrameProvider } from "@/hooks/useFrameContext";
import { ReactNode } from "react";

export default function ClientRoot({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <FrameProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </FrameProvider>
    </Providers>
  );
}
