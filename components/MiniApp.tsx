// Location: /components/MiniApp.tsx

"use client";

import { ReactNode } from "react";

export function MiniApp({ children }: { children: ReactNode }) {
  return (
    <div className="miniapp-container">
      {children}
    </div>
  );
}
