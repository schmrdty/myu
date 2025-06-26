// Location: /lib/wagmi.ts

import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { coinbaseWallet, injected } from "wagmi/connectors";

// Memoize config for SSR and client
let config: ReturnType<typeof createConfig> | undefined;

/**
 * Returns wagmi config with:
 * - Farcaster Frame connector (for mini app/frames)
 * - Injected (Metamask etc) and Coinbase Wallet connectors (for web fallback)
 * Only uses Base mainnet.
 */
export function getConfig() {
  if (config) return config;

  config = createConfig({
    chains: [base],
    connectors: [
      // Frame-native connector for Farcaster
      farcasterFrame(),
      // Web fallback connectors (Metamask, Coinbase)
      injected(),
      coinbaseWallet({
        appName: "Myutruvian",
        preference: "smartWalletOnly",
      }),
    ],
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"),
    },
    ssr: true,
  });

  return config;
}
