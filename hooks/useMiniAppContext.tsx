  "use client";
import { createContext, useContext, useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface miniAppContextType {
  isMiniApp: boolean;
  isLoading: boolean;
}

const MiniAppContext = createContext<miniAppContextType>({
  isMiniApp: false,
  isLoading: true,
});

export function MiniAppProvider({ children }: { children: React.ReactNode }) {
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're in a Farcaster miniApp
    sdk.isInMiniApp()
      .then(setIsMiniApp)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <MiniAppContext.Provider value={{ isMiniApp, isLoading }}>
      {children}
    </MiniAppContext.Provider>
  );
}

export const useMiniAppContext = () => useContext(MiniAppContext);
