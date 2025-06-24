// Location: /app/providers.tsx

"use client";

import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { getConfig } from "@/lib/wagmi";
import { CryptoPolyfill } from "@/components/CryptoPolyfill";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { ReactNode } from "react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;
  
  if (!apiKey || apiKey === "your-api-key") {
    console.error("Please set a valid NEXT_PUBLIC_ONCHAINKIT_API_KEY in your .env.local file");
  }

  return (
    <WagmiProvider config={getConfig()}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={apiKey || ""}
          chain={base}
        >
          <MiniKitProvider chain={base}>
            <CryptoPolyfill />
            {children}
          </MiniKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
