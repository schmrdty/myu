// Location: /lib/wagmi.ts

import { createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { coinbaseWallet, injected } from "wagmi/connectors";

let config: ReturnType<typeof createConfig> | undefined;

function isFrame() {
  try {
    return typeof window !== "undefined" && window.self !== window.top;
  } catch {
    return false;
  }
}

export function getConfig() {
  if (config) return config;

  const connectors = isFrame()
    ? [farcasterFrame(), injected(), coinbaseWallet({ appName: "Myutruvian", preference: "smartWalletOnly" })]
    : [injected(), coinbaseWallet({ appName: "Myutruvian", preference: "smartWalletOnly" })];

  config = createConfig({
    chains: [base],
    connectors,
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || process.env.NEXT_PUBLIC_RU2),
    },
    ssr: true,
  });

  return config;
}
