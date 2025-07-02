// Location: /hooks/useMiniAppContext.tsx

"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";

interface MiniAppContextType {
  isMiniApp: boolean;
  isLoading: boolean;
  context: any;
}

const MiniAppContext = createContext<MiniAppContextType>({
  isMiniApp: false,
  isLoading: false,
  context: null,
});

export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  const { context } = useMiniKit();
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're in a MiniKit context
    setIsMiniApp(!!context);
    setIsLoading(false);
  }, [context]);

  return (
    <MiniAppContext.Provider value={{ isMiniApp, isLoading, context }}>
      {children}
    </MiniAppContext.Provider>
  );
}

export const useMiniAppContext = () => useContext(MiniAppContext);
