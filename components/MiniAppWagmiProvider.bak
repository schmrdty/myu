// Location: /components/MiniAppWagmiProvider.tsx

"use client";
import { useEffect, useState } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { sdk } from "@farcaster/frame-sdk";
import { getConfig as getWebConfig } from "@/lib/wagmi";

// Provides the correct wagmi config for web or Farcaster Mini App.
export function MiniAppWagmiProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(getWebConfig());

  useEffect(() => {
    // Detect mini app only on mount (client-side)
    sdk.isInMiniApp().then((isMini) => {
      if (isMini) {
        setConfig(
          createConfig({
            chains: [base],
            connectors: [farcasterFrame()],
            transports: {
              [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
            },
            ssr: true,
          }),
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
