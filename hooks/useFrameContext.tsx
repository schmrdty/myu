  "use client";
import { createContext, useContext, useEffect, useState } from "react";
import { sdk } from "@farcaster/frame-sdk";

interface FrameContextType {
  isFrame: boolean;
  isLoading: boolean;
}

const FrameContext = createContext<FrameContextType>({
  isFrame: false,
  isLoading: true,
});

export function FrameProvider({ children }: { children: React.ReactNode }) {
  const [isFrame, setIsFrame] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we're in a Farcaster frame
    sdk.isInMiniApp()
      .then(setIsFrame)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <FrameContext.Provider value={{ isFrame, isLoading }}>
      {children}
    </FrameContext.Provider>
  );
}

export const useFrameContext = () => useContext(FrameContext);
