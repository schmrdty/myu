// Location: /components/Frame.tsx

"use client";

import { ReactNode } from "react";

export function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="frame-container">
      {children}
    </div>
  );
}
