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
  
  const appMetadata = {
    name: "Myutruvian",
    description: "Mint your Myutruvian NFT on Base - A decentralized creative ecosystem",
    url: process.env.NEXT_PUBLIC_HOST || "https://myu.schmidtiest.xyz",
    icons: [`${process.env.NEXT_PUBLIC_HOST || "https://myu.schmidtiest.xyz"}/icon.png`]
  };

  const connectors = isFrame()
    ? [
        farcasterFrame(), 
        // ✅ Simple injected without target object
        injected({
          shimDisconnect: true,
        }), 
        coinbaseWallet({ 
          appName: appMetadata.name,
          appLogoUrl: appMetadata.icons[0],
          // ✅ REMOVED smartWalletOnly - this was blocking browser wallets!
        })
      ]
    : [
        // ✅ Standard injected connector that works with all wallets
        injected({
          shimDisconnect: true,
        }),
        coinbaseWallet({ 
          appName: appMetadata.name,
          appLogoUrl: appMetadata.icons[0],
          // ✅ Allow both smart wallets AND browser extension wallets
        }),
        ...(projectId ? [walletConnect({ 
          projectId, 
          showQrModal: true,
          metadata: appMetadata,
          qrModalOptions: {
            themeMode: 'dark',
          }
        })] : [])
      ];

  config = createConfig({
    chains: [base],
    connectors,
    transports: {
      [base.id]: http(
        process.env.NEXT_PUBLIC_BASE_RPC_URL || 
        process.env.NEXT_PUBLIC_RU2 ||
        "https://base.llamarpc.com",
        {
          batch: true,
          retryCount: 3,
          retryDelay: 1000,
        }
      ),
    },
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    syncConnectedChain: true,
  });

  return config;
}
