// Location: /app/page.tsx

"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

// ✅ Dynamic import with no SSR
const MiniKitApp = dynamic(
  () => import("@/components/MiniKitApp").then(mod => mod.MiniKitApp),
  { 
    ssr: false,
    loading: () => (
      <div className="container mx-auto px-2">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-primary"></div>
        </div>
      </div>
    )
  }
);

export default function App() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="container mx-auto px-2">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-primary"></div>
        </div>
      </div>
    );
  }

  return <MiniKitApp />;
}
