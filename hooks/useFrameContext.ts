// Location: /hooks/useFrameContext.ts

import { useEffect, useState } from "react";

/**
 * Detect if the app is running inside a Farcaster Frame or other iframe.
 * You can expand this to parse frame context/state.
 */
export function useFrameContext() {
  const [isFrame, setIsFrame] = useState(false);

  useEffect(() => {
    try {
      setIsFrame(window.self !== window.top);
    } catch {
      setIsFrame(false);
    }
  }, []);

  return { isFrame };
}
