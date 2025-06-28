// Location: /lib/wagmi.ts

import { createConfig, http, cookieStorage, createStorage } from "wagmi";
import { base } from "wagmi/chains";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

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

  const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
  
  const connectors = isFrame()
    ? [
        farcasterFrame(), 
        injected(), 
        coinbaseWallet({ appName: "Myutruvian", preference: "smartWalletOnly" })
      ]
    : [
        injected(), 
        coinbaseWallet({ appName: "Myutruvian", preference: "smartWalletOnly" }),
        ...(projectId ? [walletConnect({ projectId, showQrModal: true })] : [])
      ];

  config = createConfig({
    chains: [base],
    connectors,
    transports: {
      [base.id]: http(
        process.env.NEXT_PUBLIC_BASE_RPC_URL || 
        process.env.NEXT_PUBLIC_RU2 ||
        `https://base-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
      ),
    },
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
  });

  return config;
}
