import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { base } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { getConfig } from "@/lib/wagmi";
import { CryptoPolyfill } from "@/components/CryptoPolyfill";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { ReactNode, useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1_000 * 60 * 60 * 24, // 24 hours for reconnection persistence
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;

  if (!apiKey || apiKey === "your-api-key") {
    console.error("Please set a valid NEXT_PUBLIC_ONCHAINKIT_API_KEY in your .env.local file");
  }

  useEffect(() => {
    // Suppress MetaMask/Chrome extension errors
    const originalError = console.error;
    console.error = (...args) => {
      const errorString = args[0]?.toString() || '';
      if (
        errorString.includes('chrome.runtime.sendMessage') ||
        errorString.includes('inpage.js') ||
        errorString.includes('Error in invocation of runtime.sendMessage')
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

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
